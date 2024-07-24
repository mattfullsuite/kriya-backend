var db = require("../config.js");

function CreateHoliday(req, res) {
  const cid = req.session.user[0].company_id;
  const q =
    "INSERT INTO holiday (`h_name`, `h_date`, `company_id`) VALUES (?) ";
  const values = [req.body.h_name, req.body.h_date, cid];

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("success");
    }
    // if (err) return res.json(err)
    // return res.json("Holiday added!")
  });
}

function DeleteHoliday(req, res) {
  const h_id = req.params.h_id;
  const q = "DELETE FROM holiday WHERE h_id = ?";

  db.query(q, [h_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json("Holiday #" + h_id + " has been deleted successfully.");
    }
  });
}

function GetAllDivisions(req, res) {
  const cid = req.session.user[0].company_id;

  const q = "SELECT * FROM division WHERE company_id = ? ORDER BY div_name ASC";

  db.query(q, cid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetAllDepartments(req, res) {
  const q =
    "SELECT * FROM dept INNER JOIN division ON dept.div_id = division.div_id INNER JOIN company ON company.company_id = division.company_id ORDER BY dept_name ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetAllPositions(req, res) {
  const q =
    "SELECT * FROM position INNER JOIN dept ON position.dept_id = dept.dept_id INNER JOIN division ON division.div_id = dept.div_id INNER JOIN company ON company.company_id = division.company_id";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetManagersAndRespectiveDepartments(req, res) {
  const cid = req.session.user[0].company_id;
  const q =
    "(SELECT manager_id, dept_id, d.div_id, div_name, dept_name, c.company_id, f_name, s_name FROM dept AS d INNER JOIN emp AS e ON d.manager_id = e.emp_id INNER JOIN division AS di ON d.div_id = di.div_id INNER JOIN company AS c ON di.company_id = c.company_id WHERE c.company_id = ?) UNION (SELECT manager_id, dept_id, d.div_id, div_name, dept_name, c.company_id, Null AS f_name, Null AS s_name FROM dept AS d INNER JOIN division AS di ON d.div_id = di.div_id INNER JOIN company AS c ON di.company_id = c.company_id WHERE d.manager_id IS NULL AND c.company_id = ?)";

  db.query(q, [cid, cid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

//HR ACCESS

function InsertHRAccessData(req, res){
  const q = "INSERT INTO hr_access (`hr_id`) SELECT emp_id FROM emp WHERE emp_role = 1 AND emp_id NOT IN (SELECT DISTINCT e.emp_id FROM emp AS e INNER JOIN hr_access AS h ON e.emp_id = h.hr_id)"

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      // res.json(data);
      console.log(data)
    }
  });
}

function GetHRAccessData(req, res){
  const q = "SELECT e.f_name, e.s_name, h.* FROM hr_access AS h INNER JOIN emp e ON h.hr_id = e.emp_id WHERE e.date_separated IS NULL"

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function UpdateHRAccess(req, res){
  
  console.log("Data: ", req.body)

  const values = [
    req.body.access_employee_management[0] ? 1 : 0,
    req.body.access_applicant_tracking[0] ? 1 : 0,
    req.body.access_pulse[0] ? 1 : 0,
    req.body.access_attendance[0] ? 1 : 0,
    req.body.access_performance[0] ? 1 : 0,
    req.body.access_payroll[0] ? 1 : 0,
    req.body.hr_access_id,
  ]

  const q = "UPDATE hr_access SET `access_employee_management` = ?, `access_applicant_tracking` = ?, `access_pulse` = ?, `access_attendance` = ?, `access_performance` = ?, `access_payroll` = ? WHERE hr_access_id = ?"

  db.query(q, values, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send("success");
      console.log(data)
    }
  });
}

function GetMyHRAccessData(req, res){
  const uid = req.session.user[0].emp_id
  const q = "SELECT * FROM hr_access WHERE hr_id = ?"

  db.query(q, [uid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetAllEmployeesFromCompanyNotHR(req, res){
  const cid = req.session.user[0].company_id
  const q = "SELECT * FROM emp e INNER JOIN emp_designation em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_role != 1 ORDER BY e.s_name ASC"

  db.query(q, [cid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function MakeAnEmployeeHR(req, res){
  const emp_id = req.body.emp_id
  const q = "UPDATE emp SET `emp_role` = 1 WHERE emp_id = ?"

  db.query(q, [emp_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.send("success")
    }
  });
}

module.exports = {
  CreateHoliday,
  DeleteHoliday,
  GetAllDivisions,
  GetAllDepartments,
  GetAllPositions,
  GetManagersAndRespectiveDepartments,

  //HR ACCESS
  InsertHRAccessData,
  GetHRAccessData,
  UpdateHRAccess,
  GetMyHRAccessData,
  GetAllEmployeesFromCompanyNotHR,
  MakeAnEmployeeHR
};
