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

module.exports = {
  CreateEmployeeSalary,
};
