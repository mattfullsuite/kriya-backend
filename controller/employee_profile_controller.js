const { JsonWebTokenError } = require("jsonwebtoken");
var db = require("../config.js");
var moment = require("moment");

function GetDataOfLoggedInUser(req, res){
    const uid= req.session.user[0].emp_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";
  
    db.query(q, [uid], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetDataForCertainEmployee(req, res){
    const emp_id = req.params.emp_id;  
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";
  
    db.query(q, [emp_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetSuperiorDataOfCertainUser(req, res){
    const emp_id = req.params.emp_id; 
    const q = "SELECT s.f_name, s.m_name, s.s_name, p.position_name, s.work_email FROM emp AS e INNER JOIN emp AS s ON e.superior_id = s.emp_id INNER JOIN emp_designation AS em ON s.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";
  
    db.query(q, [emp_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetSuperiorDataOfLoggedInUser(req, res){
    const uid= req.session.user[0].superior_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";
  
    db.query(q, [uid], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function OffboardEmployee(req, res) {
  const fetchid = req.params.emp_id;

  console.log("DATA: " + req.body.date_separated)

  const q = "UPDATE emp SET date_separated = '" + req.body.date_separated + "' WHERE emp_id = " + fetchid

  db.query(q, (err, data) => {
    if (err) {
      res.send("error")
      console.log(err)
    } else {
      // res.send("success")
      const q1 = "SELECT superior_id FROM emp WHERE emp_id = " + fetchid

      db.query(q1, (err, data) => {
        if (err) {
          console.log(err)
        } else {
          console.log("DATA lvl 2 : " + data[0].superior_id)

          const q2 = "UPDATE emp SET superior_id = " + data[0].superior_id + " WHERE superior_id = " + fetchid

          db.query(q2, (err, data) => {
            if (err) {
              console.log(err)
            } else {
              console.log("DATA lvl 3 : " + data)

              res.send("success")
            }
          })
        }
      })
    }
  });
};

module.exports = 
{ 
    GetDataOfLoggedInUser,
    GetSuperiorDataOfLoggedInUser,
    GetDataForCertainEmployee,
    GetSuperiorDataOfCertainUser,
    OffboardEmployee
};