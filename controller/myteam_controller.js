var db = require("../config.js");
var moment = require("moment");

function GetDepartmentLeaves(req, res) {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM `leave_credits` AS l INNER JOIN `emp` AS e ON l.emp_id = e.emp_id WHERE e.emp_id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
}

function GetDepartmentLeavesToday(req, res) {
  const uid = req.session.user[0].emp_id;
  const today = moment().format("YYYY/MM/DD");

  const q =
    "SELECT * FROM leaves INNER JOIN emp ON requester_id = emp_id WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to";

  db.query(q, [uid, today], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
}

// app.get("/numofdeptleavestoday", (req, res) => {
//     const uid = req.session.user[0].emp_id;
//     const today = moment().format("YYYY/MM/DD");

//     const q =
//       "SELECT * FROM leaves WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to";

//     db.query(q, [uid, today], (err, data) => {
//       if (err) {
//         return res.json(err);
//       }

//       return res.json(data);
//     });
//   });

function NumberOfLeavesForPastFiveMonths(req, res) {
  const startOfMonth = moment()
    .subtract(6, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");
  const endOfMonth = moment()
    .subtract(6, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfMonth, endOfMonth], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastFourMonths(req, res) {
  const startOfMonth = moment()
    .subtract(5, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");
  const endOfMonth = moment()
    .subtract(5, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfMonth, endOfMonth], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastThreeMonths(req, res) {
  const startOfMonth = moment()
    .subtract(4, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");
  const endOfMonth = moment()
    .subtract(4, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfMonth, endOfMonth], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastTwoMonths(req, res) {
  const startOfMonth = moment()
    .subtract(2, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");
  const endOfMonth = moment()
    .subtract(2, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfMonth, endOfMonth], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastMonth(req, res) {
  const startOfMonth = moment()
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD hh:mm");
  const endOfMonth = moment()
    .subtract(1, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfMonth, endOfMonth], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForCurrentMonth(req, res) {
  //.subtract(1, 'months')

  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD hh:mm");
  const endOfMonth = moment().endOf("month").format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfMonth, endOfMonth], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForCurrentWeek(req, res) {
  //.subtract(1, 'months')

  const startOfWeek = moment().startOf("week").format("YYYY-MM-DD hh:mm");
  const endOfWeek = moment().endOf("week").format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfWeek, endOfWeek], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastWeek(req, res) {
  //.subtract(1, 'months')

  const startOfWeek = moment()
    .subtract(1, "weeks")
    .startOf("week")
    .format("YYYY-MM-DD hh:mm");
  const endOfWeek = moment()
    .subtract(1, "weeks")
    .endOf("week")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfWeek, endOfWeek], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastTwoWeeks(req, res) {
  //.subtract(1, 'months')

  const startOfWeek = moment()
    .subtract(2, "weeks")
    .startOf("week")
    .format("YYYY-MM-DD hh:mm");
  const endOfWeek = moment()
    .subtract(2, "weeks")
    .endOf("week")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfWeek, endOfWeek], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function NumberOfLeavesForPastThreeWeeks(req, res) {
  //.subtract(1, 'months')

  const startOfWeek = moment()
    .subtract(3, "weeks")
    .startOf("week")
    .format("YYYY-MM-DD hh:mm");
  const endOfWeek = moment()
    .subtract(3, "weeks")
    .endOf("week")
    .format("YYYY-MM-DD hh:mm");

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from";

  db.query(q, [startOfWeek, endOfWeek], (err, data) => {
    if (err) console.log("err " + err);
    return res.json(data);
  });
}

function ShowAllDepartmentLeavesExceptPending(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status != 0 AND approver_id = ? ORDER BY date_filed DESC";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function ShowAllDepartmentLeavesOfTeam(req, res) {
  //const uid = req.session.user[0].emp_id;
  const did = req.session.user[0].dept_id;

  const q =
    //"(SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ?) JOIN (SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status != 0 AND approver_id = ?) ORDER BY date_filed";
    "(SELECT e.emp_id, e.f_name, e.s_name, e.emp_pic, lc.leave_balance, (SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e.emp_id) AS pending, (SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e.emp_id) AS approved, (SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e.emp_id) AS declined FROM leaves AS l INNER JOIN emp AS e ON e.emp_id = l.requester_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id WHERE d.dept_id = ? GROUP BY l.requester_id, lc.leave_balance, p.position_name, pending, declined, approved, e.emp_id, e.f_name, e.s_name, e.emp_pic) UNION (SELECT e.emp_id, e.f_name, e.s_name, e.emp_pic, lc.leave_balance, 0 AS pending, 0 AS approved, 0 AS declined FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id WHERE e.emp_id NOT IN (SELECT requester_id FROM leaves) AND d.dept_id = ? GROUP BY lc.leave_balance, p.position_name, pending, declined, approved, e.emp_id, e.f_name, e.s_name, e.emp_pic)";
  //"SELECT DISTINCT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id WHERE d.dept_id = ?"
  db.query(q, [did, did], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function ModifiedShowAllDownlineLeaves(req, res) {
  const uid = req.session.user[0].emp_id;
  // const uid = 101

  const q = `(SELECT  e1.f_name AS f1,
		e1.s_name AS s1,
    e1.emp_pic AS ep1,
		c1.leave_balance AS c1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e1.emp_id) AS p1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e1.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e1.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
            ON  e.emp_id = e1.superior_id
		LEFT JOIN leaves AS l1
			ON e1.emp_id = l1.requester_id
		LEFT JOIN leave_credits AS c1
			ON e1.emp_id = c1.emp_id
WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e1.f_name IS NOT NULL
GROUP   BY f1, s1, ep1, c1, p1, a1, d1)


UNION


(SELECT  e2.f_name AS f1,
		e2.s_name AS s1,
    e2.emp_pic AS ep1,
		c2.leave_balance AS c1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e2.emp_id) AS p1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e2.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e2.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
            ON  e.emp_id = e1.superior_id
		LEFT JOIN leaves AS l1
			ON e1.emp_id = l1.requester_id
		LEFT JOIN leave_credits AS c1
			ON e1.emp_id = c1.emp_id
                LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
                LEFT JOIN leaves AS l2
                    ON e2.emp_id = l2.requester_id
                LEFT JOIN leave_credits AS c2
                    ON e2.emp_id = c2.emp_id
WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e2.date_separated IS NULL AND e2.f_name IS NOT NULL
GROUP BY f1, s1,ep1,c1, p1, a1, d1)

UNION 

(SELECT e3.f_name AS f1,
		e3.s_name AS s1,
    e3.emp_pic AS ep1,
		c3.leave_balance AS c1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e3.emp_id) AS p1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e3.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e3.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
            ON  e.emp_id = e1.superior_id
		LEFT JOIN leaves AS l1
			ON e1.emp_id = l1.requester_id
		LEFT JOIN leave_credits AS c1
			ON e1.emp_id = c1.emp_id
                LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
                LEFT JOIN leaves AS l2
                    ON e2.emp_id = l2.requester_id
                LEFT JOIN leave_credits AS c2
                    ON e2.emp_id = c2.emp_id
                        LEFT JOIN emp AS e3
                            ON  e2.emp_id = e3.superior_id
                        LEFT JOIN leaves AS l3
                            ON e3.emp_id = l3.requester_id
                        LEFT JOIN leave_credits AS c3
                            ON e3.emp_id = c3.emp_id
WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e2.date_separated IS NULL AND e3.date_separated IS NULL AND e3.f_name IS NOT NULL
GROUP BY f1, s1, ep1, c1, p1, a1, d1)

UNION 

(SELECT e4.f_name AS f1,
		e4.s_name AS s1,
    e4.emp_pic AS ep1,
		c4.leave_balance AS c1,
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e4.emp_id) AS p1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e4.emp_id) AS a1, 
		(SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e4.emp_id) AS d1
FROM    emp e
        LEFT JOIN emp AS e1
            ON  e.emp_id = e1.superior_id
		LEFT JOIN leaves AS l1
			ON e1.emp_id = l1.requester_id
		LEFT JOIN leave_credits AS c1
			ON e1.emp_id = c1.emp_id
                LEFT JOIN emp AS e2
                    ON  e1.emp_id = e2.superior_id
                LEFT JOIN leaves AS l2
                    ON e2.emp_id = l2.requester_id
                LEFT JOIN leave_credits AS c2
                    ON e2.emp_id = c2.emp_id
                        LEFT JOIN emp AS e3
                            ON  e2.emp_id = e3.superior_id
                        LEFT JOIN leaves AS l3
                            ON e3.emp_id = l3.requester_id
                        LEFT JOIN leave_credits AS c3
                            ON e3.emp_id = c3.emp_id
                                LEFT JOIN emp AS e4
                                    ON  e3.emp_id = e4.superior_id
                                LEFT JOIN leaves AS l4
                                    ON e4.emp_id = l4.requester_id
                                LEFT JOIN leave_credits AS c4
                                    ON e4.emp_id = c4.emp_id
WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e2.date_separated IS NULL AND e3.date_separated IS NULL AND e4.date_separated IS NULL AND e4.f_name IS NOT NULL
GROUP   BY f1, ep1, s1, c1, p1, a1, d1)`;

  db.query(q, [uid, uid, uid, uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function CheckIfDownline(req, res) {
  const uid = req.session.user[0].emp_id;

  const q = "SELECT * FROM emp WHERE superior_id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function ModifiedTeamOOOToday(req, res) {
  const uid = req.session.user[0].emp_id;

  const q = `(SELECT  e1.*, l1.*
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                LEFT JOIN leaves AS l1
                    ON e1.emp_id = l1.requester_id
        WHERE e.emp_id = ? AND l1.leave_from = CURDATE() || l1.leave_to = CURDATE())
        
        UNION
        
        (SELECT  e2.*, l2.*
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                LEFT JOIN leaves AS l1
                    ON e1.emp_id = l1.requester_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
                        LEFT JOIN leaves AS l2
                            ON e2.emp_id = l2.requester_id
        WHERE e.emp_id = ? AND l2.leave_from = CURDATE() || l2.leave_to = CURDATE())
        
        UNION 
        
        (SELECT  e3.*, l3.*
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                LEFT JOIN leaves AS l1
                    ON e1.emp_id = l1.requester_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
                        LEFT JOIN leaves AS l2
                            ON e2.emp_id = l2.requester_id
                            LEFT JOIN emp AS e3
                                ON  e2.emp_id = e3.superior_id
                            LEFT JOIN leaves AS l3
                                ON e3.emp_id = l3.requester_id
        WHERE e.emp_id = ? AND l3.leave_from = CURDATE() || l3.leave_to = CURDATE())
        
        UNION 
        
        (SELECT  e4.*, l4.*
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                LEFT JOIN leaves AS l1
                    ON e1.emp_id = l1.requester_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
                        LEFT JOIN leaves AS l2
                            ON e2.emp_id = l2.requester_id
                            LEFT JOIN emp AS e3
                                ON  e2.emp_id = e3.superior_id
                            LEFT JOIN leaves AS l3
                                ON e3.emp_id = l3.requester_id
                                    LEFT JOIN emp AS e4
                                        ON  e3.emp_id = e4.superior_id
                                    LEFT JOIN leaves AS l4
                                        ON e4.emp_id = l4.requester_id
        WHERE e.emp_id = ? AND l4.leave_from = CURDATE() || l4.leave_to = CURDATE())`;

  db.query(q, [uid, uid, uid, uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function GetAttendanceOfDownlines(req, res) {
  const uid = req.session.user[0].emp_id;

  const q = 
  `SELECT e1.emp_id, e1.emp_pic, a.employee_id, e1.f_name, e1.s_name, es.shift_type, es.start, es.end, p.position_name,
  COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, 
  COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, 
  COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start,  
  COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, 
  COUNT(case when a.undertime = 'Completed' then 1 else null end) AS completed
  FROM emp e
     LEFT JOIN emp AS e1 ON  e.emp_id = e1.superior_id
     LEFT JOIN attendance a ON a.employee_id = e1.emp_num 
     LEFT JOIN emp_designation ed ON e1.emp_id = ed.emp_id 
     LEFT JOIN emp_shift es ON es.emp_num = a.employee_id 
    LEFT JOIN position p ON p.position_id = ed.position_id
      WHERE e.emp_id = ? AND e1.date_separated IS NULL AND e1.f_name IS NOT NULL
    GROUP BY e1.emp_id, e1.emp_pic, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name
  
  UNION
  
  SELECT e2.emp_id, e2.emp_pic, a.employee_id, e2.f_name, e2.s_name, es.shift_type, es.start, es.end, p.position_name,
  COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, 
  COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, 
  COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start,  
  COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, 
  COUNT(case when a.undertime = 'Completed' then 1 else null end) AS completed
  FROM emp e
     LEFT JOIN emp AS e1 ON  e.emp_id = e1.superior_id
    LEFT JOIN emp AS e2 ON  e1.emp_id = e2.superior_id
     LEFT JOIN attendance a ON a.employee_id = e2.emp_num 
     LEFT JOIN emp_designation ed ON e2.emp_id = ed.emp_id 
     LEFT JOIN emp_shift es ON es.emp_num = a.employee_id 
    LEFT JOIN position p ON p.position_id = ed.position_id
      WHERE e.emp_id = ? AND e2.date_separated IS NULL AND e2.f_name IS NOT NULL
    GROUP BY e2.emp_id, e2.emp_pic, a.employee_id, e2.f_name, e2.s_name, es.shift_type, es.start, es.end, p.position_name
  
  UNION
  
  SELECT e3.emp_id, e3.emp_pic, a.employee_id, e3.f_name, e3.s_name, es.shift_type, es.start, es.end, p.position_name,
  COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, 
  COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, 
  COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start,  
  COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, 
  COUNT(case when a.undertime = 'Completed' then 1 else null end) AS completed
  FROM emp e
     LEFT JOIN emp AS e1 ON  e.emp_id = e1.superior_id
    LEFT JOIN emp AS e2 ON  e1.emp_id = e2.superior_id
      LEFT JOIN emp AS e3 ON  e2.emp_id = e3.superior_id
     LEFT JOIN attendance a ON a.employee_id = e3.emp_num 
     LEFT JOIN emp_designation ed ON e3.emp_id = ed.emp_id 
     LEFT JOIN emp_shift es ON es.emp_num = a.employee_id 
    LEFT JOIN position p ON p.position_id = ed.position_id
      WHERE e.emp_id = ? AND e3.date_separated IS NULL AND e3.f_name IS NOT NULL
    GROUP BY e3.emp_id, e3.emp_pic, a.employee_id, e3.f_name, e3.s_name, es.shift_type, es.start, es.end, p.position_name
  
  UNION
  
  SELECT e4.emp_id, e4.emp_pic, a.employee_id, e4.f_name, e4.s_name, es.shift_type, es.start, es.end, p.position_name,
  COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, 
  COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, 
  COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start,  
  COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, 
  COUNT(case when a.undertime = 'Completed' then 1 else null end) AS completed
  FROM emp e
     LEFT JOIN emp AS e1 ON  e.emp_id = e1.superior_id
    LEFT JOIN emp AS e2 ON  e1.emp_id = e2.superior_id
      LEFT JOIN emp AS e3 ON  e2.emp_id = e3.superior_id
      LEFT JOIN emp AS e4 ON  e2.emp_id = e4.superior_id
     LEFT JOIN attendance a ON a.employee_id = e4.emp_num 
     LEFT JOIN emp_designation ed ON e4.emp_id = ed.emp_id 
     LEFT JOIN emp_shift es ON es.emp_num = a.employee_id 
    LEFT JOIN position p ON p.position_id = ed.position_id
      WHERE e.emp_id = ? AND e4.date_separated IS NULL AND e4.f_name IS NOT NULL
    GROUP BY e4.emp_id, e4.emp_pic, a.employee_id, e4.f_name, e4.s_name, es.shift_type, es.start, es.end, p.position_name
  `

  db.query(q, [uid, uid, uid, uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}


module.exports = {
  GetDepartmentLeaves,
  GetDepartmentLeavesToday,
  NumberOfLeavesForPastFiveMonths,
  NumberOfLeavesForPastFourMonths,
  NumberOfLeavesForPastThreeMonths,
  NumberOfLeavesForPastTwoMonths,
  NumberOfLeavesForPastMonth,
  NumberOfLeavesForCurrentMonth,
  NumberOfLeavesForCurrentWeek,
  NumberOfLeavesForPastWeek,
  NumberOfLeavesForPastTwoWeeks,
  NumberOfLeavesForPastThreeWeeks,
  ShowAllDepartmentLeavesExceptPending,
  ShowAllDepartmentLeavesOfTeam,
  CheckIfDownline,

  ModifiedShowAllDownlineLeaves,
  ModifiedTeamOOOToday,
  GetAttendanceOfDownlines,
};
