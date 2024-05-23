var db = require("../config.js");

function GetAllEmployeesOfCompany(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id WHERE em.company_id = ? AND e.date_separated IS NULL ORDER BY s_name"
    
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function EmployeesList(req, res) {
    var cid = req.session.user[0].company_id
    const q = `SELECT *, s.f_name AS superior_f_name, s.s_name AS superior_s_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, e.work_email, e.c_address, e.contact_num) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL ORDER BY e.s_name`

    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

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
    GetAllEmployeesOfCompany,
    SubmitComplaint,
    SubmitAnonymousComplaint,
    AllHR,
}