var db = require("../config.js");

function EmployeesList(req, res) {
    const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp ORDER BY s_name"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function ViewEmployee(req, res) {
    const emp_id = req.params.emp_id;    
    const q = "SELECT * FROM emp AS e INNER JOIN leave_credits AS l ON e.emp_id=l.emp_id INNER JOIN emp_designation AS ed ON e.emp_id=ed.emp_id WHERE e.emp_id = ?";

    db.query(q, [emp_id], (err,data) => {
        if(err) return res.json(err)
        return res.send(data)
    })
}

module.exports = {
    EmployeesList,
    ViewEmployee,
}