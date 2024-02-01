var db = require("../config.js");

function SubmitComplaint(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO complaints (`complainer_id`, `content_type`, `content_body`, `hr_id`, `complaint_status`) VALUES (?)"

    const values = [
        req.body.anon_box ? null : uid,
        req.body.content_type,
        req.body.content_body, 
        req.body.hr_id,
        0,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            res.send("error")
        } else {
            res.send("success")
        }
    })
}

function AllHR(req, res) {
    const uid = req.session.user[0].emp_id
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id WHERE emp_role = 1 AND company_id = ? "

    db.query(q,[cid],
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
}


function SubmitAnonymousComplaint(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO complaints (`content_type`, `content_body`) VALUES (?)"

    const values = [req.body.content_type, req.body.content_body]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Complaint has been filed successfully.")
        }
    })
}



module.exports = { 
    SubmitComplaint,
    SubmitAnonymousComplaint,
    AllHR,
}