var db = require("../config.js");
var moment = require("moment");

function InsertAttendanceIntoDatabase(req, res) {

    const data = req.body;
    console.log(JSON.stringify(data))

    const q = "INSERT INTO attendance (`employee_id`, `surname`, `department`, `date`, `time_in`, `time_out`, `hours_logged`, `total_break`, `hours_worked`, `status`, `undertime`) VALUES (?)"

    data.map((d) => {
        db.query(q, [d], (err, data) => {
            if (err){
                console.log(err)
            } else {
                console.log("Added.")
            }
        })
    })
    
    console.log("Successfully added everything in database!");
}

function ChangeValuesInDatabase(req, res) {

    const q = "SELECT * FROM attendance"

    data.map((d) => {
        db.query(q, [d], (err, data) => {
            if (err){
                console.log(err)
            } else {
                console.log("Added.")
            }
        })
    })
    
    console.log("Successfully added everything in database!");
}

function GetLimitedAttendance(req, res) {
    const unum = req.session.user[0].emp_num
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 5";

    db.query(q, [unum], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetAttendance(req, res) {
    const unum = req.session.user[0].emp_num
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date";

    db.query(q, [unum], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetUndertimeAttendance(req, res){
    const unum = req.session.user[0].emp_num
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 5";

    db.query(q, [unum], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMyLeaves(req, res){
    const uid = req.session.user[0].emp_id
    const q = "SELECT leave_id, leave_from, leave_to, use_pto_points FROM leaves WHERE requester_id = ?";

    db.query(q, [uid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}


module.exports = {
    InsertAttendanceIntoDatabase,
    GetLimitedAttendance,
    GetUndertimeAttendance,
    GetAttendance,
    GetMyLeaves,
};

