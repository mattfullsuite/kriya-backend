var db = require("../config.js");
var moment = require("moment");

function GetAllLeaves(req, res){
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ?"

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllPaidLeaves(req, res){
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE l.use_pto_points > 0 AND em.company_id = ?"

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function GetAllBetweenDateLeaves(req, res){
    var cid = req.session.user[0].company_id
    const lf = req.body.leave_from;
    const lt = req.body.leave_to;

    console.log(lf)
    console.log(lt)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE (leave_from > ?) AND (leave_to < ?) AND em.company_id = ?"

    db.query(q, [lf, lt, cid], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAllPaidBetweenDateLeaves(req, res){
    var cid = req.session.user[0].company_id
    const lf = req.body.leave_from;
    const lt = req.body.leave_to;

    console.log(lf)
    console.log(lt)

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE (leave_from > ?) AND (leave_to < ?) AND use_pto_points > 0 AND em.company_id = ?"

    db.query(q, [lf, lt, cid], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAllOvertimes(req, res){
    var cid = req.session.user[0].company_id
    const q = "SELECT * FROM overtime AS o INNER JOIN emp AS e ON o.requester_id = e.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ?"

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

module.exports = {
    GetAllLeaves,
    GetAllPaidLeaves,
    GetAllBetweenDateLeaves,
    GetAllPaidBetweenDateLeaves,
    GetAllOvertimes
}