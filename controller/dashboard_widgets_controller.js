var db = require("../config.js");
var moment = require("moment")

function UpcomingBirthdays(req, res) {
    const q = "SELECT * FROM emp ORDER BY DAYOFYEAR(dob) < DAYOFYEAR(CURDATE()) , DAYOFYEAR(dob) LIMIT 5;"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    }) 
}

function UpcomingAnniversaries(req, res) {
    const q = "SELECT * FROM emp ORDER BY DAYOFYEAR(date_hired) < DAYOFYEAR(CURDATE()) , DAYOFYEAR(date_hired) LIMIT 5;"

    db.query(q, (err, data) => {
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
8
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
    const q = "SELECT * FROM emp"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function NumberOfRegularEmployees(req, res) {
    const q = "SELECT * FROM emp WHERE emp_status = 'REGULAR'"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function NumberOfProbationaryEmployees(req, res) {
    const q = "SELECT * FROM emp WHERE emp_status = 'PROBATIONARY'"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function NumberOfPartTimeEmployees(req, res) {
    const q = "SELECT * FROM emp WHERE emp_status = 'PART-TIME'"

    db.query(q, (err, data) => {
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
}