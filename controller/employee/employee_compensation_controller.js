var db = require("../../config.js");

function CreateEmployeeCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num, compensation_id, compensation_value, effective_date } =
    req.body;

  const q =
    "INSERT INTO `employee_compensation`(`emp_num`, `company_id, `compensation_id`, `compensation_value`, `effective_date`) VALUES ?";
  db.query(
    q,
    [emp_num, comp_id, compensation_id, compensation_value, effective_date],
    (err, data) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );
}

function GetEmployeeCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num } = req.params;

  const q =
    "SELECT * FROM `employee_compensation` WHERE `emp_num` = ? and `company_id` = ?";
  db.query(q, [emp_num, comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  CreateEmployeeCompensation,
  GetEmployeeCompensation,
};
