var db = require("../../config.js");

function CreateEmployeeContribution(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num, contribution_name, contribution_account_id } = req.body;

  const q =
    "INSERT INTO `employee_contributions`(`company_id, `emp_num`, `contribution_name`, `contribution_account_id`) VALUES ?";
  db.query(
    q,
    [comp_id, emp_num, contribution_name, contribution_account_id],
    (err, data) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );
}

function UpdateEmployeeContribution(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num, contribution_name, contribution_account_id } = req.body;

  const q =
    "INSERT INTO contributions (company_id, emp_num, contribution_name, contribution_account_id) VALUES  ?";
  db.query(
    q,
    [comp_id, emp_num, contribution_name, contribution_account_id],
    (err, data) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );
}

function GetEmployeeContribution(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { emp_num } = req.params;

  const q =
    "SELECT * FROM `employee_contributions` WHERE `company_id` = ? AND `emp_num` = ?";
  db.query(q, [emp_num, comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  CreateEmployeeContribution,
  GetEmployeeContribution,
  UpdateEmployeeContribution,
};
