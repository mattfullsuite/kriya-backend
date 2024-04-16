var db = require("../config.js");

function EmployeesList(req, res) {
    var cid = req.session.user[0].company_id
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id WHERE em.company_id = ? AND date_separated IS NULL ORDER BY e.s_name"
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
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id WHERE date_separated IS NULL ORDER BY s_name"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function ProbationaryEmployees(req,res){
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id WHERE date_separated IS NULL AND emp_status = 'Probationary' ORDER BY s_name"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function RegularEmployees(req,res){
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id WHERE date_separated IS NULL AND emp_status = 'Regular' ORDER BY s_name"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function PartTimeEmployees(req,res){
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id WHERE date_separated IS NULL AND emp_status = 'Part-time' ORDER BY s_name"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function DeactivatedAccounts(req, res) {
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id WHERE date_separated IS NOT NULL ORDER BY s_name"
    db.query(q,(err,data)=> {
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
}