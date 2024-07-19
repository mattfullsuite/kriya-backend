var db = require("../../config.js");

function CreateEmployeeSalary(req, res, next) {
  const { employeeInfo } = req.body;
  const salaryInfo = [employeeInfo.emp_id, employeeInfo.salary];
  const q = "INSERT INTO `emp_salary`(`emp_id`, `base_pay`) VALUES (?)";
  db.query(q, [salaryInfo], (err, data) => {
    if (err) {
      console.log("Error: ", err);
      return res.json(err);
    }
    next();
    // return res.sendStatus(200);
  });
}

module.exports = {
  CreateEmployeeSalary,
};
