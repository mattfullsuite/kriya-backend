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

function GetAllPendingOvertimes(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM overtime o INNER JOIN emp e ON o.requester_id = e.emp_id WHERE e.superior_id = ? AND overtime_status = 0"

    const values = [ uid ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function ApproveOvertime(req, res) {
    const overtime_id = req.params.overtime_id;
    const q = "UPDATE overtime SET overtime_status = 1 WHERE overtime_id = ?";

    db.query(q, 
        [overtime_id], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data)
        }
    })
}

function RejectOvertime(req, res) {
    const overtime_id = req.params.overtime_id;
    const q = "UPDATE overtime SET overtime_status = 2 WHERE overtime_id = ?";

    db.query(q, 
        [overtime_id], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data)
            res.send(data)
        }
    })
}

//SELECT * FROM overtime WHERE requester_id = 1

function GetMyOvertimes(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM overtime WHERE requester_id = ?";

    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data);
            res.send(data)
        }
    })
}

function GetOvertimesOfDownline(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM overtime o INNER JOIN emp e ON e.emp_id = o.requester_id WHERE e.superior_id = ?";

    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data)
            res.send(data)
        }
    })
}


module.exports = { 
    FileOvertime,
    GetAllPendingOvertimes,
    ApproveOvertime,
    RejectOvertime,
    GetMyOvertimes,
    GetOvertimesOfDownline
}