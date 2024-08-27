// Imports
var axios = require("axios");
var db = require("../../config.js");
var moment = require("moment");

const createPayslip = async (req, res) => {
  const data = req.body;
  const compID = req.session.user[0].company_id;
  const uid = req.session.user[0].emp_num;
  const { source } = req.params;

  const dataProcessed = data.map((items) => {
    const {
      "Employee ID": employeeID,
      // "Last Name": lastName,
      // "First Name": firstName,
      // "Middle Name": middleName,
      Email,
      // "Job Title": jobTitle,
      // "Hire Date": hireDate,
      Dates,
      "Pay Items": payItems,
      Totals,
      "Net Pay": netPay,
    } = items;

    return [
      compID,
      employeeID,
      Email,
      JSON.stringify(Dates),
      JSON.stringify(payItems),
      JSON.stringify(Totals),
      netPay,
      uid,
      source,
    ];
  });

  try {
    await db.query(
      `INSERT INTO payslip (company_id, emp_num, email, dates, payables, totals, net_salary, generated_by, source) VALUES ?;`,
      [dataProcessed],
      async (error, data) => {
        if (error) {
          console.error(error);
          return res.sendStatus(500);
        } else {
          return res.sendStatus(200);
        }
      }
    );
  } catch (error) {
    console.error("Catch Error: ", error);
    return res.sendStatus(500).json({ "Error: ": error });
  }
};

const removeZeroValues = (data) => {
  return data.map((employee) => {
    const updatedPayItems = {};

    for (const [category, items] of Object.entries(employee["Pay Items"])) {
      updatedPayItems[category] = {};

      for (const [item, value] of Object.entries(items)) {
        if (parseFloat(value) !== 0) {
          updatedPayItems[category][item] = value;
        }
      }
    }

    return {
      ...employee,
      "Pay Items": updatedPayItems,
    };
  });
};

