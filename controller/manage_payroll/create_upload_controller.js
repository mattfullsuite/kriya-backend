var db = require("../../config.js");

// --------------------Payroll Notification--------------------
// Get the required information of the employee
const GetPayrollNotifRecordInfo = (req, res) => {
  const empID = req.params.empID;
  const compID = req.session.user[0].company_id;
  const query =
    "SELECT e.`emp_num` AS 'Employee ID', e.work_email as `Email`, e.`s_name` AS 'Last Name', e.`f_name` AS 'First Name', e.`m_name` AS 'Middle Name', p.`position_name` AS 'Job Title', e.`date_hired` AS 'Hire Date', es.base_pay / cc.configuration_value AS 'Basic Pay' FROM `emp` e INNER JOIN `emp_designation` ed ON e.emp_id = ed.emp_id INNER JOIN `position` p ON p.position_id = ed.position_id INNER JOIN company_configuration cc ON cc.company_id = ed.company_id LEFT JOIN ( SELECT es.`emp_id`, es.`base_pay` FROM `emp_salary` es INNER JOIN emp e ON e.emp_id = es.emp_id WHERE e.emp_num = ? ORDER BY es.created_at DESC LIMIT 1 ) es ON es.emp_id = e.emp_id WHERE cc.configuration_name = 'Monthly Payroll Frequency' AND cc.company_id = ? AND e.emp_num = ?";
  db.query(query, [empID, compID, empID], (error, data) => {
    if (error) return res.json(error);
    return res.json(data);
  });
};

module.exports = {
  GetPayrollNotifRecordInfo,
};
