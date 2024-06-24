var db = require("../../config.js");

function CreateEmployeeBenefit(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num, benefit_name, benefit_account_id } = req.body;

  const q =
    "INSERT INTO `employee_benefits`(`emp_num`, `company_id, `benefit_name`, `benefit_account_id`) VALUES ?";
  db.query(
    q,
    [emp_num, comp_id, benefit_name, benefit_account_id],
    (err, data) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );
}

function GetEmployeeBenefit(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num } = req.params;

  const q =
    "SELECT * FROM `employee_benefits` WHERE `emp_num` = ? and `company_id` = ?";
  db.query(q, [emp_num, comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  CreateEmployeeBenefit,
  GetEmployeeBenefit,
};
