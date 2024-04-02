var db = require("../config.js");
var moment = require("moment");

function GetAllLeaves(req, res){
    const q = "SELECT * FROM leaves INNER JOIN emp ON requester_id = emp_id"

    db.query(q, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllPaidLeaves(req, res){
    const q = "SELECT * FROM leaves INNER JOIN emp ON requester_id = emp_id WHERE use_pto_points > 0"

    db.query(q, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllBetweenDateLeaves(req, res){
    const lf = req.body.leave_from;
    const lt = req.body.leave_to;

    console.log(lf)
    console.log(lt)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?)"

    db.query(q, [lf, lt], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAllPaidBetweenDateLeaves(req, res){
    const lf = req.body.leave_from;
    const lt = req.body.leave_to;

    console.log(lf)
    console.log(lt)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) AND use_pto_points > 0"

    db.query(q, [lf, lt], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

module.exports = {
    GetAllLeaves,
    GetAllPaidLeaves,
    GetAllBetweenDateLeaves,
    GetAllPaidBetweenDateLeaves,
}