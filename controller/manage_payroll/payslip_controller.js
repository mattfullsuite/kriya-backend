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
    (error, data) => {
      if (error) {
        console.error(error);
        return res.sendStatus(500);
      } else {
        return res.sendStatus(200);
      }
    }
  );
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
    "SELECT e.emp_num, CONCAT(e.f_name,' ', e.m_name,' ', e.s_name) AS 'emp_name',e.work_email, DATE_FORMAT( e.`date_hired`, '%m/%d/%Y') AS 'Date Hired', DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.From')),'%m/%d/%Y') AS `Date From`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.To')),'%m/%d/%Y') AS `Date To`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.Payment')),'%m/%d/%Y') AS `Date Payment`, ps.payables, ps.totals, ps.net_salary, CONCAT(e2.f_name, ' ', e2.s_name) AS `generated_by`, ps.source, DATE_FORMAT(ps.`created_at`, '%m/%d/%Y %H:%i:%s') AS 'created_at' FROM `payslip` ps INNER JOIN emp e ON e.emp_num = ps.emp_num INNER JOIN `emp` e2 on e2.emp_num = ps.generated_by WHERE company_id = " +
    compID +
    " ORDER BY `created_at` DESC;";

  db.query(q, [uid], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

// Last Pay Run

// Get Offboarding Employees
const getOffBoardingEmployees = (req, res) => {
  const compID = req.session.user[0].company_id;
  const q =
    "SELECT e.emp_id, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', LEFT(e.m_name, 1), 'N/A'), '.', ' ', e.s_name) AS name, e.emp_num, e.date_hired, e.date_separated, ec.base_pay, rp.recent_payment FROM emp e INNER JOIN emp_compensation ec ON ec.emp_num = e.emp_num INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id LEFT JOIN (SELECT p.emp_num, MAX(JSON_UNQUOTE(JSON_EXTRACT(p.dates, '$.Payment'))) AS recent_payment FROM payslip p WHERE SUBSTRING(JSON_EXTRACT(p.dates, '$.To'), 2, 4) = YEAR(NOW()) GROUP BY p.emp_num) rp ON e.emp_num = rp.emp_num WHERE ed.company_id = ? AND e.date_separated > NOW() ORDER BY e.date_separated DESC;";
  db.query(q, compID, (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

// Pay Items YTD

const getAllPayItems = async (compID) => {
  return new Promise((resolve, reject) => {
    const q = "SELECT * FROM pay_items WHERE company_id = ?";
    db.query(q, [compID], (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

const getEmployeePayslipCurrentYear = async (req, res) => {
  const { empID } = req.params;
  const compID = req.session.user[0].company_id;

  const payItems = await getAllPayItems(compID);

  const q =
    "SELECT e.emp_num, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL and e.m_name != '', LEFT(e.m_name, 1), 'N/A'), '.', ' ',e.s_name) AS 'name', p.dates, p.payables, p.totals, p.net_salary, p.source FROM `payslip` p INNER JOIN emp e ON e.emp_num = p.emp_num INNER JOIN emp_designation ed on ed.emp_id = e.emp_id WHERE ed.company_id = ? AND e.emp_num = ? AND SUBSTRING(JSON_EXTRACT(p.`dates`, '$.To'), 2,4) = YEAR(NOW()) ORDER BY JSON_EXTRACT(p.`dates`, '$.Payment') DESC";
  db.query(q, [compID, empID], (err, rows) => {
    if (err) return res.json(err);
    const processedData = appendPayItemValues(tranformData(rows), payItems);
    console.log("processed data: ", processedData);
    return res.status(200).json(processedData);
  });
};

const appendPayItemValues = (payItemYTD, payItems) => {
  payItems.forEach((payItem) => {
    delete payItem.pay_items_id;
    delete payItem.company_id;
    delete payItem.created_at;
    if (payItem.pay_item_name in payItemYTD) {
      payItem["amount"] = parseFloat(payItemYTD[payItem.pay_item_name]).toFixed(
        2
      );
      return;
    }
    payItem["amount"] = 0.0;
  });
  return payItems;
};

const tranformData = (data) => {
  const transformedData = [];
  // Array
  data.forEach((record) => {
    const newObject = {};
    // In each object flatten the payables
    Object.keys(record).forEach((key) => {
      if (key == "payables") {
        const dataObject = JSON.parse(record[key]);
        Object.keys(dataObject).forEach((keyLevel1) => {
          if (key == "payables") {
            const categories = dataObject[keyLevel1];
            Object.keys(categories).forEach((payItem) => {
              newObject[payItem] = categories[payItem];
            });
          }
          // newObject[keyLevel1] = dataObject[keyLevel1];
        });
      }
      if (key == "emp_num") {
        newObject[key] = record[key];
      }
    });
    transformedData.push(newObject);
  });

  // return transformedData;
  return getSumPayItems(transformedData);
};

const getSumPayItems = (data) => {
  return data.reduce((acc, record) => {
    Object.keys(record).forEach((key) => {
      if (key != "emp_num") {
        if (!acc[key]) {
          acc[key] = 0.0;
        }
        acc[key] += parseFloat(record[key]);
      }
    });
    return acc;
  }, {});
};

module.exports = {
  createPayslip,
  getUserPayslip,
  getUserYTD,
  getAllPaySlipGroups,
  getAllPaySlip,
  getEmployeePayslipCurrentYear,
  getOffBoardingEmployees,
};
