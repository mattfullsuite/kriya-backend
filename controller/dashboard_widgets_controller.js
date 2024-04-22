var db = require("../config.js");
var moment = require("moment")

function UpcomingBirthdays(req, res) {

    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id WHERE company_id = ? AND date_separated IS NULL ORDER BY DAYOFYEAR(dob) < DAYOFYEAR(CURDATE()) , DAYOFYEAR(dob) LIMIT 5;"

    db.query(q, [cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    }) 
}

function UpcomingAnniversaries(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE company_id=? AND date_separated IS NULL ORDER BY DAYOFYEAR(date_hired) < DAYOFYEAR(CURDATE()) , DAYOFYEAR(date_hired) LIMIT 5;"

    db.query(q, [cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    }) 
}

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

    const q = "SELECT * FROM leaves WHERE leave_status = 1 AND ? BETWEEN leave_from AND leave_to"

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

    const q = "SELECT * FROM leaves WHERE " + 
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

function NumberOfEmployees(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND date_separated IS NULL"

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function NumberOfRegularEmployees(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE e.emp_status = 'REGULAR' AND em.company_id = ? AND date_separated IS NULL"

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function NumberOfProbationaryEmployees(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE e.emp_status = 'PROBATIONARY' AND em.company_id = ? AND date_separated IS NULL"

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function NumberOfPartTimeEmployees(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE e.emp_status = 'PART-TIME' AND em.company_id = ? AND date_separated IS NULL"

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
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

function CheckIfOnlineUserIsManager(req, res) {
    const uid = req.session.user[0].emp_id

    const q = "SELECT * FROM emp INNER JOIN dept ON emp_id = manager_id WHERE emp_id = ?"
    
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function DisplayAllLeaves(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? ORDER BY date_filed DESC"

    db.query(q, [cid], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
   });
}

function DisplayAllPendingLeaves(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND leave_status = 0 ORDER BY date_filed DESC"

    db.query(q, [cid], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
   });
}

function DisplayAllApprovedLeaves(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND leave_status = 1 ORDER BY date_filed DESC"

    db.query(q, [cid], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
   });
}

function DisplayAllDeclinedLeaves(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND leave_status = 2 ORDER BY date_filed DESC"

    db.query(q, [cid], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
   });
}

function GetApproverDetailsOnModal(req, res){
    const q = "SELECT * FROM emp";
      
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    })
}



// app.get("/showallleaves", (req, res) => {
//     const q =
//       "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id ORDER BY date_filed DESC";
  
//     db.query(q, (err, data) => {
//       if (err) return res.json(err);
//       return res.json(data);
//     });
//   });
  
//   app.get("/showpendingleaves", (req, res) => {
//     const q =
//       "SELECT * FROM leaves INNER JOIN emp ON requester_id=emp_id WHERE leave_status = 0 ORDER BY date_filed DESC";
//     db.query(q, (err, data) => {
//       if (err) return res.json(err);
//       return res.json(data);
//     });
//   });

module.exports = { 
    UpcomingBirthdays, 
    UpcomingAnniversaries, 
    CurrentUserPTO,
    NumberOfLeavesToday,
    NumberOfLeavesWeek,
    NumberOfEmployees,
    NumberOfRegularEmployees,
    NumberOfProbationaryEmployees,
    NumberOfPartTimeEmployees,
    YourOwnLeaves,
    CheckIfOnlineUserIsManager,
    DisplayAllLeaves,
    DisplayAllPendingLeaves,
    DisplayAllApprovedLeaves,
    DisplayAllDeclinedLeaves,
    GetApproverDetailsOnModal,
}