var db = require("../config.js");

function EmployeesList(req, res) {
    var cid = req.session.user[0].company_id
    const q = `SELECT *, s.f_name AS superior_f_name, s.s_name AS superior_s_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, e.work_email, e.c_address, e.contact_num) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL ORDER BY e.s_name`

    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllEmployeesList(req, res) {
    var cid = req.session.user[0].company_id
    const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ?  ORDER BY e.s_name;`
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function NewEmployeesList(req, res) {
    var cid = req.session.user[0].company_id
    const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_hired >= CURRENT_DATE - 180 ORDER BY e.date_hired DESC;`

    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function SeparatedEmployeesList(req, res) {
    var cid = req.session.user[0].company_id
    const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NOT NULL ORDER BY e.date_separated DESC`
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function ViewEmployee(req, res) {
    const emp_id = req.params.emp_id;    
    const q = "SELECT * FROM emp AS e INNER JOIN leave_credits AS l ON e.emp_id=l.emp_id INNER JOIN emp_designation AS ed ON e.emp_id=ed.emp_id INNER JOIN position AS p ON ed.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id WHERE e.emp_id = ?";

    db.query(q, [emp_id], (err,data) => {
        if(err) return res.json(err)
        return res.send(data)
    })
}

function AllEmployees(req,res){
    var cid = req.session.user[0].company_id
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND date_separated IS NULL ORDER BY s_name"
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function ProbationaryEmployees(req,res){
    var cid = req.session.user[0].company_id
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND date_separated IS NULL AND emp_status = 'Probationary' ORDER BY s_name"
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function RegularEmployees(req,res){
    var cid = req.session.user[0].company_id
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND date_separated IS NULL AND emp_status = 'Regular' ORDER BY s_name"
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function PartTimeEmployees(req,res){
    var cid = req.session.user[0].company_id
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND date_separated IS NULL AND emp_status = 'Part-time' ORDER BY s_name"
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function DeactivatedAccounts(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id =? AND date_separated IS NOT NULL ORDER BY s_name"
    db.query(q,cid,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

module.exports = {
    EmployeesList,
    ViewEmployee,
    AllEmployees,
    RegularEmployees, 
    PartTimeEmployees,
    DeactivatedAccounts,
    ProbationaryEmployees,
    AllEmployeesList,
    NewEmployeesList,
    SeparatedEmployeesList,
}