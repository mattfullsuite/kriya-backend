WITH RECURSIVE employee_ids AS (
    SELECT DISTINCT att.employee_id
    FROM attendance att
        INNER JOIN emp e ON e.emp_num = att.employee_id
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
    WHERE att.date BETWEEN ? AND ?
        AND ed.company_id = ?
        AND (
            e.date_offboarding IS NULL
            OR e.date_separated IS NULL
        )
),
date_series AS (
    SELECT ? AS generated_date
    UNION ALL
    SELECT DATE_ADD(generated_date, INTERVAL 1 DAY)
    FROM date_series
    WHERE generated_date < ?
),
employee_dates AS (
    SELECT ed.employee_id,
        ds.generated_date AS att_date
    FROM employee_ids ed
        CROSS JOIN date_series ds
),
leave_dates AS (
    SELECT l.requester_id,
        l.leave_type,
        l.leave_from AS `leave_date`,
        l.leave_to,
        l.leave_status,
        CASE
            WHEN l.use_pto_points > 0.5 THEN 1
            WHEN l.use_pto_points > 0 THEN 0.5
            Else 0
        END AS `use_pto_points`,
        ed.company_id
    FROM leaves l
        INNER JOIN emp_designation ed ON ed.emp_id = l.requester_id
    WHERE ed.company_id = ?
        AND l.leave_from BETWEEN ? AND ?
        AND l.leave_status != 2
    UNION ALL
    SELECT requester_id,
        leave_type,
        DATE_ADD(`leave_date`, INTERVAL 1 DAY) AS `leave_date`,
        leave_to,
        leave_status,
        use_pto_points,
        company_id
    FROM leave_dates
    WHERE `leave_date` < leave_to
),
final_attendance AS (
    SELECT ed.employee_id,
        ed.att_date,
        att.`date` AS `date_old`,
        att.time_in AS `time_in_old`,
        att.time_out AS `time_out_old`,
        CASE
            WHEN att.time_in = ''
            OR att.time_in IS NULL THEN NULL -- DAYSHIFT
            WHEN att.time_in < att.time_out
            AND es.`start` < es.`end`
            AND att.time_in < es.`start` THEN es.`start`
            WHEN att.time_in < att.time_out
            AND es.`start` < es.`end`
            AND att.time_in > es.`start` THEN STR_TO_DATE(att.time_in, '%H:%i:%s') -- MIDNIGHT
            -- Early Start
            WHEN (
                att.time_in != ''
                AND att.time_in IS NOT NULL
            )
            AND es.`start` < es.`end`
            AND es.`start` = '00:00:00'
            AND att.time_in <= '23:59:59'
            AND att.time_in >= '12:00:00' THEN es.`start` -- Late Start
            WHEN es.`start` < es.`end`
            AND es.`start` = '00:00:00'
            AND att.time_in >= es.`start`
            AND att.time_in >= '00:00:00'
            AND att.time_in <= '06:00:00' THEN TIME_FORMAT(att.time_in, '%H:%i:%s') -- NIGHTSHIFT
            WHEN att.time_in > att.time_out
            AND es.`start` > es.`end`
            AND att.time_in < es.`start` THEN es.`start`
            WHEN att.time_in > att.time_out
            AND es.`start` > es.`end`
            AND att.time_in > es.`start` THEN TIME_FORMAT(att.time_in, '%H:%i:%s')
            ELSE TIME_FORMAT(att.time_in, '%H:%i:%s')
        END AS `time_in`,
        CASE
            -- Time Out is either Empty or Invalid date or NULL
            WHEN att.time_out = ''
            OR att.time_out = 'Invalid date'
            OR att.time_out IS NULL THEN NULL -- DAYSHIFT
            -- time in is less than time out and start is less than end and timeout is greater then end
            WHEN att.time_in < att.time_out
            AND es.`start` < es.`end`
            AND att.time_out > es.`end` THEN es.`end`
            WHEN att.time_in < att.time_out
            AND es.`start` < es.`end`
            AND att.time_out < es.`end` THEN TIME_FORMAT(att.time_out, '%H:00:00') -- MIDNIGHT
            -- ON TIME
            WHEN es.`start` < es.`end`
            AND es.`start` = '00:00:00'
            AND att.time_out <= '12:00:00'
            AND att.time_out >= '00:00:00' THEN es.`end` -- UNDERTIME
            WHEN es.`start` < es.`end`
            AND es.`start` = '00:00:00'
            AND att.time_out <= es.`end`
            AND att.time_out >= '00:00:00'
            AND att.time_out <= '06:00:00' THEN TIME_FORMAT(att.time_out, '%H:00:00') -- NIGHTSHIFT
            WHEN att.time_in > att.time_out
            AND es.`start` > es.`end`
            AND att.time_out > es.`end` THEN es.`end`
            WHEN att.time_in > att.time_out
            AND es.`start` > es.`end`
            AND att.time_out < es.`end` THEN TIME_FORMAT(att.time_out, '%H:00:00')
            ELSE TIME_FORMAT(att.time_out, '%H:00:00')
        END AS `time_out`,
        es.`start` AS `shift_start`,
        es.`end` AS `shift_end`,
        CASE
            WHEN es.`start` < es.`end` THEN -- Daytime shift
            GREATEST(
                TIME_TO_SEC(TIMEDIFF(es.`end`, es.`start`)) / 3600 - (
                    CASE
                        WHEN (
                            TIME(es.`start`) < '13:00:00'
                            AND TIME(es.`end`) > '12:00:00'
                        ) THEN 1 -- Overlaps 12:00 - 13:00
                        WHEN (
                            TIME(es.`start`) < '02:00:00'
                            AND TIME(es.`end`) > '01:00:00'
                        ) THEN 1 -- Overlaps 01:00 - 02:00
                        ELSE 0
                    END
                ),
                0 -- Ensure no negative values
            )
            ELSE GREATEST(
                (
                    TIME_TO_SEC(
                        TIMEDIFF(ADDTIME(es.`end`, '24:00:00'), es.`start`)
                    ) / 3600 - (
                        CASE
                            -- Check if the time range overlaps with 12:00 - 13:00
                            WHEN (
                                (
                                    TIME(es.`start`) < '13:00:00'
                                    OR TIME(ADDTIME(es.`end`, '24:00:00')) > '12:00:00'
                                )
                                AND NOT (
                                    TIME(es.`start`) > '13:00:00'
                                    AND TIME(ADDTIME(es.`end`, '24:00:00')) < '12:00:00'
                                )
                            ) THEN 1 -- Check if the time range overlaps with 01:00 - 02:00
                            WHEN (
                                (
                                    TIME(es.`start`) < '02:00:00'
                                    OR TIME(ADDTIME(es.`end`, '24:00:00')) > '01:00:00'
                                )
                                AND NOT (
                                    TIME(es.`start`) > '02:00:00'
                                    AND TIME(ADDTIME(es.`end`, '24:00:00')) < '01:00:00'
                                )
                            ) THEN 1
                            ELSE 0
                        END
                    )
                ),
                0 -- Ensure no negative values
            )
        END AS shift_hours,
        CASE
            WHEN att.`time_in` < att.`time_out` THEN -- Daytime shift
            GREATEST(
                TIME_TO_SEC(TIMEDIFF(att.`time_out`, att.`time_in`)) / 3600 - (
                    CASE
                        WHEN (
                            TIME(att.`time_in`) < '13:00:00'
                            AND TIME(att.`time_out`) > '12:00:00'
                        ) THEN 1 -- Overlaps 12:00 - 13:00
                        WHEN (
                            TIME(att.`time_in`) < '02:00:00'
                            AND TIME(att.`time_out`) > '01:00:00'
                        ) THEN 1 -- Overlaps 01:00 - 02:00
                        ELSE 0
                    END
                ),
                0 -- Ensure no negative values
            )
            ELSE GREATEST(
                (
                    TIME_TO_SEC(
                        TIMEDIFF(
                            ADDTIME(att.`time_out`, '24:00:00'),
                            att.`time_in`
                        )
                    ) / 3600 - (
                        CASE
                            -- Check if the time range overlaps with 12:00 - 13:00
                            WHEN (
                                (
                                    TIME(att.`time_in`) < '13:00:00'
                                    OR TIME(ADDTIME(att.`time_out`, '24:00:00')) > '12:00:00'
                                )
                                AND NOT (
                                    TIME(att.`time_in`) > '13:00:00'
                                    AND TIME(ADDTIME(att.`time_out`, '24:00:00')) < '12:00:00'
                                )
                            ) THEN 1 -- Check if the time range overlaps with 01:00 - 02:00
                            WHEN (
                                (
                                    TIME(att.`time_in`) < '02:00:00'
                                    OR TIME(ADDTIME(att.`time_out`, '24:00:00')) > '01:00:00'
                                )
                                AND NOT (
                                    TIME(att.`time_in`) > '02:00:00'
                                    AND TIME(ADDTIME(att.`time_out`, '24:00:00')) < '01:00:00'
                                )
                            ) THEN 1
                            ELSE 0
                        END
                    )
                ),
                0 -- Ensure no negative values
            )
        END AS att_hours
    FROM employee_dates ed
        LEFT JOIN attendance att ON att.employee_id = ed.employee_id
        AND (
            att.time_in != ''
            AND att.time_in IS NOT NULL
        )
        AND (
            att.time_out != ''
            AND att.time_out != 'Invalid date'
            AND att.time_out IS NOT NULL
        )
        AND att.`date` = ed.att_date
        LEFT JOIN emp_shift es ON es.emp_num = att.employee_id
),
split_shifts AS (
    -- Original shift day
    SELECT att.employee_id,
        att.att_date AS shift_date,
        CASE
            WHEN TIME(att.time_in) > TIME(att.time_out) THEN STR_TO_DATE(att.time_in, '%H:%i:%s')
            WHEN att.time_in IS NOT NULL
            AND att.time_in != '' THEN STR_TO_DATE(att.time_in, '%H:%i:%s')
            ELSE NULL
        END AS time_in,
        CASE
            WHEN TIME(att.time_in) > TIME(att.time_out) THEN '23:59:59'
            WHEN att.time_out IS NOT NULL
            AND att.time_out != '' THEN STR_TO_DATE(att.time_out, '%H:%i:%s')
            ELSE NULL
        END AS time_out,
        att.att_date AS original_date,
        att.time_in AS original_time_in,
        att.time_out AS original_time_out
    FROM final_attendance att
        INNER JOIN emp e ON att.employee_id = e.emp_num
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
    WHERE ed.company_id = ?
        AND att.att_date BETWEEN ? AND ?
    UNION ALL
    -- Next day portion for overnight shifts
    SELECT att.employee_id,
        DATE_ADD(att.att_date, INTERVAL 1 DAY) AS shift_date,
        CASE
            WHEN att.time_in IS NOT NULL
            AND att.time_in != '' THEN '00:00:00'
            ELSE NULL
        END AS time_in,
        CASE
            WHEN att.time_out IS NOT NULL
            AND att.time_out != '' THEN STR_TO_DATE(att.time_out, '%H:%i:%s')
            ELSE NULL
        END AS time_out,
        att.att_date AS original_date,
        att.time_in AS original_time_in,
        att.time_out AS original_time_out
    FROM final_attendance att
        INNER JOIN emp e ON att.employee_id = e.emp_num
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
    WHERE ed.company_id = ?
        AND att.att_date BETWEEN ? AND ?
        AND (
            TIME(att.time_in) > TIME(att.time_out)
            OR att.time_in IS NULL
            OR att.time_out IS NULL
        )
        AND (
            att.time_in IS NOT NULL
            AND att.time_in != ''
            AND att.time_out IS NOT NULL
            AND att.time_out != ''
        )
),
worked_hours AS (
    SELECT ss.employee_id,
        ss.shift_date,
        ss.time_in,
        ss.time_out,
        -- Calculate rendered_hours
        ROUND(
            CASE
                WHEN TIME(ss.time_out) = '23:59:59' THEN TIME_TO_SEC(TIMEDIFF('24:00:00', ss.time_in)) / 3600
                ELSE TIME_TO_SEC(TIMEDIFF(ss.time_out, ss.time_in)) / 3600
            END,
            2
        ) AS rendered_hours,
        -- Calculate break_hours
        CASE
            WHEN TIME(ss.time_in) <= '01:00:00'
            AND TIME(ss.time_out) >= '02:00:00' THEN 1
            WHEN TIME(ss.time_in) <= '12:00:00'
            AND TIME(ss.time_out) >= '13:00:00'
            AND ss.time_in < ss.time_out THEN 1
            ELSE 0
        END AS break_hours,
        -- Calculate worked_hours
        ROUND(
            CASE
                WHEN TIME(ss.time_out) = '23:59:59' THEN TIME_TO_SEC(TIMEDIFF('24:00:00', ss.time_in)) / 3600
                ELSE TIME_TO_SEC(TIMEDIFF(ss.time_out, ss.time_in)) / 3600
            END,
            2
        ) - CASE
            WHEN TIME(ss.time_in) <= '01:00:00'
            AND TIME(ss.time_out) >= '02:00:00' THEN 1
            WHEN TIME(ss.time_in) <= '12:00:00'
            AND TIME(ss.time_out) >= '13:00:00'
            AND ss.time_in < ss.time_out THEN 1
            ELSE 0
        END AS worked_hours
    FROM split_shifts ss
    WHERE ss.time_in IS NOT NULL
        AND ss.time_out IS NOT NULL
        AND original_time_in IS NOT NULL
        AND original_time_out IS NOT NULL
),
night_differential_hours AS (
    SELECT employee_id,
        shift_date,
        time_in,
        time_out,
        ROUND(
            CASE
                -- Time-in before 22:00 and Time-out at midnight
                WHEN (
                    time_in BETWEEN '14:00:00' AND '22:00:00'
                    AND time_out = '23:59:59'
                ) THEN 2 -- Time-in after 22:00 and Time-out at midnight
                WHEN (
                    time_in > '22:00:00'
                    AND time_out = '23:59:59'
                ) THEN 24 - TIME_TO_SEC(time_in) / 3600 -- Time-out after 10 PM but before midnight
                WHEN (
                    time_in BETWEEN '14:00:00' AND '22:00:00'
                    AND time_out BETWEEN '22:00:00' AND '23:59:59'
                ) THEN TIME_TO_SEC(time_out) / 3600 - 22 -- Use 22 instead of TIME_TO_SEC('22:00:00') / 3600-- Time-in early morning, time-out bewfore 6
                WHEN (
                    time_in >= '00:00:00'
                    AND time_in <= '01:00:00'
                    AND time_out <= '01:00:00'
                ) THEN (
                    (TIME_TO_SEC(time_out) - TIME_TO_SEC('00:00:00')) / 3600
                ) -- Time-in early morning, time-out bewfore 6
                WHEN (
                    time_in >= '00:00:00'
                    AND time_in <= '01:00:00'
                    AND time_out > '01:00:00'
                    AND time_out < '06:00:00'
                ) THEN (
                    (TIME_TO_SEC(time_out) - TIME_TO_SEC('00:00:00')) / 3600
                ) - 1 -- Time-in early morning, time-out late morning
                WHEN (
                    time_in > '00:00:00'
                    AND time_in < '06:00:00'
                    AND time_out >= '06:00:00'
                ) THEN (6 - TIME_TO_SEC(time_in) / 3600) - CASE
                    WHEN time_in <= '01:00:00'
                    AND time_out >= '06:00:00' THEN 1
                    ELSE 0
                END -- Time-in midnight, time-out late morning
                WHEN (
                    time_in = '00:00:00'
                    AND time_out >= '06:00:00'
                ) THEN 5
            END,
            2
        ) AS `night_differential_hours`
    FROM split_shifts
    WHERE (
            time_in >= '14:00:00'
            AND time_out >= '22:00:00'
            AND time_out <= '23:59:59'
        )
        OR (
            time_in >= '00:00:00'
            AND time_in <= '06:00:00'
            AND time_out >= '00:00:00'
        )
),
night_differential_totals AS (
    SELECT employee_id,
        SUM(night_differential_hours) AS night_differential_hours
    FROM night_differential_hours
    GROUP BY employee_id
),
holiday_hours AS (
    SELECT wh.employee_id,
        wh.shift_date,
        SUM(wh.worked_hours) AS worked_hours,
        wh.time_in,
        wh.time_out,
        h.h_type,
        SUM(
            CASE
                WHEN h.h_type = 'Special' THEN wh.worked_hours
                ELSE 0
            END
        ) AS 'special_holiday_hours',
        SUM(
            CASE
                WHEN h.h_type = 'Regular' THEN wh.worked_hours
                ELSE 0
            END
        ) AS 'regular_holiday_hours'
    FROM worked_hours wh
        INNER JOIN holiday h ON h.h_date = wh.shift_date
        AND h.company_id = ?
    GROUP BY wh.employee_id,
        wh.shift_date
),
holiday_totals AS(
    SELECT employee_id,
        SUM(special_holiday_hours) AS 'special_holiday_hours',
        SUM(regular_holiday_hours) AS 'regular_holiday_hours'
    FROM holiday_hours
    GROUP BY employee_id
),
overtime_hours AS (
    SELECT e.emp_num AS 'employee_id',
        ot.overtime_date AS 'shift_date',
        ot.overtime_type,
        ot.hours_requested,
        CASE
            WHEN ot.overtime_type = 'Regular Day Overtime' THEN ot.hours_requested
        END AS 'regular_ot',
        CASE
            WHEN ot.overtime_type = 'Rest Day Overtime' THEN ot.hours_requested
        END AS 'rest_day_ot',
        CASE
            WHEN ot.overtime_type = 'Special Holiday Overtime' THEN ot.hours_requested
        END AS 'special_holiday_ot',
        CASE
            WHEN ot.overtime_type = 'Regular Holiday Overtime' THEN ot.hours_requested
        END AS 'regular_holiday_ot'
    FROM overtime ot
        INNER JOIN emp e ON e.emp_id = ot.requester_id
        AND e.date_offboarding IS NULL
        AND e.date_separated IS NULL
        AND ot.overtime_status = 1
        AND ot.overtime_date BETWEEN ? AND ?
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
        AND company_id = ?
),
overtime_totals AS (
    SELECT employee_id,
        SUM(regular_ot) AS 'regular_ot_hours',
        SUM(rest_day_ot) AS 'rest_day_ot_hours',
        SUM(special_holiday_ot) AS 'special_holiday_ot_hours',
        SUM(regular_holiday_ot) AS 'regular_holiday_ot_hours'
    FROM overtime_hours
    GROUP BY employee_id
),
undertime_tardiness_hours AS (
    SELECT DISTINCT fa.employee_id,
        fa.att_date AS 'shift_date',
        fa.shift_hours,
        CASE
            WHEN (
                CASE
                    WHEN fa.time_in > fa.time_out THEN -- Compute time rendered, deduct 1 hour conditionally
                    GREATEST(
                        TIME_TO_SEC(
                            TIMEDIFF(ADDTIME(fa.time_out, '24:00:00'), fa.time_in)
                        ) / 3600 - (
                            CASE
                                WHEN TIME(fa.shift_start) <= '12:00:00'
                                AND TIME(fa.shift_end) >= '13:00:00' THEN 1 -- Overlaps 12:00 - 13:00
                                WHEN TIME(fa.shift_start) < '02:00:00'
                                AND TIME(fa.shift_end) > '01:00:00' THEN 1 -- Overlaps 01:00 - 02:00
                                ELSE 0
                            END
                        ),
                        4 -- Ensure it doesn't drop below 4
                    )
                    ELSE TIME_TO_SEC(TIMEDIFF(fa.time_out, fa.time_in)) / 3600 - (
                        CASE
                            WHEN TIME(fa.time_in) <= '12:00:00'
                            AND TIME(fa.time_out) >= '13:00:00' THEN 1 -- Overlaps 12:00 - 13:00
                            ELSE 0
                        END
                    )
                END
            ) >= ot.hours_requested
            AND ot.overtime_status = 1
            AND ld.leave_status IS NULL
            AND h.h_type IS NULL THEN 0
            WHEN (
                fa.time_out > fa.time_in
                AND ld.leave_status IN (0, 1)
                AND ld.leave_type LIKE '%(Half Day)%'
                AND ot.hours_requested IS NULL
                AND ot.overtime_status IS NULL
            ) THEN CASE
                WHEN (
                    TIME_TO_SEC(TIMEDIFF(fa.time_in, fa.shift_start)) / 3600
                ) > 4 THEN ABS(
                    4 - (
                        TIME_TO_SEC(TIMEDIFF(fa.time_in, fa.shift_start)) / 3600
                    )
                )
                ELSE TIME_TO_SEC(TIMEDIFF(fa.time_in, fa.shift_start)) / 3600
            END
            WHEN IFNULL(fa.shift_hours, 8) - (
                CASE
                    WHEN fa.time_in > fa.time_out THEN -- Compute time rendered, deduct 1 hour conditionally
                    GREATEST(
                        TIME_TO_SEC(
                            TIMEDIFF(ADDTIME(fa.time_out, '24:00:00'), fa.time_in)
                        ) / 3600 - (
                            CASE
                                WHEN TIME_TO_SEC(
                                    TIMEDIFF(ADDTIME(fa.time_out, '24:00:00'), fa.time_in)
                                ) / 3600 > 4 THEN 1
                                ELSE 0
                            END
                        ),
                        4 -- Ensure it doesn't drop below 4
                    )
                    ELSE GREATEST(
                        TIME_TO_SEC(TIMEDIFF(fa.time_out, fa.time_in)) / 3600 - (
                            CASE
                                WHEN TIME_TO_SEC(TIMEDIFF(fa.time_out, fa.time_in)) / 3600 > 4 THEN 1
                                ELSE 0
                            END
                        ),
                        4 -- Ensure it doesn't drop below 4
                    )
                END
            ) <= 4
            AND ld.leave_status IN (0, 1)
            AND ld.leave_type LIKE '%(Half Day)%'
            AND ot.hours_requested IS NULL
            AND ot.overtime_status IS NULL THEN 0
            ELSE IFNULL(
                GREATEST(
                    IFNULL(fa.shift_hours, 8) - (
                        CASE
                            WHEN fa.time_in > fa.time_out THEN -- Compute time rendered, deduct 1 hour conditionally
                            GREATEST(
                                TIME_TO_SEC(
                                    TIMEDIFF(ADDTIME(fa.time_out, '24:00:00'), fa.time_in)
                                ) / 3600 - (
                                    CASE
                                        WHEN TIME_TO_SEC(
                                            TIMEDIFF(ADDTIME(fa.time_out, '24:00:00'), fa.time_in)
                                        ) / 3600 >= 5 THEN 1
                                        ELSE 0
                                    END
                                ),
                                4 -- Ensure it doesn't drop below 4
                            )
                            ELSE TIME_TO_SEC(TIMEDIFF(fa.time_out, fa.time_in)) / 3600 - (
                                CASE
                                    WHEN TIME(fa.time_in) <= '12:00:00'
                                    AND TIME(fa.time_out) >= '13:00:00' THEN 1 -- Overlaps 12:00 - 13:00
                                    WHEN TIME(fa.time_in) < '02:00:00'
                                    AND TIME(fa.time_out) > '01:00:00' THEN 1 -- Overlaps 01:00 - 02:00
                                    ELSE 0
                                END
                            )
                        END
                    ),
                    0
                ),
                0
            )
        END AS 'undertime_tardiness_hours',
        CASE
            WHEN fa.time_in > fa.time_out THEN -- Compute time rendered, deduct 1 hour conditionally
            GREATEST(
                TIME_TO_SEC(
                    TIMEDIFF(ADDTIME(fa.time_out, '24:00:00'), fa.time_in)
                ) / 3600 - (
                    CASE
                        WHEN TIME(fa.shift_start) <= '12:00:00'
                        AND TIME(fa.shift_end) >= '13:00:00' THEN 1 -- Overlaps 12:00 - 13:00
                        WHEN TIME(fa.shift_start) < '02:00:00'
                        AND TIME(fa.shift_end) > '01:00:00' THEN 1 -- Overlaps 01:00 - 02:00
                        ELSE 0
                    END
                ),
                4 -- Ensure it doesn't drop below 4
            )
            ELSE TIME_TO_SEC(TIMEDIFF(fa.time_out, fa.time_in)) / 3600 - (
                CASE
                    WHEN TIME(fa.time_in) <= '12:00:00'
                    AND TIME(fa.time_out) >= '13:00:00' THEN 1 -- Overlaps 12:00 - 13:00
                    ELSE 0
                END
            )
        END as 'worked_hours',
        fa.time_in,
        fa.time_out,
        ot.hours_requested,
        ot.overtime_status,
        ld.leave_status,
        ld.`use_pto_points`,
        h.h_type
    FROM final_attendance fa
        LEFT JOIN emp e ON e.emp_num = fa.employee_id
        LEFT JOIN overtime ot ON ot.requester_id = e.emp_id
        AND ot.overtime_date = fa.att_date
        LEFT JOIN leave_dates ld ON ld.requester_id = e.emp_id
        AND ld.leave_date = fa.att_date
        LEFT JOIN holiday h ON h.h_date = fa.att_date
),
undertime_tardiness_totals AS (
    SELECT employee_id,
        SUM(undertime_tardiness_hours) AS 'undertime_tardiness_hours'
    FROM undertime_tardiness_hours
    GROUP BY employee_id
),
consolidated_att_leaves_holidays AS (
    SELECT att.employee_id,
        att.att_date,
        att.time_in,
        att.time_out,
        ld.leave_type,
        ld.leave_status,
        ld.use_pto_points,
        ot.hours_requested,
        ot.overtime_status,
        h.h_name,
        h.h_type
    FROM final_attendance att
        INNER JOIN emp e ON e.emp_num = att.employee_id
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
        AND ed.company_id = ?
        LEFT JOIN overtime ot ON ot.requester_id = e.emp_id
        AND ot.overtime_date = att.att_date
        LEFT JOIN holiday h ON h.h_date = att.att_date
        LEFT JOIN leave_dates ld ON ld.requester_id = e.emp_id
        AND ld.leave_date = att.att_date
    WHERE e.date_offboarding IS NULL
        AND e.date_separated IS NULL
),
holiday_sandwich AS (
    SELECT h.*,
        -- Find the previous valid workday before the holiday
        CASE
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 1 DAY)) BETWEEN 2 AND 6 -- Monday to Friday
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 1 DAY)
                    AND h1.h_type IN ('Special', 'Regular') -- Exclude special or regular holidays
            ) THEN DATE_SUB(h.h_date, INTERVAL 1 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 2 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 2 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 2 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 3 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 3 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 3 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 4 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 4 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 4 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 5 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 5 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 5 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 6 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 6 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 6 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 7 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 7 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 7 DAY)
            ELSE NULL -- No valid workday found
        END AS start_date,
        -- Find the previous special holiday before the holiday
        CASE
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 1 DAY)) BETWEEN 2 AND 6 -- Monday to Friday
            AND EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 1 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 1 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 2 DAY)) BETWEEN 2 AND 6 -- Monday to Friday
            AND EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 2 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 2 DAY)
            WHEN DAYOFWEEK(DATE_SUB(h.h_date, INTERVAL 3 DAY)) BETWEEN 2 AND 6 -- Monday to Friday
            AND EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_SUB(h.h_date, INTERVAL 3 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_SUB(h.h_date, INTERVAL 3 DAY)
            ELSE NULL -- No valid workday found
        END AS start_holiday_date,
        -- Find the next valid workday after the holiday
        CASE
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 1 DAY)) BETWEEN 2 AND 6 -- Monday to Friday
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 1 DAY)
                    AND h1.h_type IN ('Special', 'Regular') -- Exclude special or regular holidays
            ) THEN DATE_ADD(h.h_date, INTERVAL 1 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 2 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 2 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 2 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 3 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 3 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 3 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 4 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 4 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 4 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 5 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 5 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 5 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 6 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 6 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 6 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 7 DAY)) BETWEEN 2 AND 6
            AND NOT EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 7 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 7 DAY)
            ELSE NULL -- No valid workday found
        END AS end_date,
        -- Find the next valid workday after the holiday
        CASE
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 1 DAY)) BETWEEN 2 AND 6 -- Monday to Friday
            AND EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 1 DAY)
                    AND h1.h_type IN ('Special', 'Regular') -- Exclude special or regular holidays
            ) THEN DATE_ADD(h.h_date, INTERVAL 1 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 2 DAY)) BETWEEN 2 AND 6
            AND EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 2 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 2 DAY)
            WHEN DAYOFWEEK(DATE_ADD(h.h_date, INTERVAL 3 DAY)) BETWEEN 2 AND 6
            AND EXISTS (
                SELECT 1
                FROM holiday h1
                WHERE h1.h_date = DATE_ADD(h.h_date, INTERVAL 3 DAY)
                    AND h1.h_type IN ('Special', 'Regular')
            ) THEN DATE_ADD(h.h_date, INTERVAL 3 DAY)
            ELSE NULL -- No valid workday found
        END AS end_holiday_date
    FROM holiday h
    WHERE h.h_type = 'Regular'
        AND h.h_date BETWEEN ? AND ?
),
deductible_absences AS(
    SELECT DISTINCT ed.employee_id,
        ed.att_date,
        CASE
            WHEN catlh.time_in IS NULL
            AND catlh.time_out IS NULL
            AND catlh.use_pto_points = 0
            AND catlh.leave_status = 1
            AND catlh.leave_type NOT LIKE '%(Half Day)'
            AND catlh.h_name IS NULL
            AND catlh.h_type IS NULL THEN 1
            WHEN (
                catlh.time_in IS NULL
                AND catlh.time_out IS NULL
            )
            AND (
                catlh.time_in IS NOT NULL
                AND catlh.time_out IS NOT NULL
            )
            AND catlh.use_pto_points = 0
            AND (
                catlh.leave_status = 1
                OR catlh.leave_status = 0
            )
            AND catlh.leave_type LIKE '%(Half Day)'
            AND catlh.h_name IS NULL
            AND catlh.h_type IS NULL THEN 0.5
        END AS unpaid_leaves,
        CASE
            WHEN catlh.time_in IS NULL
            AND catlh.time_out IS NULL
            AND catlh.use_pto_points >= 0
            AND catlh.leave_status = 0
            AND catlh.leave_type NOT LIKE '%(Half Day)' THEN 1
            WHEN (
                catlh.time_in IS NULL
                OR catlh.time_in IS NOT NULL
            )
            AND (
                catlh.time_out IS NULL
                OR catlh.time_out IS NOT NULL
            )
            AND catlh.use_pto_points >= 0
            AND catlh.leave_status = 0
            AND catlh.leave_type LIKE '%(Half Day)' THEN 0.5
        END AS pending_leaves,
        CASE
            WHEN catlh.time_in IS NULL
            AND catlh.time_out IS NULL
            AND catlh.use_pto_points >= 0
            AND catlh.leave_status = 2
            AND catlh.leave_type NOT LIKE '%(Half Day)' THEN 1
            WHEN catlh.time_in IS NULL
            AND catlh.time_out IS NULL
            AND catlh.use_pto_points >= 0
            AND catlh.leave_status = 2
            AND catlh.leave_type LIKE '%(Half Day)' THEN 1
            WHEN catlh.time_in IS NOT NULL
            AND catlh.time_out IS NOT NULL
            AND catlh.use_pto_points >= 0
            AND catlh.leave_status = 2
            AND catlh.leave_type LIKE '%(Half Day)' THEN 0.5
        END AS declined_leaves,
        CASE
            WHEN catlh.time_in IS NULL
            AND catlh.time_out IS NULL
            AND catlh.use_pto_points IS NULL
            AND catlh.leave_status iS NULL
            AND catlh.h_type IS NULL
            AND DAYOFWEEK(ed.att_date) NOT IN (1, 7) THEN 1
        END AS awol,
        CASE
            WHEN catlh.time_in IS NULL
            AND catlh.time_out IS NULL
            AND (
                catlh.use_pto_points IS NULL
                OR catlh.use_pto_points = 0
            )
            AND (
                catlh.leave_status IS NULL
                or catlh.use_pto_points = 0
            )
            AND catlh.h_name IS NOT NULL
            AND catlh.h_type = 'Special'
            AND DAYOFWEEK(catlh.att_date) NOT IN (1, 7) THEN 1
        END AS special_holiday_abs,
        CASE
            -- Check for attendance on Saturday (to identify Tuesday to Saturday schedule)
            WHEN DAYOFWEEK(catlh.att_date) = 7
            AND (
                (
                    catlh.time_in IS NOT NULL
                    AND catlh.time_out IS NOT NULL
                    AND catlh.overtime_status IS NULL
                )
                OR (
                    catlh.leave_status = 1
                    AND catlh.use_pto_points > 0
                )
            ) THEN 1
            ELSE 0
        END AS saturday,
        catlh.time_in,
        catlh.time_out,
        catlh.use_pto_points,
        catlh.leave_status,
        catlh.h_type,
        DAYOFWEEK(ed.att_date)
    FROM employee_dates ed
        LEFT JOIN consolidated_att_leaves_holidays catlh ON ed.employee_id = catlh.employee_id
        AND ed.att_date = catlh.att_date
),
deductible_absences_totals AS (
    SELECT employee_id,
        SUM(unpaid_leaves) AS 'unpaid_leaves',
        SUM(pending_leaves) AS 'pending_leaves',
        SUM(declined_leaves) AS 'declined_leaves',
        SUM(awol) AS 'awol',
        SUM(special_holiday_abs) AS 'special_holiday_abs',
        SUM(saturday) AS 'saturday'
    FROM deductible_absences
    GROUP BY employee_id
),
weekend_days AS (
    SELECT weekend_records.employee_id,
        SUM(weekend_records.rendered_days) AS weekend_rendered,
        SUM(IFNULL(weekend_records.filed_pto, 0)) AS weekend_pto
    FROM (
            SELECT DISTINCT att.employee_id,
                att.att_date,
                att.time_in,
                att.time_out,
                l.leave_date,
                l.leave_status,
                l.use_pto_points,
                CASE
                    WHEN att.time_out = '00:00:00' THEN CASE
                        WHEN (
                            (
                                TIME_TO_SEC('24:00:00') - TIME_TO_SEC(att.time_in)
                            ) / 3600
                        ) >= 8 THEN 1
                        ELSE (
                            (
                                TIME_TO_SEC('24:00:00') - TIME_TO_SEC(att.time_in)
                            ) / 3600
                        ) / 8
                    END
                    WHEN att.time_in > att.time_out THEN TIME_TO_SEC(ADDTIME(att.time_out, '24:00:00')) - TIME_TO_SEC(att.time_in) / 3600 / 8
                    WHEN att.time_in < att.time_out THEN CASE
                        WHEN (
                            (
                                TIME_TO_SEC(att.time_out) - TIME_TO_SEC(att.time_in)
                            ) / 3600
                        ) >= 8 THEN 1
                        WHEN (
                            (
                                TIME_TO_SEC(att.time_out) - TIME_TO_SEC(att.time_in)
                            ) / 3600
                        ) >= 4 THEN 0.5
                        ELSE 0
                    END
                    ELSE 0
                END AS rendered_days,
                CASE
                    WHEN l.leave_date IS NOT NULL
                    AND l.leave_status = 1
                    AND l.use_pto_points > 0 THEN l.use_pto_points
                    ELSE 0
                END AS filed_pto
            FROM final_attendance att
                INNER JOIN emp e ON e.emp_num = att.employee_id
                AND e.date_separated IS NULL
                LEFT JOIN leave_dates l ON l.requester_id = e.emp_id
                AND l.leave_date = att.att_date
                LEFT JOIN overtime ot ON ot.requester_id = e.emp_id
                AND ot.overtime_date = att.att_date
                AND DAYOFWEEK(ot.overtime_date) IN (1, 7)
                AND ot.overtime_date BETWEEN ? AND ?
            WHERE DAYOFWEEK(att.att_date) IN (1, 7)
                AND att.time_in IS NOT NULL
                AND att.time_out IS NOT NULL
                AND ot.overtime_id IS NULL
        ) AS weekend_records
    GROUP BY weekend_records.employee_id
),
merged_table AS (
    SELECT eid.employee_id,
        ndt.night_differential_hours,
        ht.special_holiday_hours,
        ht.regular_holiday_hours,
        ot.regular_ot_hours,
        ot.rest_day_ot_hours,
        ot.special_holiday_ot_hours,
        ot.regular_holiday_ot_hours,
        utt.undertime_tardiness_hours,
        (
            IFNULL(da.unpaid_leaves, 0) + IFNULL(da.pending_leaves, 0) + IFNULL(da.declined_leaves, 0) + IFNULL(da.awol, 0) + IFNULL(da.special_holiday_abs, 0) - IFNULL(da.saturday, 0)
        ) AS absences_days,
        da.unpaid_leaves,
        da.pending_leaves,
        da.declined_leaves,
        da.awol,
        da.special_holiday_abs
    FROM employee_ids eid
        LEFT JOIN undertime_tardiness_totals utt ON utt.employee_id = eid.employee_id -- FOr investigation for Duplicate rows
        LEFT JOIN night_differential_totals ndt ON ndt.employee_id = eid.employee_id
        LEFT JOIN holiday_totals ht ON ht.employee_id = eid.employee_id
        LEFT JOIN overtime_totals ot ON ot.employee_id = eid.employee_id
        LEFT JOIN deductible_absences_totals da ON da.employee_id = eid.employee_id
    ORDER BY employee_id
),
final_table AS (
    SELECT e.emp_num AS 'Employee ID',
        e.s_name AS 'Last Name',
        e.f_name AS 'First Name',
        e.m_name AS 'Middle Name',
        CONCAT(
            e.s_name,
            ', ',
            e.f_name,
            ' ',
            IF(
                e.m_name IS NOT NULL
                AND e.m_name != '',
                CONCAT(LEFT(e.m_name, 1), '.'),
                ''
            )
        ) AS 'Full Name',
        e.work_email AS 'Email',
        p.position_name AS 'Job Title',
        e.date_hired AS 'Hire Date',
        ROUND(
            (
                IFNULL(es.base_pay, 0) / cc.monthly_payroll_frequency
            ),
            2
        ) AS 'Basic Pay',
        --  * ((IFNULL(es.base_pay, 0)/cc.monthly_payroll_frequency)/8)
        ROUND(
            IFNULL(mt.night_differential_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 *.10
            ),
            2
        ) AS 'Night Differential',
        ROUND(
            IFNULL(mt.special_holiday_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 *.30
            ),
            2
        ) AS 'Special Holiday Premium Pay',
        ROUND(
            (
                IFNULL(mt.regular_holiday_hours, 0) * (
                    IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.00
                )
            ),
            2
        ) AS 'Regular Holiday Premium Pay',
        ROUND(
            IFNULL(mt.regular_ot_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.25
            ),
            2
        ) AS 'Regulary OT',
        ROUND(
            IFNULL(mt.rest_day_ot_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.3
            ),
            2
        ) AS 'Rest Day OT',
        ROUND(
            IFNULL(mt.special_holiday_ot_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.3 * 1.25
            ),
            2
        ) AS 'Special Holiday OT',
        ROUND(
            IFNULL(mt.regular_holiday_ot_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 2.25
            ),
            2
        ) AS 'Regular Holiday OT',
        ROUND(
            IFNULL(mt.undertime_tardiness_hours, 0) * (
                IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8
            ) * -1,
            2
        ) AS 'Undertime/Tardiness',
        ROUND(
            IFNULL(mt.absences_days, 0) * (IFNULL(es.base_pay, 0) / cc.monthly_working_days) * -1,
            2
        ) AS 'Absences',
        IFNULL(rr.net_salary_1, '0.00') AS 'Net Pay (PP-1)',
        IFNULL(rr.net_salary_2, '0.00') AS 'Net Pay (PP-2)',
        IFNULL(rr.net_salary_3, '0.00') AS 'Net Pay (PP-3)'
    FROM emp e
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
        INNER JOIN position p ON p.position_id = ed.position_id
        INNER JOIN (
            SELECT company_id,
                MAX(
                    CASE
                        WHEN configuration_name = 'Monthly Working Days' THEN configuration_value
                    END
                ) AS monthly_working_days,
                MAX(
                    CASE
                        WHEN configuration_name = 'Monthly Payroll Frequency' THEN configuration_value
                    END
                ) AS monthly_payroll_frequency
            FROM company_configuration
            WHERE company_id = ?
            GROUP BY company_id
        ) cc on cc.company_id = ed.company_id
        LEFT JOIN (
            SELECT es_latest.emp_id,
                es.base_pay
            FROM (
                    SELECT emp_id,
                        MAX(created_at) AS latest_salary_date
                    FROM emp_salary
                    GROUP BY emp_id
                ) es_latest
                INNER JOIN emp_salary es ON es_latest.emp_id = es.emp_id
                AND es_latest.latest_salary_date = es.created_at
        ) es ON es.emp_id = e.emp_id
        LEFT JOIN (
            SELECT emp_num,
                IFNULL(
                    MAX(
                        CASE
                            WHEN `rank` = 1 THEN ranked_rows.net_salary
                        END
                    ),
                    '0.00'
                ) AS net_salary_1,
                IFNULL(
                    MAX(
                        CASE
                            WHEN `rank` = 2 THEN ranked_rows.net_salary
                        END
                    ),
                    '0.00'
                ) AS net_salary_2,
                IFNULL(
                    MAX(
                        CASE
                            WHEN `rank` = 3 THEN ranked_rows.net_salary
                        END
                    ),
                    '0.00'
                ) AS net_salary_3
            FROM (
                    SELECT emp_num,
                        net_salary,
                        JSON_UNQUOTE(JSON_EXTRACT(dates, '$.Payment')) AS payment_date,
                        ROW_NUMBER() OVER (
                            PARTITION BY emp_num
                            ORDER BY JSON_UNQUOTE(JSON_EXTRACT(dates, '$.Payment')) DESC
                        ) AS `rank`
                    FROM payslip
                    WHERE JSON_UNQUOTE(JSON_EXTRACT(dates, '$.Payment')) < ?
                ) AS ranked_rows
            GROUP BY emp_num
        ) rr ON e.emp_num = rr.emp_num
        LEFT JOIN merged_table mt ON mt.employee_id = e.emp_num
    WHERE e.date_offboarding IS NULL
        AND e.date_separated IS NULL
        AND ed.company_id = ?
        AND es.base_pay != 0
    ORDER BY e.emp_num
)
SELECT *
FROM final_table