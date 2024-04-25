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
    ];
  });

  const query = db.query(
    `INSERT INTO payslip (company_id, emp_num, last_name, first_name, middle_name, email, net_salary, dates, payables, totals) VALUES ?;`,
    [dataProcessed],
    async (error, response) => {
      if (error) {
        console.error(error);
        response.sendStatus(500);
      } else {
        const result = await generatePDF(data);
        console.log(result);
        if (result == 200) {
          res.status(200).json(result);
        } else {
          res.status(500).json({ "Error PDF: ": result });
        }
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
    "SELECT YEAR(NOW()) as 'year', SUM(JSON_EXTRACT(`totals`, '$.Earnings')) as `earnings`, SUM(JSON_EXTRACT(`totals`, '$.Deductions')) as `deductions`, SUM(`net_salary`) as `net_salary` FROM `payslip` WHERE `emp_num` = '" +
    uid +
    "' AND SUBSTRING(JSON_EXTRACT(`dates`, '$.Payment'), 2,4) = YEAR(NOW()) GROUP BY `emp_num`";

  db.query(q, [uid], (err, rows) => {
    if (err) return res.json(err);
    return res.status(200).json(rows);
  });
};

module.exports = {
  createPayslip,
  getUserPayslip,
  getUserYTD,
};
