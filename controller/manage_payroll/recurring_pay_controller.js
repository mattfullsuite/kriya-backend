var axios = require("axios");
var db = require("../../config.js");

function CreateRecurrringPay(req, res) {
  const values = [
    req.body.empID,
    req.body.payItemName,
    req.body.totalAmount,
    req.body.numPayrun,
    req.body.deductionPerPayrun,
    req.body.dateStart,
    req.body.dateEnd,
  ];

  const q =
    "INSERT INTO `recurring_pay`(`uuid`, `emp_id`, `pay_item_name`, `total_amount`, `num_payrun`, `deduction_per_payrun`, `date_start`, `date_end`) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)";
  db.query(q, values, (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function GetAllRecurrringPay(req, res) {
  var cID = req.session.user[0].company_id;
  const q =
    "SELECT rp.id AS ID, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '.'), ''), ' ', e.s_name) AS 'Name', pi.pay_item_name AS 'Pay Item', rp.total_amount AS 'Total Amount', rp.num_payrun AS 'Number of Payrun', rp.deduction_per_payrun AS 'Deduction Per Payrun', rp.date_start AS 'Date Start', rp.date_end AS 'Date End', rp.created_at AS 'Date and Time Created' FROM `recurring_pay` rp INNER JOIN emp e ON e.emp_id = rp.emp_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN pay_items pi ON pi.pay_items_id = rp.pay_item_id WHERE ed.company_id = ?";
  db.query(q, [cID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetCertainRecurrringPay(req, res) {
  var cID = req.session.user[0].company_id;
  const { rpID } = req.params;
  const q =
    "SELECT rp.id AS ID, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '.'), ''), ' ', e.s_name) AS 'Name', pi.pay_item_name AS 'Pay Item', rp.total_amount AS 'Total Amount', rp.num_payrun AS 'Number of Payrun', rp.deduction_per_payrun AS 'Deduction Per Payrun', rp.date_start AS 'Date Start', rp.date_end AS 'Date End', rp.created_at AS 'Date and Time Created' FROM `recurring_pay` rp INNER JOIN emp e ON e.emp_id = rp.emp_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN pay_items pi ON pi.pay_items_id = rp.pay_item_id WHERE ed.company_id = ? AND rp.id = ?";
  db.query(q, [cID, rpID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function UpdateRecurrringPay(req, res) {
  var cID = req.session.user[0].company_id;
  const values = [
    req.body.payItemName,
    req.body.totalAmount,
    req.body.numPayrun,
    req.body.deductionPerPayrun,
    req.body.dateStart,
    req.body.dateEnd,
  ];

  const q =
    "UPDATE `recurring_pay` SET `pay_item_name`=?,`total_amount`=?,`num_payrun`=?,`deduction_per_payrun`=?,`date_start`=?,`date_end`=?";
  db.query(q, values, (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function GetActiveEmployeesRP(req, res) {
  var cID = req.session.user[0].company_id;
  const q =
    "SELECT e.emp_id AS 'Employee ID', CONCAT( e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '.'), ' '), e.s_name) AS 'Name' FROM `emp` e INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id WHERE ed.company_id = ? AND (e.date_offboarding IS NULL AND e.date_separated IS NULL)";
  db.query(q, cID, (err, data) => {
    if (err) return res.json(err);
    console.log(data);
    return res.json(data);
  });
}

module.exports = {
  CreateRecurrringPay,
  GetAllRecurrringPay,
  GetCertainRecurrringPay,
  UpdateRecurrringPay,
  GetActiveEmployeesRP,
};
