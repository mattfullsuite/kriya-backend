var db = require("../config.js");

function AddTaskNotes(req, res) {
    const uid = req.session.user[0].emp_id;
    const q = "INSERT INTO task_notes (`goal_id`, `noter_id`, `note_body`) VALUES (?)"

    const values = [
        req.body.goal_id,
        uid,
        req.body.note_body
    ]

    db.query(q, [values], (err, data) => {
        if (err) {
            res.send("error");
            console.log(err);
        } else {
            res.send(data)
        }
    });
}

function GetNoteDetails(req, res){
    const goal_id = req.body.goal_id
    const q = "SELECT * FROM task_notes INNER JOIN emp ON emp_id = noter_id WHERE goal_id = ? ORDER BY noted_at;";
  
    db.query(q, [goal_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function InsertTaskNotes(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO task_notes (`goal_id`, `note_type`, `noter_id`, `note_body`) VALUES (?)"

    const values = [
        req.body.goal_id,
        1,
        uid, 
        req.body.note_body,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            res.send("error")
        } else {
            res.send(data)
            console.log(data)
        }
    })
}


module.exports = { 
    AddTaskNotes,
    GetNoteDetails,
    InsertTaskNotes
}