var db = require("../config.js");
var moment = require("moment");

function InsertAttendanceIntoDatabase(req, res) {

    const data = req.body;
    console.log(JSON.stringify(data))

    const q = "INSERT INTO attendance (`employee_id`, `surname`, `date`, `time_in`, `time_out`, `total_break`, `hours_logged`, `hours_worked`) VALUES (?)"

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


module.exports = {
    InsertAttendanceIntoDatabase,
    GetLimitedAttendance,
    GetUndertimeAttendance,
};

