var axios = require("axios");
var db = require("../../config.js");

function CreateRecurrringPay(req, res) {
  const values = [
    req.body.empID,
    req.body.payItemID,
    req.body.amount,
    req.body.dateFrom,
    req.body.dateTo,
  ];

  const q =
    "INSERT INTO `recurring_pay`(`recurring_pay_id`, `emp_id`, `pay_item_id`, `amount`, `date_start`, `date_end`) VALUES (UUID(), ?, ?, ?, ?, ?)";
  db.query(q, values, (err) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function UpdateRecurringPay(req, res) {
  const values = [
    req.body.payItemID,
    req.body.amount,
    req.body.dateFrom,
    req.body.dateTo,
    req.body.id,
  ];

  const q =
    "UPDATE `recurring_pay` SET `pay_item_id`=?, `amount`=?, `date_start`=?, `date_end`=? WHERE `recurring_pay_id` = ?";

  db.query(q, values, (err) => {
    if (err) {
      console.log("Error in query:", err); // Log any query error
      return res.json(err);
    }
    return res.sendStatus(200);
  });
}

function GetAllRecurrringPay(req, res) {
  var cID = req.session.user[0].company_id;
  const q =
    "SELECT rp.recurring_pay_id AS ID, e.emp_id AS 'Employee ID', CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '.'), ''), ' ', e.s_name) AS 'Name',rp.pay_item_id AS 'Pay Item ID', pi.pay_item_name AS 'Pay Item', rp.amount AS 'Amount', rp.date_start AS 'Date Start', rp.date_end AS 'Date End', rp.created_at AS 'Date and Time Created' FROM `recurring_pay` rp INNER JOIN emp e ON e.emp_id = rp.emp_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN pay_items pi ON pi.pay_items_id = rp.pay_item_id WHERE ed.company_id = ?";
  db.query(q, [cID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetEmployeeRecurringPay(req, res) {
  var cID = req.session.user[0].company_id;
  const { empID } = req.params;
  console.log("EMP RP", empID);
  const q =
    "SELECT rp.recurring_pay_id AS ID, e.emp_id AS 'Employee ID', CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '.'), ''), ' ', e.s_name) AS 'Name',rp.recurring_pay_id AS 'Pay Item ID', pi.pay_item_name AS 'Pay Item', rp.amount AS 'Amount', rp.date_start AS 'Date Start', rp.date_end AS 'Date End', rp.created_at AS 'Date and Time Created' FROM `recurring_pay` rp INNER JOIN emp e ON e.emp_id = rp.emp_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN pay_items pi ON pi.pay_items_id = rp.pay_item_id WHERE ed.company_id = ? AND e.emp_id = ?";
  db.query(q, [cID, empID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetActiveEmployeesRP(req, res) {
  var cID = req.session.user[0].company_id;
  const q =
    "SELECT e.emp_id AS 'Employee ID', CONCAT( e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '.'), ''), ' ', e.s_name) AS 'Name' FROM `emp` e INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id WHERE ed.company_id = ? AND (e.date_offboarding IS NULL AND e.date_separated IS NULL)";
  db.query(q, cID, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetRecurringPayItems(req, res) {
  var cID = req.session.user[0].company_id;

  const q =
    "SELECT `pay_items_id` AS 'Pay Item ID', `pay_item_name` as 'Name' FROM `pay_items` WHERE company_id = ? AND pay_item_type LIKE 'Fixed' AND pay_item_name != 'Basic Pay'";

  db.query(q, [cID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  CreateRecurrringPay,
  GetAllRecurrringPay,
  GetEmployeeRecurringPay,
  UpdateRecurringPay,
  GetActiveEmployeesRP,
  GetRecurringPayItems,
};
