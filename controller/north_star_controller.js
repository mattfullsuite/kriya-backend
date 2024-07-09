var db = require("../config.js");
var moment = require("moment");

function InsertNorthStar(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO north_star (`upline_id`, `target_goal`, `target_desc`) VALUES (?)"

    const values = [
        uid, 
        req.body[0].target_goal,
        req.body[0].target_desc,
        //moment(req.body.target_date).format("YYYY-MM-DD"),
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            res.send("error")
        } else {
            const q = "SELECT LAST_INSERT_ID() AS id FROM north_star";

            db.query(q, (err, data) => {
                if(err){
                    res.send("error");
                }
                else {
                    res.json(data);
                }
            })
        }
    })
}

function EditNorthStar(req, res) {
    const north_star_id = req.body[0].north_star_id;
    const target_goal = req.body[0].target_goal;
    const target_desc = req.body[0].target_desc;

    const q = "UPDATE north_star SET target_goal = ?, target_desc = ? WHERE north_star_id = ?";
    db.query(q, [target_goal, target_desc, north_star_id], (err, data) => {
        if(err) {
            res.send("error");
            console.log(err);
        } else {
            res.send("success");
        }
    })
}

function GetMyOwnNorthStar(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT north_star_id, target_goal, target_desc FROM north_star WHERE upline_id = ?"

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
            const q = "(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id ORDER BY north_star_goal_id DESC LIMIT 1) UNION (SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assigner_id = ? ORDER BY north_star_goal_id DESC LIMIT 1)";
            db.query(q, [uid, uid], (err, data) => {
                if(err) {
                    console.log(err);
                } else {
                    res.json(data);
                    console.log(data);
                }
            })
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
    GetMyTeamTasks,
    EditNorthStar
}