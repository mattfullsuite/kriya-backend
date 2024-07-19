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
    const q = `(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assignee_id = ? AND status != 9 AND status != 0) UNION (SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assigner_id = ? AND status != 9 AND status != 0)`
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
    //const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE nsg.assigner_id = ? AND status = 9"
    const q = "(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assigner_id = ? AND status = 9)"


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

//MY TEAM

function GetMyTeamTasksYouAssigned(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE nsg.assigner_id = ? AND nsg.status < 8"

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

function UpdateTaskStatus(req, res) {

    console.log(JSON.stringify(req.body))
  
    const normal_q = "UPDATE north_star_goals SET status = " + req.body.status + " WHERE north_star_goal_id = " + req.body.north_star_goal_id;
    const finished_q = "UPDATE north_star_goals SET status = " + req.body.status + ", finished_date = CURRENT_TIMESTAMP WHERE north_star_goal_id = " + req.body.north_star_goal_id;
  
    db.query(
        (req.body.status == 0) ? finished_q : normal_q, (err, data) => {
      if (err) {
        res.send("error");
        console.log(err);
      } else {
        console.log(data);
        res.send("success")
      }
    });
}

function GetFinishedTaskOfSameLine(req, res) {
    const uid = req.session.user[0].emp_id
    //const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assigner_id = e.emp_id WHERE assignee_id = ?"
    const q = "(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assigner_id = ? AND status = 0)"
    //"(SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assignee_id = ? AND status = 0) UNION (SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assigner_id = ? AND status = 0)"
    
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

function GetMyFinishedTasks(req, res) {
    const uid = req.session.user[0].emp_id
    //const q = "SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assigner_id = e.emp_id WHERE assignee_id = ?"
    const q = "(SELECT nsg.*, a.f_name AS a_fname, a.s_name AS a_sname, r.f_name AS r_fname, r.s_name AS r_sname FROM north_star_goals nsg INNER JOIN emp a ON nsg.assignee_id = a.emp_id INNER JOIN emp r ON nsg.assigner_id = r.emp_id WHERE assignee_id = ? AND status = 0)"
    
    //"(SELECT * FROM north_star_goals nsg INNER JOIN emp e ON nsg.assignee_id = e.emp_id WHERE assignee_id = ? AND status = 0)"
    
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

function GetDownlineTasks(req, res){
    const uid = req.session.user[0].emp_id

    const q =  `(SELECT  e1.f_name AS e_f_name, e1.s_name AS e_s_name, l1.*, a1.f_name AS a_f_name, a1.s_name AS a_s_name
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                LEFT JOIN north_star_goals AS l1
                    ON e1.emp_id = l1.assigner_id
				LEFT JOIN emp AS a1
					ON a1.emp_id = l1.assignee_id	
        WHERE e.emp_id = ? AND e1.date_separated IS NULL AND l1.north_star_goal_id IS NOT NULL)
        
        UNION
        
        (SELECT  e2.f_name AS e_f_name, e2.s_name AS e_s_name, l2.*, a2.f_name AS a_f_name, a2.s_name AS a_s_name
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
                        LEFT JOIN north_star_goals AS l2
                            ON e2.emp_id = l2.assigner_id
                        LEFT JOIN emp AS a2
                            ON a2.emp_id = l2.assignee_id	
        WHERE e.emp_id = ? AND e2.date_separated IS NULL AND l2.north_star_goal_id IS NOT NULL)
        
        UNION
        
        (SELECT  e3.f_name AS e_f_name, e3.s_name AS e_s_name, l3.*, a3.f_name AS a_f_name, a3.s_name AS a_s_name
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
							LEFT JOIN emp AS e3
                                ON  e2.emp_id = e3.superior_id
                            LEFT JOIN north_star_goals AS l3
                                ON e3.emp_id = l3.assigner_id
                            LEFT JOIN emp AS a3
                                ON a3.emp_id = l3.assignee_id	
        WHERE e.emp_id = ? AND e3.date_separated IS NULL AND l3.north_star_goal_id IS NOT NULL)

		UNION
        
        (SELECT  e4.f_name AS e_f_name, e4.s_name AS e_s_name, l4.*, a4.f_name AS a_f_name, a4.s_name AS a_s_name
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
							LEFT JOIN emp AS e3
                                ON  e2.emp_id = e3.superior_id
                                    LEFT JOIN emp AS e4
                                        ON  e3.emp_id = e4.superior_id
                                    LEFT JOIN north_star_goals AS l4
                                        ON e4.emp_id = l4.assigner_id
                                    LEFT JOIN emp AS a4
                                        ON a4.emp_id = l4.assignee_id	
        WHERE e.emp_id = ? AND e4.date_separated IS NULL AND l4.north_star_goal_id IS NOT NULL)
        
        UNION
        
        (SELECT  e5.f_name AS e_f_name, e5.s_name AS e_s_name, l5.*, a5.f_name AS a_f_name, a5.s_name AS a_s_name
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
							LEFT JOIN emp AS e3
                                ON  e2.emp_id = e3.superior_id
                                    LEFT JOIN emp AS e4
                                        ON  e3.emp_id = e4.superior_id
                                        LEFT JOIN emp AS e5
                                            ON  e4.emp_id = e5.superior_id
                                        LEFT JOIN north_star_goals AS l5
                                            ON e5.emp_id = l5.assigner_id
                                        LEFT JOIN emp AS a5
                                            ON a5.emp_id = l5.assignee_id	
        WHERE e.emp_id = ? AND e5.date_separated IS NULL AND l5.north_star_goal_id IS NOT NULL)

UNION
        
        (SELECT  e6.f_name AS e_f_name, e6.s_name AS e_s_name, l6.*, a6.f_name AS a_f_name, a6.s_name AS a_s_name
        FROM    emp e
                LEFT JOIN emp AS e1
                    ON  e.emp_id = e1.superior_id
                        LEFT JOIN emp AS e2
                            ON  e1.emp_id = e2.superior_id
							LEFT JOIN emp AS e3
                                ON  e2.emp_id = e3.superior_id
                                    LEFT JOIN emp AS e4
                                        ON  e3.emp_id = e4.superior_id
                                        LEFT JOIN emp AS e5
                                            ON  e4.emp_id = e5.superior_id
                                            LEFT JOIN emp AS e6
                                                ON  e5.emp_id = e6.superior_id
                                            LEFT JOIN north_star_goals AS l6
                                                ON e6.emp_id = l6.assigner_id
                                            LEFT JOIN emp AS a6
                                                ON a6.emp_id = l6.assignee_id	
        WHERE e.emp_id = ? AND e6.date_separated IS NULL AND l6.north_star_goal_id IS NOT NULL)`

    db.query(q, 
        [uid, uid, uid, uid, uid, uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}
  


module.exports = { 
    InsertNorthStar,
    GetNorthStarOfMySuperior,
    InsertNorthStarGoal,
    GetMyDownlines,
    GetTaskOfSameLine,
    GetTasksYouAssigned,
    GetFinishedTaskOfSameLine,
    GetMyOwnNorthStar,
    EditNorthStar,

    //Tasks You Assigned
    GetMyTeamTasksYouAssigned,
    GetMyTasks,
    GetMyTeamTasks,

    //Tasks For Review
    GetTasksForReview,
    UpdateTaskStatus,

    //FinishedTasks
    GetFinishedTaskOfSameLine,
    GetMyFinishedTasks,

    //Downline Tasks
    GetDownlineTasks
}