const generatePDF = async (data) => {
  // const result = await axios
  //   .post(`https://pdf-generation-test.onrender.com/generate-and-send`, data)
  //   .then(function (response) {
  //     return response;
  //   })
  //   .catch(function (error) {
  //     console.error("Error: ", error);
  //   });
  // return result;

  try {
    const response = await axios.post(
      "https://pdf-generation-test.onrender.com/generate-and-send",
      data,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error: ", error);
    return error;
  }
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
  const compID = req.session.user[0].company_id;
  const q =
    "SELECT DISTINCT DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.From')),'%m/%d/%Y') AS `date_from`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.To')),'%m/%d/%Y') AS `date_to`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.Payment')),'%m/%d/%Y') AS `date_payment`, `source`  FROM payslip WHERE company_id = ? GROUP BY `date_from`, `date_to`, `date_payment`, `source` ORDER BY `date_payment` DESC;";

  db.query(q, [compID], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

const getAllPaySlip = (req, res) => {
  const compID = req.session.user[0].company_id;
  const q =
    "SELECT ps.`emp_num` AS 'Employee ID', e.`s_name` AS 'Last Name', e.`f_name` AS 'First Name', e.`m_name` AS 'Middle Name', ps.`email` AS 'Email', p.position_name AS 'Job Title', DATE_FORMAT(e.`date_hired`, '%m/%d/%Y') AS 'Hire Date', DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.From')),'%m/%d/%Y') AS `Date From`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.To')),'%m/%d/%Y') AS `Date To`, DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(`dates`, '$.Payment')),'%m/%d/%Y') AS `Date Payment`, ps.payables, ps.totals, ps.net_salary, CONCAT(emp.f_name, ' ', emp.s_name) AS `generated_by`, ps.source, DATE_FORMAT(ps.`created_at`, '%m/%d/%Y %H:%i:%s') AS 'created_at' FROM `payslip` ps INNER JOIN `emp` e on e.emp_num = ps.emp_num INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN position p on p.position_id = ed.position_id INNER JOIN `emp` emp ON emp.emp_num = ps.generated_by WHERE ed.company_id = ? ORDER BY `created_at` DESC;";

  db.query(q, [compID], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

// Last Pay Run

// Get Offboarding Employees
const getOffBoardingEmployees = (req, res) => {
  const compID = req.session.user[0].company_id;
  const q = `SELECT e.emp_id, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL AND e.m_name != '', CONCAT(LEFT(e.m_name, 1), '. '), ' '), e.s_name) AS name, e.f_name, e.m_name, e.s_name, e.emp_num, e.work_email, pos.position_name, e.date_hired, e.date_separated, 0.00 AS 'base_pay', 0.00 AS 'daily_rate', 0.00 AS 'hourly_rate', rp.recent_payment, rp.recent_duration_to, c.company_name, c.company_loc FROM emp e INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN position pos ON pos.position_id = ed.position_id INNER JOIN company c ON c.company_id = ed.company_id LEFT JOIN (SELECT p.emp_num, JSON_UNQUOTE(JSON_EXTRACT(p.dates, '$.Payment')) AS recent_payment, JSON_UNQUOTE(JSON_EXTRACT(p.dates, '$.To')) AS recent_duration_to, p.source FROM payslip p INNER JOIN (SELECT emp_num, MAX(JSON_UNQUOTE(JSON_EXTRACT(dates, '$.To'))) AS recent_duration_to FROM payslip WHERE SUBSTRING(JSON_EXTRACT(dates, '$.To'), 2, 4) = YEAR(NOW()) GROUP BY emp_num) rp ON p.emp_num = rp.emp_num AND JSON_UNQUOTE(JSON_EXTRACT(p.dates, '$.To')) = rp.recent_duration_to) rp ON e.emp_num = rp.emp_num WHERE ed.company_id = ? AND e.date_separated IS NOT NULL AND (rp.source IS NULL OR rp.source != "Last Payrun") ORDER BY e.date_separated DESC;`;
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
    "SELECT e.emp_num, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL and e.m_name != '', LEFT(e.m_name, 1), 'N/A'), '.', ' ',e.s_name) AS 'name', p.dates, p.payables, p.totals, p.net_salary, p.source FROM `payslip` p INNER JOIN emp e ON e.emp_num = p.emp_num INNER JOIN emp_designation ed on ed.emp_id = e.emp_id WHERE ed.company_id = ? AND e.emp_num = ? AND SUBSTRING(JSON_EXTRACT(p.`dates`, '$.Payment'), 2,4) = YEAR(NOW()) ORDER BY JSON_EXTRACT(p.`dates`, '$.Payment') DESC";
  db.query(q, [compID, empID], (err, rows) => {
    if (err) return res.json(err);
    const processedData = appendPayItemValues(tranformData(rows), payItems);
    return res.status(200).json(processedData);
  });
};

const appendPayItemValues = (payItemYTD, payItems) => {
  payItems.forEach((payItem) => {
    delete payItem.pay_items_id;
    delete payItem.company_id;
    delete payItem.created_at;
    payItem["last_pay_amount"] = 0.0;
    if (payItem.pay_item_name in payItemYTD) {
      payItem["ytd_amount"] = parseFloat(
        payItemYTD[payItem.pay_item_name]
      ).toFixed(2);

      payItem["visible"] =
        checkValue(payItem["ytd_amount"]) ||
        checkValue(payItem["last_pay_amount"]);
      return;
    }
    payItem["ytd_amount"] = 0.0;
    payItem["visible"] =
      checkValue(payItem["ytd_amount"]) ||
      checkValue(payItem["last_pay_amount"]);
  });
  return payItems;
};

const checkValue = (value) => {
  return parseFloat(value) != 0;
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

function getActiveEmployeeAndSalary(req, res) {
  const compID = req.session.user[0].company_id;
  const q =
    "WITH ranked_rows AS (SELECT emp_num, net_salary, JSON_UNQUOTE(JSON_EXTRACT(dates, '$.Payment')) AS payment_date, ROW_NUMBER() OVER (PARTITION BY emp_num ORDER BY JSON_UNQUOTE(JSON_EXTRACT(dates, '$.Payment')) DESC) AS `rank` FROM payslip WHERE JSON_UNQUOTE(JSON_EXTRACT(dates, '$.Payment')) < ?) SELECT e.emp_num AS 'Employee ID', e.s_name AS 'Last Name', e.f_name AS 'First Name', e.m_name AS 'Middle Name', e.work_email AS 'Email', p.position_name AS 'Job Title', e.date_hired AS 'Hire Date', s.base_pay AS 'Basic Pay', IFNULL(absences.absences, 0) AS 'Absences', IFNULL(rr.net_salary_1, 'N/A') AS 'Previous Net Pay 1',  IFNULL(rr.net_salary_2, 'N/A') AS 'Previous Net Pay 2',  IFNULL(rr.net_salary_3, 'N/A') AS 'Previous Net Pay 3' FROM emp e INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN position p ON p.position_id = ed.position_id LEFT JOIN emp_salary s ON s.emp_id = e.emp_id INNER JOIN (SELECT emp_id, MAX(created_at) AS latest_salary_date FROM emp_salary GROUP BY emp_id) es ON es.emp_id = s.emp_id AND es.latest_salary_date = s.created_at LEFT JOIN (SELECT l.requester_id, ROUND((COUNT(l.leave_id) * (IFNULL(es.base_pay, 0)/cc.configuration_value) * -1),2) AS absences FROM leaves l INNER JOIN emp_designation ed on l.requester_id = ed.emp_id INNER JOIN company_configuration cc on ed.company_id = cc.company_id LEFT JOIN (SELECT emp_id, MAX(base_pay) AS base_pay, MAX(created_at) AS latest_salary_date FROM emp_salary GROUP BY emp_id) es ON es.emp_id = l.requester_id WHERE ed.company_id = ? AND l.leave_from >= ? AND l.leave_to <= ? AND l.use_pto_points = 0 AND cc.configuration_name = 'Monthly Working Days' GROUP BY l.requester_id, cc.configuration_value) absences ON absences.requester_id = e.emp_id LEFT JOIN (SELECT emp_num, MAX(CASE WHEN `rank` = 1 THEN net_salary END) AS net_salary_1, MAX(CASE WHEN `rank` = 1 THEN payment_date END) AS payment_date_1, MAX(CASE WHEN `rank` = 2 THEN net_salary END) AS net_salary_2, MAX(CASE WHEN `rank` = 2 THEN payment_date END) AS payment_date_2, MAX(CASE WHEN `rank` = 3 THEN net_salary END) AS net_salary_3, MAX(CASE WHEN `rank` = 3 THEN payment_date END) AS payment_date_3 FROM ranked_rows GROUP BY emp_num) rr ON e.emp_num = rr.emp_num WHERE e.date_offboarding IS NULL AND e.date_separated IS NULL AND ed.company_id = ? ORDER BY e.emp_num;";

  db.query(
    q,
    [req.query.payment, compID, req.query.from, req.query.to, compID],
    (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    }
  );
}

module.exports = {
  createPayslip,
  getUserPayslip,
  getUserYTD,
  getAllPaySlipGroups,
  getAllPaySlip,
  getEmployeePayslipCurrentYear,
  getActiveEmployeeAndSalary,
  getOffBoardingEmployees,
};
