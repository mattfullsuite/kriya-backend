var db = require("../config.js");
var isEmpty = require('lodash.isempty');
var moment = require('moment')

function FileLeave(req, res){

    const uid = req.session.user[0].emp_id

    const q = "INSERT INTO leaves (`requester_id`, `leave_type`, `leave_reason`, `leave_from`, `leave_to`, `leave_status`, `approver_id`, `use_pto_points`) VALUES (?)" 
    const values = [
        uid, //1
        req.body.leave_type,
        req.body.leave_reason,
        req.body.leave_from,
        req.body.leave_to,
        0, //pending
        req.body.approver_id,//JHex
        req.body.use_pto_points,
    ]

    if (!isEmpty(req.body.leave_type) && !isEmpty(req.body.leave_from) && !isEmpty(req.body.leave_to) && !isEmpty(req.body.approver_id)){

        db.query(q, [values], (err, data) => {
            if(err) {
                res.send("error")
                console.log(err)
            }
            else {
                res.send("success")
            }
            // if (err) return console.log(err);
            // return res.json(data);
        })

        const q1 = "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance - " + req.body.use_pto_points + " WHERE l.emp_id = ?"

        db.query(q1, [uid], (err, data) => {
            if (err) return console.log(err); 
            return console.log(data);
        })


    } else {
        res.send("error")
    }

}

function ApproveLeave(req, res) {
    const leave_id = req.params.leave_id;
    const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

    db.query(q, 
        [1, leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Leave #" + leave_id + "has been updated successfully.")
        }
    })
}

function RejectLeave(req, res) {
    const leave_id = req.params.leave_id;
    const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

    db.query(q, 
        [2, leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Leave #" + leave_id + "has been updated successfully.")
        }
    })
}

function ReturnTemporaryPTO(req, res) {
    const leave_id = req.params.leave_id;

    const q = "UPDATE leaves AS l JOIN leave_credits AS lc ON l.requester_id=lc.emp_id SET leave_balance = leave_balance + use_pto_points WHERE leave_id = ?";

    db.query(q, 
        [leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Ptos have been returned for " + leave_id + "")
        }
    })
}


function AllApprovers(req, res) {
    const uid = req.session.user[0].emp_id
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e JOIN dept ON e.emp_id = manager_id INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id WHERE e.emp_id != ? AND company_id = ?"

    db.query(q,[uid, cid],
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
}

function AllHolidays(req, res) {
    const cid = req.session.user[0].company_id;

    const q = "SELECT * FROM holiday WHERE company_id = ?";

    db.query(q, cid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllMyPendingLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 0 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function BlockMyPendingLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT leave_from, leave_to FROM leaves WHERE leave_status = 0 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function BlockMyApprovedLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT leave_from, leave_to FROM leaves WHERE leave_status = 1 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllMyApprovedLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 1 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

module.exports = { 
    FileLeave,
    AllApprovers,
    AllHolidays,
    AllMyPendingLeaves,
    AllMyApprovedLeaves,
    ApproveLeave,
    RejectLeave,
    ReturnTemporaryPTO,
    BlockMyPendingLeaves,
    BlockMyApprovedLeaves,
}