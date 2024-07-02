var db = require("../config.js");

function OverallTeamMood(req, res) {
    const uid = 101
    const q = `(SELECT e1.f_name, pm.mood_entry, pm.date_of_entry
        FROM    emp e
                LEFT JOIN emp AS e1
                ON  e.emp_id = e1.superior_id
                LEFT JOIN pulse_mood AS pm
                ON e1.emp_id = pm.emp_id
        WHERE e.emp_id = ? AND e1.date_separated IS NULL AND pm.mood_entry IS NOT NULL)
        
        UNION 
        
        (SELECT e2.f_name, pm.mood_entry, pm.date_of_entry
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
                            LEFT JOIN pulse_mood AS pm
                                ON e2.emp_id = pm.emp_id
        WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e2.date_separated IS NULL AND e2.f_name IS NOT NULL  AND pm.mood_entry IS NOT NULL)
        
        UNION 
        
        (SELECT  e3.f_name, pm.mood_entry, pm.date_of_entry
        FROM    emp e
                LEFT JOIN emp AS e1
                ON  e.emp_id = e1.superior_id
                       LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
                           LEFT JOIN emp AS e3
                        ON  e2.emp_id = e3.superior_id
        LEFT JOIN pulse_mood AS pm
                ON e3.emp_id = pm.emp_id
        WHERE e.emp_id = ? AND e3.date_separated IS NULL AND e3.date_separated IS NULL AND e3.f_name IS NOT NULL AND pm.mood_entry IS NOT NULL)
        
        UNION 
        
        (SELECT  e4.f_name, pm.mood_entry, pm.date_of_entry
        FROM    emp e
                LEFT JOIN emp AS e1
                ON  e.emp_id = e1.superior_id
                       LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
                           LEFT JOIN emp AS e3
                        ON  e2.emp_id = e3.superior_id
                            LEFT JOIN emp AS e4
                            ON  e3.emp_id = e4.superior_id
        LEFT JOIN pulse_mood AS pm
                ON e4.emp_id = pm.emp_id
        WHERE e.emp_id = ? AND e4.date_separated IS NULL AND e4.date_separated IS NULL AND e4.f_name IS NOT NULL  AND pm.mood_entry IS NOT NULL)
        
        UNION 
        
        (SELECT  e5.f_name, pm.mood_entry, pm.date_of_entry
        FROM    emp e
                LEFT JOIN emp AS e1
                ON  e.emp_id = e1.superior_id
                       LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
                           LEFT JOIN emp AS e3
                        ON  e2.emp_id = e3.superior_id
                            LEFT JOIN emp AS e4
                            ON  e3.emp_id = e4.superior_id
                                LEFT JOIN emp AS e5
                                ON  e4.emp_id = e5.superior_id
                                LEFT JOIN pulse_mood AS pm
                                    ON e5.emp_id = pm.emp_id
        WHERE e.emp_id = ? AND e5.date_separated IS NULL AND e5.date_separated IS NULL AND e5.f_name IS NOT NULL  AND pm.mood_entry IS NOT NULL)`

    db.query(q, 
        [uid,uid,uid,uid,uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function TeamMoodRateStatistics(req, res) {
    const uid = req.session.user[0].emp_id
    const q = `(SELECT  e1.f_name AS f1,
		e1.s_name AS s1,
		(SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 AND emp_id = e1.emp_id) AS l1, 
		(SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 AND emp_id = e1.emp_id) AS a1, 
		(SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 AND emp_id = e1.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
        ON  e.emp_id = e1.superior_id
WHERE e.emp_id = ? AND e1.date_separated IS NULL)

UNION 

(SELECT  e2.f_name AS f1,
		e2.s_name AS s1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e2.emp_id) AS l1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e2.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e2.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
            ON  e.emp_id = e1.superior_id
                LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e2.date_separated IS NULL AND e2.f_name IS NOT NULL
GROUP BY f1, s1, l1, a1, d1)

UNION 

(SELECT  e3.f_name AS f1,
		e3.s_name AS s1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e3.emp_id) AS l1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e3.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e3.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
        ON  e.emp_id = e1.superior_id
           	LEFT JOIN emp AS e2
            ON  e1.emp_id = e2.superior_id
               	LEFT JOIN emp AS e3
                ON  e2.emp_id = e3.superior_id
WHERE e.emp_id = ? AND e3.date_separated IS NULL AND e3.date_separated IS NULL AND e3.f_name IS NOT NULL
GROUP BY f1, s1, l1, a1, d1)

UNION 

(SELECT  e4.f_name AS f1,
		e4.s_name AS s1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e4.emp_id) AS l1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e4.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e4.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
        ON  e.emp_id = e1.superior_id
           	LEFT JOIN emp AS e2
            ON  e1.emp_id = e2.superior_id
               	LEFT JOIN emp AS e3
                ON  e2.emp_id = e3.superior_id
                    LEFT JOIN emp AS e4
                    ON  e3.emp_id = e4.superior_id
WHERE e.emp_id = ? AND e4.date_separated IS NULL AND e4.date_separated IS NULL AND e4.f_name IS NOT NULL
GROUP BY f1, s1, l1, a1, d1)

UNION 

(SELECT  e5.f_name AS f1,
		e5.s_name AS s1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e5.emp_id) AS l1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e5.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e5.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
        ON  e.emp_id = e1.superior_id
           	LEFT JOIN emp AS e2
            ON  e1.emp_id = e2.superior_id
               	LEFT JOIN emp AS e3
                ON  e2.emp_id = e3.superior_id
                    LEFT JOIN emp AS e4
                    ON  e3.emp_id = e4.superior_id
                        LEFT JOIN emp AS e5
                        ON  e4.emp_id = e5.superior_id
WHERE e.emp_id = ? AND e5.date_separated IS NULL AND e5.date_separated IS NULL AND e5.f_name IS NOT NULL
GROUP BY f1, s1, l1, a1, d1)`


    db.query(q, 
    [uid,uid,uid,uid,uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

module.exports = { 
    OverallTeamMood,
    TeamMoodRateStatistics
}