var db = require("../../config.js");

function CreateEmployeeContribution(req, res) {
  console.log("Contributions Controller");
  const comp_id = req.session.user[0].company_id;
  const data = req.body.contributions;
  console.log("data: ", data);
  console.log("Type of: ", typeof data);
  console.log("Data: ", JSON.parse(JSON.stringify(data)));
  const userID = req.body.emp_id;

  // Transform the data
  const formattedData = Object.entries(data).map(([key, value]) => {
    const keyValue = key.toUpperCase();
    return [comp_id, userID, keyValue, value];
  });

  const q =
    "INSERT INTO `employee_contributions`(`company_id, `emp_num`, `contribution_name`, `contribution_account_id`) VALUES ?";
  db.query(q, [formattedData], (err, data) => {
    if (err) return res.json(err);
    return res.send("success");
  });
}

function UpdateEmployeeContribution(req, res) {
  const comp_id = req.session.user[0].company_id;
  const data = req.body;
  const userID = req.params.id;

  // Transform the data
  const formattedData = Object.entries(data).map(([key, value]) => {
    const keyValue = key.toUpperCase();
    return [comp_id, userID, keyValue, value];
  });

  const q = `
    INSERT INTO employee_contributions (company_id, emp_id, contribution_name, contribution_account_id)
    VALUES ?
    ON DUPLICATE KEY UPDATE contribution_account_id = VALUES(contribution_account_id);
  `;

  db.query(q, [formattedData], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.send("success");
  });
}

function GetEmployeeContribution(req, res) {
  const comp_id = req.session.user[0].company_id;
  const emp_ID = req.params.id;

  const q =
    "SELECT * FROM `employee_contributions` WHERE `company_id` = ? AND `emp_id` = ?";
  db.query(q, [comp_id, emp_ID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  CreateEmployeeContribution,
  GetEmployeeContribution,
  UpdateEmployeeContribution,
};
