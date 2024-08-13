var db = require("../config.js");
var moment = require("moment");

function CurrentUserPTO(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM `leave_credits` AS l INNER JOIN `emp` AS e ON l.emp_id = e.emp_id WHERE e.emp_id = ?"

    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
}

function NumberOfLeavesToday(req, res) {
    const uid = req.session.user[0].emp_id
    const cid = req.session.user[0].emp_id
    const today = moment().format("YYYY/MM/DD")

    const q = "SELECT COUNT(*) AS count FROM leaves WHERE leave_status = 1 AND ? BETWEEN leave_from AND leave_to"

    db.query(q,
        [today],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
}

function NumberOfLeavesWeek(req, res) {
    const today2 = moment().startOf('week').add('days', 1).format("YYYY/MM/DD");
    const today3 = moment().startOf('week').add('days', 2).format("YYYY/MM/DD");
    const today4 = moment().startOf('week').add('days', 3).format("YYYY/MM/DD");
    const today5 = moment().startOf('week').add('days', 4).format("YYYY/MM/DD");
    const today6 = moment().startOf('week').add('days', 5).format("YYYY/MM/DD");

    const q = "SELECT COUNT(*) AS count FROM leaves WHERE " + 
    "leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " + 
    "leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " + 
    "leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " + 
    "leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " + 
    "leave_status = 1 AND ? BETWEEN leave_from AND leave_to"

    db.query(q,
        [today2,today3,today4,today5,today6],
        (err,data)=> {
        if(err) {
            return console.log(err)
        }

        return res.json(data)
    })
}

function PaidLeavesTaken(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT COUNT(*) AS count FROM leaves WHERE requester_id = ? AND use_pto_points != 0"
    
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
}

function UnpaidLeavesTaken(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT COUNT(*) AS count FROM leaves WHERE requester_id = ? AND use_pto_points = 0"
    
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
}

function AllMyPendingLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND requester_id = ? ORDER BY date_filed DESC"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllMyApprovedLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 1 AND requester_id = ? ORDER BY date_filed DESC"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllMyDeclinedLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 2 AND requester_id = ? ORDER BY date_filed DESC"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function YourOwnLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE requester_id = ? ORDER BY date_filed DESC"
    
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function MyPtoHistory(req, res){
  const uid = req.session.user[0].emp_id;
  const q =
    "(SELECT log_type, log_time, log_desc, Null AS hr_name FROM emp AS e INNER JOIN pto_logs AS p ON e.emp_id = p.emp_id AND p.hr_id IS NULL WHERE e.emp_id = ?) UNION (SELECT log_type, log_time, log_desc, em.f_name AS hr_name FROM emp AS e INNER JOIN pto_logs AS p ON e.emp_id = p.emp_id INNER JOIN emp AS em ON p.hr_id = em.emp_id WHERE e.emp_id = ?) ORDER BY log_time DESC";

  const values = [uid, uid];
  db.query(q, [uid, uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
    CurrentUserPTO,
    NumberOfLeavesToday,
    NumberOfLeavesWeek,
    PaidLeavesTaken,
    UnpaidLeavesTaken,
    AllMyPendingLeaves,
    AllMyApprovedLeaves,
    AllMyDeclinedLeaves,
    YourOwnLeaves,
    MyPtoHistory,
};