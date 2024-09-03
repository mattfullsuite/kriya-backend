var db = require("../../config.js");

function CreateEmployeeSalary(req, res, next) {
  const { employeeInfo } = req.body;
  const { emp_id, salary } = employeeInfo;
  const q = "INSERT INTO `emp_salary`(`emp_id`, `base_pay`) VALUES (?,?)";

  if (salary == "") {
    next();
  } else {
    db.query(q, [emp_id, salary], (err, data) => {
      if (err) {
        console.log("Error: ", err);
        return res.json(err);
      }
      next();
      // return res.sendStatus(200);
    });
  }
}

function GetEmployeeSalary(req, res) {
  const { emp_id } = req.params;
  const query =
    "SELECT * FROM `emp_salary` WHERE `emp_id` = ? ORDER BY `created_at` DESC LIMIT 1";
  db.query(query, [emp_id], (err, data) => {
    if (err) {
      console.log("Error: ", err);
      return res.json(err);
    }
    return res.json(data);
  });
}

const GetEmployeeLastSalaryIncrease = (req, res) => {
  const { emp_id } = req.params;
  const query =
    "SELECT * FROM `emp_salary` WHERE `emp_id` = ? ORDER BY `increase_date` DESC LIMIT 1";
  db.query(query, [emp_id], (error, data) => {
    if (error) {
      console.log("Error: ", error);
      return res.json(error);
    }
    console.log("Data: ", data);
    return res.json(data);
  });
};

module.exports = {
  CreateEmployeeSalary,
  GetEmployeeSalary,
  GetEmployeeLastSalaryIncrease,
};
