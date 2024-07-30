var db = require("../config.js");
var nodemailer = require('nodemailer')

function AddSuperior(req, res) {
    const sid = req.body.superior_id;
    const uid = req.body.emp_id;

    const q = "UPDATE emp SET superior_id = ? WHERE emp_id = ?";

    db.query(q, [sid, uid], (err, data) => {
        if (err){
            res.send("error")
            console.log(err)
        } else {
            res.send("success")
            console.log(data)
        }
    })
}

function GetInferiorAndSuperior(req, res) {
    const cid = req.session.user[0].company_id
    //const q = "(SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, b.emp_id, b.f_name, b.m_name, b.s_name, b.superior_id FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id) UNION (SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, emp_id AS NULL, f_name AS NULL, m_name AS NULL, s_name AS NULL, superior_id AS NULL FROM emp AS a)"
    // const q = "(SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, b.emp_id, b.f_name, b.m_name, b.s_name, b.superior_id FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id ORDER BY a.f_name) UNION (SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, emp_id IS NULL, f_name IS NULL, m_name IS NULL, s_name IS NULL, superior_id IS NULL FROM emp AS a WHERE a.superior_id IS NULL ORDER BY a.f_name)";
    const q = "(SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, b.emp_id, b.f_name AS s_f_name, b.m_name AS s_m_name, b.s_name  AS s_s_name, b.superior_id FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id INNER JOIN emp_designation AS em ON em.emp_id = a.emp_id WHERE em.company_id = ? ORDER BY a.f_name ASC) UNION (SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, a.emp_id IS NULL AS s_emp_id, f_name IS NULL AS s_f_name, m_name IS NULL AS s_m_name, s_name IS NULL AS s_s_name, superior_id IS NULL AS s_superior_id FROM emp AS a INNER JOIN emp_designation AS em ON em.emp_id = a.emp_id WHERE em.company_id = ? AND a.superior_id IS NULL ORDER BY s_f_name ASC)"


    db.query(q, [cid,cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetOwnSuperior(req, res){
    const uid = req.session.user[0].emp_id

    const q = "SELECT a.emp_id, a.emp_pic, a.superior_id, b.emp_id, b.f_name, b.s_name FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id WHERE a.emp_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetEmployee(req, res) {
    var cid = req.session.user[0].company_id

    const q = "SELECT emp_id, f_name, s_name, superior_id FROM emp WHERE company_id = ?"

    db.query(q, [cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

module.exports = { 
    AddSuperior,
    GetEmployee,
    GetInferiorAndSuperior,
    GetOwnSuperior,
}