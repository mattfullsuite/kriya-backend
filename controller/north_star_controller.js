var db = require("../config.js");
var moment = require("moment");

function InsertNorthStar(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO north_star (`upline_id`, `target_goal`, `target_desc`) VALUES (?)"

    const values = [
        uid, 
        req.body.target_goal,
        req.body.target_desc,
        //moment(req.body.target_date).format("YYYY-MM-DD"),
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send("success")
            console.log(data)
        }
    })
}

function GetMyOwnNorthStar(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM north_star WHERE upline_id = ?"

    db.query(q, 
        uid, 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetNorthStarOfMySuperior(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM north_star ns INNER JOIN emp e ON ns.upline_id = e.superior_id WHERE e.date_separated IS NULL AND e.emp_id = ?"

    db.query(q, 
        uid, 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetMyDownlines(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "(SELECT * FROM emp WHERE emp_id = ?) UNION (SELECT child.* FROM emp parent INNER JOIN emp child ON child.superior_id = parent.emp_id WHERE child.date_separated IS NULL AND parent.emp_id = ?)"

    db.query(q, 
        [uid, uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function InsertNorthStarGoal(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO north_star_goals (`assigner_id`, `assignee_id`, `target_task`,`target_date`, `status`) VALUES (?)"

    const values = [
        uid, 
        req.body.assignee_id,
        req.body.target_task,
        req.body.target_date,
        1
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

function GetTaskOfSameLine(req, res) {
    const uid = req.session.user[0].emp_id
    //const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assigner_id = e.emp_id WHERE assignee_id = ?"
    //const q = "(SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assignee_id = ?) UNION (SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assigner_id = ?)"
    const q = `(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assignee_id = ?) UNION (SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assigner_id = ?)`
    db.query(q, 
        [uid, uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetMyTasks(req, res) {
    const uid = req.session.user[0].emp_id
    const q =  `(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assignee_id = ?)`
    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetMyTeamTasks(req, res) {
    const uid = req.session.user[0].emp_id
    const q =  `(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assigner_id = ?)`
    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetFinishedTaskOfSameLine(req, res) {
    const uid = req.session.user[0].emp_id
    //const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assigner_id = e.emp_id WHERE assignee_id = ?"
    const q = "(SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assignee_id = ? AND status = 0) UNION (SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assigner_id = ? AND status = 0)"
    db.query(q, 
        [uid, uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetTasksYouAssigned(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE nsg.assigner_id = ?"

    db.query(q, 
        uid, 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

function GetTasksForReview(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE nsg.assigner_id = ? AND status = 'FOR REVIEW'"

    db.query(q, 
        uid, 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

//SELECT child.* FROM emp parent INNER JOIN emp child ON child.superior_id = parent.emp_id WHERE child.date_separated IS NULL AND parent.emp_id = 101


module.exports = { 
    InsertNorthStar,
    GetNorthStarOfMySuperior,
    InsertNorthStarGoal,
    GetMyDownlines,
    GetTaskOfSameLine,
    GetTasksYouAssigned,
    GetTasksForReview,
    GetFinishedTaskOfSameLine,
    GetMyOwnNorthStar,
    GetMyTasks,
    GetMyTeamTasks
}