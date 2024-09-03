const { JsonWebTokenError } = require("jsonwebtoken");
var db = require("../config.js");
var moment = require("moment");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

function GetDataOfLoggedInUser(req, res) {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetDataForCertainEmployee(req, res) {
  const emp_id = req.params.emp_id;
  const q =
    "SELECT *, base_pay AS 'salary' FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN leave_credits lc ON e.emp_id = lc.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id INNER JOIN company AS c ON c.company_id = em.company_id LEFT JOIN emp_salary es ON es.emp_id = e.emp_id WHERE e.emp_id = ? ORDER BY es.created_at DESC LIMIT 1 ";

  db.query(q, [emp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetSuperiorDataOfCertainUser(req, res) {
  const emp_id = req.params.emp_id;
  const q =
    "SELECT s.f_name, s.m_name, s.s_name, p.position_name, s.work_email FROM emp AS e INNER JOIN emp AS s ON e.superior_id = s.emp_id INNER JOIN emp_designation AS em ON s.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";

  db.query(q, [emp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetSuperiorDataOfLoggedInUser(req, res) {
  const uid = req.session.user[0].superior_id;
  const q =
    "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function OffboardEmployee(req, res) {
  const fetchid = req.params.emp_id;

  const q =
    "UPDATE emp SET date_offboarding = '" +
    req.body.date_offboarding +
    "', date_separated = '" +
    req.body.date_separated +
    "' WHERE emp_id = " +
    fetchid;

  db.query(q, (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      // res.send("success")
      const q1 = "SELECT superior_id FROM emp WHERE emp_id = " + fetchid;

      db.query(q1, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const q2 =
            "UPDATE emp SET superior_id = " +
            data[0].superior_id +
            " WHERE superior_id = " +
            fetchid;

          db.query(q2, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.send("success");
            }
          });
        }
      });
    }
  });
}

function AddEmployee(req, res, next) {
  // app.post("/addNewEmployee", upload.single("emp_pic"), (req, res) => {
  function generateRandomString(n) {
    let randomString = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

    for (let i = 0; i < n; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return randomString;
  }

  const tempPassword = generateRandomString(20);

  const empKey = generateRandomString(30);

  //----- HASHING ALGO -----//
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(tempPassword, salt);
  const filename = req.file === undefined ? null : req.file.filename;
  const { employeeInfo } = req.body;
  const q =
    "INSERT INTO `emp` ( `emp_num`, `work_email`, `password`, `f_name`, `m_name`, `s_name`, `emp_role`,`personal_email`, `contact_num`, `dob`, `p_address`, `c_address`, `date_hired`, `date_regularization`,`emp_status`,`sex`,`gender`,`civil_status`, `emp_key`, `emp_pic`) VALUES (?)";
  const values = [
    employeeInfo.emp_num,
    employeeInfo.work_email,
    hashed,
    employeeInfo.f_name,
    employeeInfo.m_name,
    employeeInfo.s_name,
    employeeInfo.emp_role,
    employeeInfo.personal_email,
    employeeInfo.contact_num,
    employeeInfo.dob,
    employeeInfo.p_address,
    employeeInfo.c_address,
    employeeInfo.date_hired,
    employeeInfo.date_regularization,
    employeeInfo.emp_status,
    employeeInfo.sex,
    employeeInfo.gender,
    employeeInfo.civil_status,
    empKey,
    filename,
  ];

  db.query(q, [values], (err, result) => {
    if (err) {
      res.send("error");
    } else {
      req.body.employeeInfo.emp_id = result.insertId;
      //const q4 = "UPDATE dept SET manager_id = (SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1) WHERE dept_id = " + req.body.dept_id;

      const q2 =
        "INSERT INTO `leave_credits` (`emp_id`, `leave_balance`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1)," +
        0 +
        ")";

      db.query(q2, (err, data2) => {
        if (err) {
          console.log(err);
        }
        console.log("Inserted leave credits for new employee.");
      });

      const aq =
        "INSERT INTO heartbits (`emp_id`, `heartbits_balance`, `total_heartbits`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1), 100, 0)";

      db.query(aq, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("done");
        }
      });

      const designationValues = [
        employeeInfo.company_id,
        employeeInfo.client_id,
        employeeInfo.position_id,
      ];

      const q3 =
        "INSERT INTO `emp_designation` (`emp_id`, `company_id`,`client_id`,`position_id`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1), ?)";

      db.query(q3, [designationValues], (err, data3) => {
        if (err) {
          console.log(err);
        }
      });

      // res.send("success");

      try {
        let transporter = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "marvin@fullsuite.ph",
            pass: "uggm nyyd ymnb szrx",
          },
        });
        transporter.sendMail({
          from: "marvin@fullsuite.ph", // sender address
          to: employeeInfo.work_email, // list of receivers
          subject: "Action required: Temporary password | FS-HRIS", // Subject line
          text: tempPassword, // plain text body
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en">

                    <head></head>

                      <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word">

                  <div id="email" style="margin: auto;width: 600px;background-color: white;">


                           <table role="presentation" width="100%">
                              <tr>

                                <td bgcolor="#0097B2" align="center" style="color: white;vertical-align: top;">

                               <img alt="logo" src="https://fullsuite.ph/wp-content/uploads/2023/09/2-2.png" width="100%" align="middle">
        

                              </td>


                              </tr></table>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="10px" style="padding: 30px 30px 30px 60px;">
                       <tr>
                         <td style="vertical-align: top;">
                          <h2 style="font-size: 28px;font-weight: 900;">Temporary Password</h2>

                              <p style="font-weight: 100;">
                                This is your temporary password:
                              </p>

                              <p style="color: #0097B2; font-weight: bold;">
                                ${tempPassword}
                              </p>


                              <br><br><br>
                              <h3>Cheers!</h3>
                              <h2 style="font-size: 28px;font-weight: 900;">the <span style="color: #0097B2">f</span>ull<span style="color: #0097B2">s</span>uite HRIS team.</h2>
                            </td>
                            </tr>
                                   </table>


                          <!--Footer Row-->
                    <table role="presentation" bgcolor="#EAF0F6" width="100%" style="margin-top: 50px;">
                        <tr>
                            <td align="center" style="padding: 30px 30px;vertical-align: top;">

                                <p style="font-size: 11px;font-weight: 100;">
                                  5th Floor, 19 Ben Palispis Highway, Legarda-Burnham-Kisad, Baguio City, North Luzon, Benguet, 2600
                                </p>


                            </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%">
                          <tr>


                           <img alt="logo" src="https://fullsuite.ph/wp-content/uploads/2023/09/3-1-1.png" height="200px" width="100%" align="middle">

                      </tr></table>

                        </div>
                      </body>
                        </html>`,
        });
      } catch (e) {
        console.log("----------------" + e + "----------------");
      }
      next();
    }
  });
}

function EditEmployee(req, res, next) {
  // app.post("/editEmployee/:emp_id", upload.single("emp_pic"), (req, res) => {
  const fetchid = req.params.emp_id;
  const { employeeInfo } = req.body;
  const date_separated =
    moment(employeeInfo.date_separated).format("YYYY-MM-DD") === "" ||
    moment(employeeInfo.date_separated).format("YYYY-MM-DD") === "Invalid date"
      ? moment(null)._d
      : moment(employeeInfo.date_separated).format("YYYY-MM-DD");

  const values1 = [
    employeeInfo.emp_num,
    employeeInfo.work_email,
    employeeInfo.f_name,
    employeeInfo.m_name,
    employeeInfo.s_name,
    employeeInfo.emp_role,
    employeeInfo.personal_email,
    employeeInfo.contact_num,
    moment(employeeInfo.dob).format("YYYY-MM-DD"),
    employeeInfo.p_address,
    employeeInfo.c_address,
    moment(employeeInfo.date_hired).format("YYYY-MM-DD"),
    moment(employeeInfo.date_regularization).format("YYYY-MM-DD"),
    date_separated,
    employeeInfo.emp_status,
    employeeInfo.sex,
    employeeInfo.gender,
    employeeInfo.civil_status,
    // filename,
    fetchid,
  ];

  const values2 = [
    employeeInfo.company_id,
    employeeInfo.client_id,
    employeeInfo.position_id,
    fetchid,
  ];
  const q =
    "UPDATE emp SET emp_num = ?, work_email = ?, f_name = ?, m_name = ? , s_name = ?, emp_role = ?, personal_email = ?, contact_num = ?, dob = ?, p_address = ?, c_address = ?, date_hired = ?, date_regularization = ?, date_separated = ?, emp_status = ?, sex = ?, gender = ?, civil_status =? WHERE emp_id = ?";

  db.query(q, values1, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const q3 =
        "UPDATE emp_designation SET company_id = ?, client_id = ?, position_id = ? WHERE emp_id = ?";

      db.query(q3, values2, (err, data3) => {
        if (err) {
          res.send("error");
        } else {
          // res.send("success");
          req.body.employeeInfo.emp_id = fetchid;
          next();
        }
      });
    }
  });
}

function EditEmployeePTO(req, res) {
  const uid = req.params.emp_id;

  const oq =
    "SELECT leave_balance FROM leave_credits WHERE emp_id = " +
    req.params.emp_id;
  let ob;

  db.query(oq, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      ob = data[0].leave_balance;

      const q2 =
        "INSERT INTO pto_logs (`log_type`, `log_desc`, `hr_id`, `emp_id`) VALUES (?)";
      //const reason = "EMP#" + req.session.user[0].emp_id + " set PTO balance of EMP#" + req.params.emp_id + " from " + ob + " to " + req.body.new_pto_balance

      let category;
      let reason;

      if (ob < req.body.new_pto_balance) {
        let diff = req.body.new_pto_balance - ob;
        category = "GRANT";
        reason =
          "EMP#" +
          req.session.user[0].emp_id +
          " gave " +
          diff +
          " pto points to EMP#" +
          req.params.emp_id +
          ". (" +
          ob +
          " + " +
          diff +
          ") = " +
          req.body.new_pto_balance;
      } else {
        let diff = ob - req.body.new_pto_balance;
        category = "DIFF";
        reason =
          "EMP#" +
          req.session.user[0].emp_id +
          " took away " +
          diff +
          " pto points from EMP#" +
          req.params.emp_id +
          ". (" +
          ob +
          " - " +
          diff +
          ") = " +
          req.body.new_pto_balance;
      }

      const VALUES = [
        category,
        reason,
        req.session.user[0].emp_id,
        req.params.emp_id,
      ];

      db.query(q2, [VALUES], (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(reason);
        }
      });
    }
  });

  const q =
    "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = " +
    req.body.new_pto_balance +
    " WHERE l.emp_id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("success");
    }
  });
}

// Payrun Functions Start
function GetEmployeeInfoForUploadPayrun(req, res) {
  const email = req.params.email;
  const q =
    "SELECT e.`emp_num` AS 'Employee ID', e.`s_name` AS 'Last Name', e.`f_name` AS 'First Name', e.`m_name` AS 'Middle Name' , p.`position_name` AS 'Job Title',  e.`date_hired` AS 'Hire Date' FROM `emp` e INNER JOIN `emp_designation` ed ON e.emp_id = ed.emp_id INNER JOIN `position` p ON p.position_id = ed.position_id WHERE e.work_email = ?";

  db.query(q, [email], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetActiveEmployees(req, res) {
  const compID = req.session.user[0].company_id;
  const q =
    "SELECT e.`emp_num` AS 'Employee ID', e.`s_name` AS 'Last Name', e.`f_name` AS 'First Name', e.`m_name` AS 'Middle Name', e.`work_email` AS 'Email', p.`position_name` AS 'Job Title', e.`date_hired` AS 'Hire Date', s.base_pay AS 'Basic Pay' FROM `emp` e INNER JOIN `emp_designation` ed ON ed.emp_id = e.emp_id  INNER JOIN `position` p ON p.position_id = ed.position_id LEFT JOIN `emp_salary` s ON s.emp_id = e.emp_id WHERE date_offboarding IS NULL AND date_separated IS NULL AND ed.company_id = ? ORDER BY e.`emp_num`;";

  db.query(q, [compID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}
// Payrun Functions End

function GetEmploymentRecords(req, res) {
  const fetchid = req.params.emp_id;
  const q =
    "SELECT * FROM emp_contributions ec INNER JOIN emp e ON e.emp_id = ec.emp_id WHERE e.emp_id = ? ORDER BY created_at DESC LIMIT 4";

  db.query(q, [fetchid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  GetDataOfLoggedInUser,
  GetSuperiorDataOfLoggedInUser,
  GetDataForCertainEmployee,
  GetSuperiorDataOfCertainUser,
  OffboardEmployee,
  AddEmployee,
  EditEmployee,
  EditEmployeePTO,
  GetEmployeeInfoForUploadPayrun,
  GetActiveEmployees,
  GetEmploymentRecords,
};
