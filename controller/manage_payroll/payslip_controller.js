// Imports
var axios = require("axios");
var db = require("../../config.js");

const createPayslip = (req, res) => {
  const data = req.body;

  const dataProcessed = data.map((items) => {
    const {
      companyID,
      "Employee ID": employeeID,
      "Last Name": lastName,
      "First Name": firstName,
      "Middle Name": middleName,
      Email,
      "Job Title": jobTitle,
      "Hire Date": hireDate,
      Dates,
      "Pay Items": payItems,
      Totals,
      "Net Pay": netPay,
      generated_by,
    } = items;

    return [
      companyID,
      employeeID,
      lastName,
      firstName,
      middleName,
      Email,
      netPay,
      JSON.stringify(Dates),
      JSON.stringify(payItems),
      JSON.stringify(Totals),
      generated_by,
    ];
  });
  const query = db.query(
    `INSERT INTO payslip (company_id, emp_num, last_name, first_name, middle_name, email, net_salary, dates, payables, totals, generated_by) VALUES ?;`,
    [dataProcessed],
    async (error, response) => {
      if (error) {
        console.error(error);
        response.sendStatus(500);
      } else {
        response.sendStatus(200);
        // const result = await generatePDF(data);
        // console.log(result);
        // if (result == 200) {
        //   res.status(200).json(result);
        // } else {
        //   res.status(500).json({ "Error PDF: ": result });
        // }
      }
    }
  );
};

const generatePDF = async (data) => {
  console.log("Data to Generate: ", data);
  console.log("Generating PDF!");

  const result = await axios
    .post(`https://pdf-generation-test.onrender.com/generate-and-send`, data)
    .then(function (response) {
      return response.status;
    })
    .catch(function (error) {
      console.error("Error: ", error);
    });
  return result;
};

const getUserPayslip = (req, res) => {
  const uid = req.session.user[0].emp_num;
  const q =
    "SELECT * FROM payslip WHERE emp_num = ? ORDER BY JSON_EXTRACT(`dates`, '$.Payment') DESC";
  db.query(q, [uid], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

const getUserYTD = (req, res) => {
  const uid = req.session.user[0].emp_num;
  const q =
    "SELECT YEAR(NOW()) as 'year', SUM(JSON_EXTRACT(`totals`, '$.Earnings')) as `earnings`, SUM(JSON_EXTRACT(`totals`, '$.Deductions')) as `deductions`, SUM(`net_salary`) as `net_salary` FROM `payslip` WHERE `emp_num` = ? AND SUBSTRING(JSON_EXTRACT(`dates`, '$.To'), 2,4) = YEAR(NOW()) GROUP BY `emp_num`";

  db.query(q, [uid], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

const getAllPaySlipGroups = (req, res) => {
  const uid = req.session.user[0].emp_num;
  const compID = req.session.user[0].company_id;
  const q =
    "SELECT DISTINCT DATE_FORMAT(`created_at`, '%m/%d/%Y %H:%i:%s' ) AS `created_at`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.From')),'%m/%d/%Y') AS `date_from`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.To')),'%m/%d/%Y') AS `date_to`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.Payment')),'%m/%d/%Y') AS `date_payment`, `source`  FROM payslip WHERE company_id = " +
    compID +
    " GROUP BY `created_at`, `date_from`, `date_to`, `date_payment`, `source` ORDER BY `created_at` DESC;";

  db.query(q, [uid], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

const getAllPaySlip = (req, res) => {
  const uid = req.session.user[0].emp_num;
  const compID = req.session.user[0].company_id;
  const q =
    "SELECT e.emp_num, CONCAT(e.f_name,' ', e.m_name,' ', e.s_name) AS 'emp_name',e.work_email,  e.date_hired, ps.dates, ps.payables, ps.totals, ps.net_salary, CONCAT(e2.f_name, ' ', e2.m_name, ' ', e2.s_name) AS `generated_by`, ps.source, DATE_FORMAT(ps.`created_at`, '%m/%d/%Y %H:%i:%s') AS 'created_at' FROM `payslip` ps INNER JOIN emp e ON e.emp_num = ps.emp_num INNER JOIN `emp` e2 on e2.emp_num = ps.generated_by WHERE company_id = " +
    compID +
    " ORDER BY `created_at` DESC;";

  db.query(q, [uid], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

module.exports = {
  createPayslip,
  getUserPayslip,
  getUserYTD,
  getAllPaySlipGroups,
  getAllPaySlip,
};
