var db = require("../config.js");

function FileOvertime(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO overtime (`requester_id`, `overtime_type`, `overtime_date`, `overtime_reason`, `hours_requested`, `overtime_status`) VALUES (?)"

    const values = [
        uid,
        req.body.overtime_type,
        req.body.overtime_date,
        req.body.overtime_reason, 
        req.body.hours_rendered,
        0,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send("success")
        }
    })
}






module.exports = { 
    FileOvertime
}