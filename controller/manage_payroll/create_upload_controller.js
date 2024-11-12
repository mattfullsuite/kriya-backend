var db = require("../../config.js");
const { v7: uuidv7 } = require("uuid");

// --------------------Payroll Notification--------------------
// Get the required information of the employee
exports.GetPayrollNotifRecordInfo = (req, res) => {
  const empID = req.params.empID;
  const compID = req.session.user[0].company_id;
  const query =
    "SELECT e.`emp_num` AS 'Employee ID', e.work_email as `Email`, e.`s_name` AS 'Last Name', e.`f_name` AS 'First Name', e.`m_name` AS 'Middle Name', p.`position_name` AS 'Job Title', e.`date_hired` AS 'Hire Date', es.base_pay AS 'Basic Pay', cc.monthly_payroll_frequency AS 'Monthly Payroll Frequency', cc.monthly_working_days AS 'Monthly Working Days'  FROM `emp` e INNER JOIN `emp_designation` ed ON e.emp_id = ed.emp_id INNER JOIN `position` p ON p.position_id = ed.position_id INNER JOIN (SELECT company_id,  SUM(CASE WHEN `configuration_name` = 'Monthly Payroll Frequency' THEN `configuration_value` END) AS 'monthly_payroll_frequency', SUM(CASE WHEN `configuration_name` = 'Monthly Working Days' THEN `configuration_value` END) AS 'monthly_working_days' FROM `company_configuration` WHERE company_id = ? GROUP BY `company_id`) cc ON cc.company_id = ed.company_id LEFT JOIN ( SELECT es.`emp_id`, es.`base_pay` FROM `emp_salary` es INNER JOIN emp e ON e.emp_id = es.emp_id WHERE e.emp_num = ? ORDER BY es.created_at DESC LIMIT 1 ) es ON es.emp_id = e.emp_id WHERE cc.company_id = ? AND e.emp_num = ?";
  db.query(query, [compID, empID, compID, empID], (error, data) => {
    if (error) return res.json(error);
    return res.json(data);
  });
};

// Create payroll notification draft
exports.CreatePayrollNotifDraft = (req, res) => {
  console.log(req.body);
  const { recordList, dateUUID } = req.body;

  // Flatten the values for binding to the placeholders
  const values = recordList.reduce((acc, record) => {
    return acc.concat([
      record.empID,
      record.payItemID,
      record.amount,
      dateUUID,
    ]);
  }, []);
  const query =
    "INSERT INTO `payroll_notif`(`payroll_notif_id`, `emp_num`, `pay_item_id`, `amount`, date_id) VALUES " +
    recordList.map(() => "(UUID(), ?, ?, ?, ?)").join(", ");
  db.query(query, values, (error, result) => {
    console.log("ERRor", error);
    console.log("Result", result);
    if (error) return res.json(error);
    return res.status(200).json(result);
  });
};

exports.CreatePayrollNotifDraftDate = (req, res, next) => {
  console.log(req.body);
  const dateUUID = uuidv7();
  const { datePeriod } = req.body;
  console.log("UUID:", dateUUID);
  console.log("Date Period:", datePeriod);
  const query =
    "INSERT INTO `payroll_notif_dates`(`payroll_notif_date_id`, `date_from`, `date_to`, `date_payment`) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [dateUUID, datePeriod.From, datePeriod.To, datePeriod.Payment],
    (error, result) => {
      console.log("ERRor", error);
      console.log("Result", result);
      if (error) return res.json(error);
      req.body.dateUUID = dateUUID;
      next();
      // return res.json(result);
    }
  );
};
