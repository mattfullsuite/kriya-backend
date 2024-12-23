WITH RECURSIVE employee_ids AS (
    SELECT DISTINCT att.employee_id
    FROM attendance att
        INNER JOIN emp e ON e.emp_num = att.employee_id
        INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
    WHERE att.date BETWEEN ? AND ?
        AND ed.company_id = ?
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
final_attendance AS (
    SELECT ed.employee_id,
        ed.att_date,
        att.time_in,
        att.time_out
    FROM employee_dates ed
        LEFT JOIN attendance att ON att.employee_id = ed.employee_id
        AND att.date = ed.att_date
),
leave_dates AS (
    SELECT l.requester_id,
        l.leave_type,
        l.leave_from AS `leave_date`,
        l.leave_to,
        l.leave_status,
        CASE
            WHEN l.use_pto_points > 0 THEN 1
            Else 0
        END AS `use_pto_points`,
        ed.company_id
    FROM leaves l
        INNER JOIN emp_designation ed ON ed.emp_id = l.requester_id
    WHERE ed.company_id = ?
        AND l.leave_from BETWEEN ? AND ?
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
)
SELECT e.emp_num AS 'Employee ID',
    e.s_name AS 'Last Name',
    e.f_name AS 'First Name',
    e.m_name AS 'Middle Name',
    e.work_email AS 'Email',
    p.position_name AS 'Job Title',
    e.date_hired AS 'Hire Date',
    ROUND(
        (
            IFNULL(es.base_pay, 0) / cc.monthly_payroll_frequency
        ),
        2
    ) AS 'Basic Pay',
    ROUND(
        (
            IFNULL(ns.total_night_shift, 0) - IFNULL(ns.total_night_break, 0)
        ) * (
            IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 *.10
        ),
        2
    ) AS 'Night Differential',
    ROUND(
        IFNULL(ot.regular_ot, 0) * (
            IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.25
        ),
        2
    ) AS 'Regular OT',
    ROUND(
        IFNULL(ot.special_holiday_ot, 0) * (
            IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.3 * 1.25
        ),
        2
    ) AS 'Special Holiday OT',
    ROUND(
        IFNULL(ot.regular_holiday_ot, 0) * (
            IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 2.25
        ),
        2
    ) AS 'Regular Holiday OT',
    ROUND(
        IFNULL(ot.rest_day_ot, 0) * (
            IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.3
        ),
        2
    ) AS 'Rest Day OT',
    ROUND(
        (
            IFNULL(hol.special, 0) * IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 *.30
        ),
        2
    ) AS 'Special Holiday Premium Pay',
    ROUND(
        (
            IFNULL(hol.regular, 0) * IFNULL(es.base_pay, 0) / cc.monthly_working_days / 8 * 1.00
        ),
        2
    ) AS 'Regular Holiday Premium Pay',
    ROUND(
        (
            CASE
                WHEN (
                    (
                        IFNULL(deductible_absences.unpaid_leave, 0) + IFNULL(deductible_absences.awol, 0) + IFNULL(deductible_absences.absent_special_holiday, 0) - IFNULL(weekend_days.weekend_rendered, 0) - IFNULL(weekend_days.weekend_pto, 0)
                    ) * (IFNULL(es.base_pay, 0) / cc.monthly_working_days) * -1
                ) > 0 THEN 0
                ELSE (
                    (
                        IFNULL(deductible_absences.unpaid_leave, 0) + IFNULL(deductible_absences.awol, 0) + IFNULL(deductible_absences.absent_special_holiday, 0) - IFNULL(weekend_days.weekend_rendered, 0) - IFNULL(weekend_days.weekend_pto, 0)
                    ) * (IFNULL(es.base_pay, 0) / cc.monthly_working_days) * -1
                )
            END
        ),
        2
    ) AS 'Absences',
    ROUND(
        (IFNULL(und.undertime, 0)) * (IFNULL(es.base_pay, 0) / cc.monthly_working_days) * -1,
        2
    ) AS 'Undertime/Tardiness',
    IFNULL(rr.net_salary_1, '0.00') AS 'Net Pay (PP-1)',
    IFNULL(rr.net_salary_2, '0.00') AS 'Net Pay (PP-2)',
    IFNULL(rr.net_salary_3, '0.00') AS 'Net Pay (PP-3)',
    IFNULL(und.undertime, 0) AS 'Undertime/Tardiness Hours',
    IFNULL(ab.non_pto, 0) AS 'Unpaid Leaves',
    IFNULL(ab.pto_used, 0) AS 'Filed PTO Days',
    IFNULL(ab.total_absences, 0) AS 'Total Absences'
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
    LEFT JOIN (
        SELECT e.emp_id,
            SUM(
                IFNULL(
                    IF(
                        h.h_type = 'Special',
                        ROUND(
                            (
                                LEAST(
                                    (
                                        (
                                            IF(
                                                att.time_in > att.time_out,
                                                TIME_TO_SEC(
                                                    TIMEDIFF(ADDTIME(att.time_out, '24:00:00'), att.time_in)
                                                ),
                                                TIME_TO_SEC(TIMEDIFF(att.time_out, att.time_in))
                                            ) / 3600
                                        ) - 1
                                    ),
                                    8
                                )
                            ),
                            2
                        ),
                        0
                    ),
                    0
                )
            ) AS 'special',
            SUM(
                IFNULL(
                    IF(
                        h.h_type = 'Regular',
                        ROUND(
                            (
                                LEAST(
                                    (
                                        (
                                            IF(
                                                att.time_in > att.time_out,
                                                TIME_TO_SEC(
                                                    TIMEDIFF(ADDTIME(att.time_out, '24:00:00'), att.time_in)
                                                ),
                                                TIME_TO_SEC(TIMEDIFF(att.time_out, att.time_in))
                                            ) / 3600
                                        ) - 1
                                    ),
                                    8
                                )
                            ),
                            2
                        ),
                        0
                    ),
                    0
                )
            ) AS 'regular'
        FROM attendance att
            INNER JOIN emp e ON e.emp_num = att.employee_id
            INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
            INNER JOIN position pos ON pos.position_id = ed.position_id
            INNER JOIN holiday h ON h.h_date = att.date
        WHERE ed.company_id = ?
            AND att.date >= ?
            AND att.date <= ?
            AND att.time_in LIKE '%:%'
            AND att.time_out LIKE '%:%'
        GROUP BY e.emp_id
    ) hol ON hol.emp_id = e.emp_id
    LEFT JOIN(
        SELECT leave_records.requester_id,
            ROUND((IFNULL(`non_pto`.num_absences, 0)), 2) AS non_pto,
            IFNULL(pto.pto_used, 0) AS pto_used,
            ROUND(
                (
                    IFNULL(`non_pto`.num_absences, 0) + IFNULL(pto.num_absences, 0)
                ),
                2
            ) AS total_absences
        FROM (
                SELECT requester_id
                FROM leaves l
                    INNER JOIN emp_designation ed ON l.requester_id = ed.emp_id
                WHERE ed.company_id = ?
                    AND l.leave_from >= ?
                    AND l.leave_to <= ?
                    AND l.leave_status = 1
                GROUP BY l.requester_id
            ) as leave_records
            LEFT JOIN(
                SELECT requester_id,
                    SUM(
                        (
                            CASE
                                WHEN l.leave_type LIKE '%(Half Day)%' THEN 0.5
                                ELSE (DATEDIFF(leave_to, leave_from) + 1) - (FLOOR(DATEDIFF(leave_to, leave_from) / 7) * 2) - (
                                    CASE
                                        WHEN WEEKDAY(leave_from) = 6 THEN 1
                                        ELSE 0
                                    END
                                ) - (
                                    CASE
                                        WHEN WEEKDAY(leave_to) = 6 THEN 1
                                        ELSE 0
                                    END
                                ) - (
                                    CASE
                                        WHEN WEEKDAY(leave_from) = 5
                                        AND DATEDIFF(leave_to, leave_from) >= 7 THEN 1
                                        ELSE 0
                                    END
                                )
                            END
                        )
                    ) AS num_absences
                FROM leaves l
                    INNER JOIN emp_designation ed ON l.requester_id = ed.emp_id
                WHERE ed.company_id = ?
                    AND l.leave_from >= ?
                    AND l.leave_to <= ?
                    AND l.leave_status = 1
                    AND l.use_pto_points = 0
                GROUP BY l.requester_id
            ) AS non_pto ON leave_records.requester_id = non_pto.requester_id
            Left JOIN (
                SELECT requester_id,
                    SUM(`use_pto_points`) AS pto_used,
                    SUM(
                        (DATEDIFF(leave_to, leave_from) + 1) - (FLOOR(DATEDIFF(leave_to, leave_from) / 7) * 2) - (
                            CASE
                                WHEN WEEKDAY(leave_from) = 6 THEN 1
                                ELSE 0
                            END
                        ) - (
                            CASE
                                WHEN WEEKDAY(leave_to) = 6 THEN 1
                                ELSE 0
                            END
                        ) - (
                            CASE
                                WHEN WEEKDAY(leave_from) = 5
                                AND DATEDIFF(leave_to, leave_from) >= 7 THEN 1
                                ELSE 0
                            END
                        )
                    ) AS num_absences
                FROM leaves l
                    INNER JOIN emp_designation ed ON l.requester_id = ed.emp_id
                WHERE ed.company_id = ?
                    AND l.leave_from >= ?
                    AND l.leave_to <= ?
                    AND l.use_pto_points > 0
                    AND l.leave_status = 1
                GROUP BY l.requester_id
            ) AS pto ON leave_records.requester_id = pto.requester_id
        ORDER BY leave_records.requester_id ASC
    ) ab ON ab.requester_id = e.emp_id
    LEFT JOIN (
        SELECT e.emp_id,
            ROUND(
                (
                    SUM(
                        GREATEST(
                            8 - (
                                ROUND(
                                    IF(
                                        att.time_in > att.time_out,
                                        TIME_TO_SEC(
                                            TIMEDIFF(ADDTIME(att.time_out, '24:00:00'), att.time_in)
                                        ),
                                        TIME_TO_SEC(TIMEDIFF(att.time_out, att.time_in))
                                    ) / 3600,
                                    2
                                ) - 1
                            ),
                            0
                        )
                    )
                ) / 24,
                2
            ) AS 'undertime'
        FROM attendance att
            INNER JOIN emp e ON e.emp_num = att.employee_id
            INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
            INNER JOIN company_configuration cc ON ed.company_id = cc.company_id
        WHERE ed.company_id = ?
            AND att.date >= ?
            AND att.date <= ?
            AND cc.configuration_name = 'Monthly Working Days'
        GROUP BY e.emp_id
    ) und ON und.emp_id = e.emp_id
    LEFT JOIN (
        SELECT ot.requester_id,
            SUM(
                CASE
                    WHEN ot.overtime_type = 'Regular Day Overtime' THEN ot.hours_requested
                    ELSE 0
                END
            ) AS regular_ot,
            SUM(
                CASE
                    WHEN ot.overtime_type = 'Special Holiday Overtime' THEN ot.hours_requested
                    ELSE 0
                END
            ) AS special_holiday_ot,
            SUM(
                CASE
                    WHEN ot.overtime_type = 'Regular Holiday Overtime' THEN ot.hours_requested
                    ELSE 0
                END
            ) AS regular_holiday_ot,
            SUM(
                CASE
                    WHEN ot.overtime_type = 'Rest Day Overtime' THEN ot.hours_requested
                    ELSE 0
                END
            ) AS rest_day_ot
        FROM `overtime` ot
            LEFT JOIN emp_designation ed ON ed.emp_id = ot.requester_id
        WHERE ed.company_id = ?
            AND ot.overtime_status = 1
            AND ot.overtime_date >= ?
            AND ot.overtime_date <= ?
        GROUP BY ot.requester_id
    ) ot ON ot.requester_id = e.emp_id
    LEFT JOIN (
        SELECT employee_id,
            ROUND(SUM(night_shift_hours), 2) AS total_night_shift,
            ROUND(SUM(break_hour), 2) AS total_night_break
        FROM (
                SELECT att.employee_id,
                    att.`att_date`,
                    att.time_in,
                    att.time_out,
                    CASE
                        WHEN STR_TO_DATE(time_in, '%H:%i:%s') <= '12:00:00'
                        AND STR_TO_DATE(time_in, '%H:%i:%s') >= '06:00:00'
                        AND STR_TO_DATE(time_out, '%H:%i:%s') >= '12:00:00' THEN 0
                        WHEN STR_TO_DATE(time_in, '%H:%i:%s') >= '00:00:00'
                        AND STR_TO_DATE(time_in, '%H:%i:%s') <= '06:00:00'
                        AND STR_TO_DATE(time_out, '%H:%i:%s') >= '06:00:00' THEN ROUND(
                            LEAST(
                                TIMESTAMPDIFF(
                                    SECOND,
                                    STR_TO_DATE(time_in, '%H:%i:%s'),
                                    STR_TO_DATE('06:00:00', '%H:%i:%s')
                                ) / 3600,
                                6
                            ),
                            2
                        )
                        WHEN STR_TO_DATE(time_in, '%H:%i:%s') > STR_TO_DATE(time_out, '%H:%i:%s')
                        AND STR_TO_DATE(time_in, '%H:%i:%s') <= '22:00:00'
                        AND STR_TO_DATE(time_out, '%H:%i:%s') >= '06:00:00' THEN 8
                        WHEN STR_TO_DATE(time_in, '%H:%i:%s') > STR_TO_DATE(time_out, '%H:%i:%s')
                        AND STR_TO_DATE(time_in, '%H:%i:%s') <= '22:00:00'
                        AND STR_TO_DATE(time_out, '%H:%i:%s') <= '06:00:00' THEN ROUND(
                            LEAST(
                                TIMESTAMPDIFF(
                                    SECOND,
                                    STR_TO_DATE('22:00:00', '%H:%i:%s'),
                                    STR_TO_DATE(time_out, '%H:%i:%s') + INTERVAL 1 DAY
                                ) / 3600,
                                8
                            ),
                            2
                        )
                        WHEN STR_TO_DATE(time_in, '%H:%i:%s') > STR_TO_DATE(time_out, '%H:%i:%s')
                        AND STR_TO_DATE(time_in, '%H:%i:%s') >= '22:00:00'
                        AND STR_TO_DATE(time_out, '%H:%i:%s') <= '06:00:00' THEN ROUND(
                            LEAST(
                                TIMESTAMPDIFF(
                                    SECOND,
                                    STR_TO_DATE(time_in, '%H:%i:%s'),
                                    STR_TO_DATE(time_out, '%H:%i:%s') + INTERVAL 1 DAY
                                ) / 3600,
                                8
                            ),
                            2
                        )
                        WHEN STR_TO_DATE(time_in, '%H:%i:%s') > STR_TO_DATE(time_out, '%H:%i:%s')
                        AND STR_TO_DATE(time_in, '%H:%i:%s') >= '22:00:00'
                        AND STR_TO_DATE(time_out, '%H:%i:%s') >= '06:00:00' THEN ROUND(
                            LEAST(
                                TIMESTAMPDIFF(
                                    SECOND,
                                    STR_TO_DATE(time_in, '%H:%i:%s'),
                                    STR_TO_DATE('06:00:00', '%H:%i:%s') + INTERVAL 1 DAY
                                ) / 3600,
                                8
                            ),
                            2
                        )
                        ELSE 0
                    END AS night_shift_hours,
                    CASE
                        WHEN (
                            time_in >= '13:00:00'
                            AND time_in <= '23:59:59'
                            AND time_out >= '02:00:00'
                            AND time_out <= '13:00:00'
                        )
                        OR (
                            time_in >= '00:00:00'
                            AND time_in <= '01:00:00'
                            AND time_out >= '02:00:00'
                            AND time_out <= '13:00:00'
                        ) THEN 1
                        ELSE 0
                    END AS break_hour,
                    time_in_old,
                    time_out_old,
                    `start`
                FROM (
                        SELECT a.`employee_id`,
                            a.`att_date`,
                            CASE
                                WHEN (
                                    a.`time_out` = ""
                                    OR a.`time_out` = "Invalid date"
                                    OR a.`time_out` is NULL
                                )
                                AND ld.use_pto_points = 0
                                AND ld.leave_status = 1 THEN ''
                                WHEN (
                                    a.`time_out` = ""
                                    OR a.`time_out` = "Invalid date"
                                    OR a.`time_out` is NULL
                                )
                                AND ld.use_pto_points IS NULL
                                AND ld.leave_status IS NULL THEN ''
                                WHEN a.`time_in` >= '00:45:00'
                                AND a.`time_in` <= '01:00:00' THEN '02:00:00'
                                WHEN a.`time_in` BETWEEN '01:00:00' AND '02:00:00' THEN '02:00:00'
                                WHEN a.`time_in` BETWEEN '12:00:00' AND '13:00:00' THEN '13:00:00'
                                WHEN es.`start` > es.`end`
                                AND a.`time_in` < a.`time_out`
                                AND a.`time_in` < es.`start`
                                AND a.`time_in` >= '00:00:00' THEN a.`time_in`
                                WHEN es.`start` > es.`end`
                                AND a.`time_in` > a.`time_out`
                                AND a.`time_in` > es.`start`
                                AND a.`time_in` <= '23:59:59' THEN a.`time_in`
                                WHEN es.`start` > es.`end`
                                AND a.`time_in` > a.`time_out`
                                AND a.`time_in` < es.`start`
                                AND a.`time_in` <= '23:59:59' THEN es.`start`
                                WHEN es.`start` < es.`end`
                                AND a.`time_in` < a.`time_out`
                                AND a.`time_in` < es.`start` THEN es.`start`
                                WHEN es.`start` < es.`end`
                                AND a.`time_in` < a.`time_out`
                                AND a.`time_in` > es.`start` THEN a.`time_in`
                                WHEN es.`start` < es.`end`
                                AND es.`start` = '00:00:00'
                                AND a.`time_in` > a.`time_out`
                                AND a.`time_in` <= '23:59:59' THEN es.`start`
                                WHEN ld.use_pto_points > 0
                                AND ld.leave_status = 1 THEN es.`start`
                                ELSE a.`time_in`
                            END AS time_in,
                            CASE
                                WHEN (
                                    a.`time_out` = ""
                                    OR a.`time_out` = "Invalid date"
                                    OR a.`time_out` is NULL
                                )
                                AND ld.use_pto_points = 0
                                AND ld.leave_status = 1 Then ''
                                WHEN (
                                    a.`time_out` = ""
                                    OR a.`time_out` = "Invalid date"
                                    OR a.`time_out` is NULL
                                )
                                AND ld.use_pto_points >.5
                                AND ld.leave_status = 1 THEN STR_TO_DATE(es.`end`, '%H:%i:%s')
                                WHEN (
                                    a.`time_out` = ""
                                    OR a.`time_out` = "Invalid date"
                                    OR a.`time_out` is NULL
                                )
                                AND ld.use_pto_points > 0
                                AND ld.leave_status = 1 THEN DATE_SUB(es.`end`, INTERVAL 4 HOUR)
                                WHEN (
                                    a.`time_out` = ""
                                    OR a.`time_out` = "Invalid date"
                                    OR a.`time_out` is NULL
                                )
                                AND ld.use_pto_points IS NULL
                                AND ld.leave_status IS NULL THEN TIME_FORMAT(a.`time_out`, '%H:00:00')
                                WHEN a.`time_out` >= es.`end` THEN es.`end`
                                ELSE TIME_FORMAT(a.`time_out`, '%H:00:00')
                            END AS `time_out`,
                            a.`time_in` as time_in_old,
                            a.`time_out` as time_out_old,
                            es.`start`
                        FROM final_attendance a
                            LEFT JOIN emp_shift es on es.emp_num = a.employee_id
                            INNER JOIN emp e on e.emp_num = a.employee_id
                            LEFT JOIN emp_designation ed on e.emp_id = ed.emp_id
                            LEFT JOIN leave_dates ld ON ld.leave_date = a.`att_date`
                            AND ld.requester_id = e.emp_id
                            LEFT JOIN overtime ot ON ot.requester_id = e.emp_id
                            AND ot.overtime_date = a.`att_date`
                        WHERE ed.company_id = ?
                            AND a.att_date >= ?
                            AND a.att_date <= ?
                            AND a.`time_out` NOT LIKE 'Invalid date'
                            AND (
                                (
                                    a.`time_in` >= '13:00:00'
                                    AND a.`time_in` <= '23:59:59'
                                )
                                OR (
                                    a.`time_in` >= '00:00:00'
                                    AND a.`time_in` <= '06:00:00'
                                )
                            )
                            OR(
                                ld.use_pto_points > 0
                                AND ld.leave_status = 1
                            )
                    ) att
            ) AS night_shift_data
        GROUP BY employee_id
    ) ns on ns.employee_id = e.emp_num
    LEFT JOIN (
        SELECT consol_date_time.emp_id,
            consol_date_time.emp_num,
            SUM(
                CASE
                    WHEN COALESCE(time_in, '') = ''
                    AND COALESCE(time_out, '') IN ('', 'Invalid date')
                    AND COALESCE(use_pto_points, 0) = 0
                    AND leave_status = 1 THEN 1
                    ELSE 0
                END
            ) AS unpaid_leave,
            SUM(
                CASE
                    WHEN COALESCE(time_in, '') = ''
                    AND COALESCE(time_out, '') IN ('', 'Invalid date')
                    AND leave_type IS NULL
                    AND use_pto_points IS NULL
                    AND h_name IS NULL
                    AND DAYOFWEEK(att_date) NOT IN (1, 7) THEN 1
                    ELSE 0
                END
            ) AS awol,
            SUM(
                CASE
                    WHEN COALESCE(time_in, '') = ''
                    AND COALESCE(time_out, '') IN ('', 'Invalid date')
                    AND leave_type IS NULL
                    AND COALESCE(h_type, '') LIKE 'Special'
                    AND DAYOFWEEK(att_date) NOT IN (1, 7) THEN 1
                    ELSE 0
                END
            ) AS absent_special_holiday
        FROM (
                SELECT e.emp_id,
                    e.emp_num,
                    att.att_date,
                    att.time_in,
                    att.time_out,
                    ld.leave_type,
                    ld.leave_status,
                    ld.use_pto_points,
                    h.h_name,
                    h.h_type
                FROM final_attendance att
                    INNER JOIN emp e ON e.emp_num = att.employee_id
                    INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
                    LEFT JOIN leave_dates ld ON ld.requester_id = e.emp_id
                    AND ld.leave_date = att.att_date
                    LEFT JOIN holiday h ON h.h_date = att.att_date
                WHERE e.date_offboarding IS NULL
                    AND e.date_separated IS NULL
                    AND ed.company_id = ?
            ) AS consol_date_time
        GROUP BY consol_date_time.emp_id
    ) AS deductible_absences ON deductible_absences.emp_num = e.emp_num
    LEFT JOIN(
        SELECT weekend_records.emp_id,
            weekend_records.emp_num,
            SUM(weekend_records.rendered_days) AS weekend_rendered,
            SUM(IFNULL(weekend_records.filed_pto, 0)) AS weekend_pto
        FROM (
                SELECT e.emp_id,
                    e.emp_num,
                    att.att_date,
                    att.time_in,
                    att.time_out,
                    l.leave_date,
                    l.leave_status,
                    l.use_pto_points,
                    CASE
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
                    INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id
                    LEFT JOIN leave_dates l ON l.requester_id = e.emp_id
                    AND l.leave_date = att.att_date
                WHERE ed.company_id = ?
                    AND att.att_date BETWEEN ? AND ?
                    AND e.date_separated IS NULL
                    AND DAYOFWEEK(att.att_date) = 7
                    AND att.time_in IS NOT NULL
                    AND att.time_out IS NOT NULL
            ) AS weekend_records
        GROUP BY weekend_records.emp_id,
            weekend_records.emp_num
    ) AS weekend_days ON weekend_days.emp_num = e.emp_num
WHERE e.date_offboarding IS NULL
    AND e.date_separated IS NULL
    AND ed.company_id = ?
    AND es.base_pay != 0
ORDER BY e.emp_num;