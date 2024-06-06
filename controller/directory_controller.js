var db = require("../config.js");
function GetDirectory(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM emp INNER JOIN emp_designation ON emp.emp_id = emp_designation.emp_id INNER JOIN position ON emp_designation.position_id = position.position_id INNER JOIN dept ON dept.dept_id = position.dept_id INNER JOIN division ON division.div_id=dept.div_id WHERE emp_designation.company_id = ? AND emp.date_separated IS NULL"

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

// function GetDirectory2(req, res) {
//     const cid = req.session.user[0].company_id
//     const q = "SELECT emp_id, f_name, s_name, superior_id FROM emp WHERE date_separated IS NULL"

//     db.query(q, (err, data) => {
//         if (err){
//             console.log(err)
//         } else {
//             res.json(data)
//         }
//     })
// }

function GetDivision(req, res) {
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM division WHERE company_id = ?";

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetDepartment(req, res) {
    const q = "SELECT * FROM dept";

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetDownlineCount(req, res) {
    const q = "SELECT p.emp_id, p.emp_num, p.f_name, COUNT(*) AS downline_count FROM emp AS p INNER JOIN emp AS c ON p.emp_id = c.superior_id WHERE p.date_separated IS NULL AND c.date_separated IS NULL GROUP BY f_name, emp_id, emp_num;";

    db.query(q, (err, data) => {
        if(err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
}

module.exports = { 
    GetDirectory,
    GetDivision,
    GetDepartment,
    GetDownlineCount,
}