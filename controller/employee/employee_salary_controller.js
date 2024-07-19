var db = require("../../config.js");

function CreateEmployeeSalary(req, res) {
  const { emp_id, base_pay } = req.body;

  const q = "INSERT INTO `emp_salary`(`emp_id`, `base_pay`) VALUES ?";
  db.query(q, [emp_id, base_pay], (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

module.exports = {
  CreateEmployeeSalary,
};
