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
    "SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN leave_credits lc ON e.emp_id = lc.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.emp_id = ? ";

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

  console.log("DATA: " + req.body.date_separated);

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
          console.log("DATA lvl 2 : " + data[0].superior_id);

          const q2 =
            "UPDATE emp SET superior_id = " +
            data[0].superior_id +
            " WHERE superior_id = " +
            fetchid;

          db.query(q2, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log("DATA lvl 3 : " + data);

              res.send("success");
            }
          });
        }
      });
    }
  });
}

function AddEmployee(req, res) {
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

  const q =
    "INSERT INTO `emp` ( `emp_num`, `work_email`, `password`, `f_name`, `m_name`, `s_name`, `emp_role`,`personal_email`, `contact_num`, `dob`, `p_address`, `c_address`, `date_hired`, `date_regularization`,`emp_status`,`sex`,`gender`,`civil_status`, `emp_key`, `emp_pic`) VALUES (?)";
  const values = [
    req.body.emp_num,
    req.body.work_email,
    hashed,
    req.body.f_name,
    req.body.m_name,
    req.body.s_name,
    req.body.emp_role,
    req.body.personal_email,
    req.body.contact_num,
    req.body.dob,
    req.body.p_address,
    req.body.c_address,
    req.body.date_hired,
    req.body.date_regularization,
    req.body.emp_status,
    req.body.sex,
    req.body.gender,
    req.body.civil_status,
    empKey,
    filename,
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send("error");
    } else {
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
        req.body.company_id,
        req.body.client_id,
        req.body.position_id,
      ];

      const q3 =
        "INSERT INTO `emp_designation` (`emp_id`, `company_id`,`client_id`,`position_id`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1), ?)";

      db.query(q3, [designationValues], (err, data3) => {
        if (err) {
          console.log(err);
        }
      });

      res.send("success");

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
          to: req.body.work_email, // list of receivers
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
                  
                                <p style="font-size: 11px;font-weight: 100;">166-C Military Cutoff Road, Baguio City, Benguet
                                  Purok 2, Poblacion, Lianga, Surigao del Sur</p>
                                
                     
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
    }
  });
}

function EditEmployee(req, res) {
  // app.post("/editEmployee/:emp_id", upload.single("emp_pic"), (req, res) => {
  const fetchid = req.params.emp_id;
  const date_separated =
    moment(req.body.date_separated).format("YYYY-MM-DD") === "" ||
    moment(req.body.date_separated).format("YYYY-MM-DD") === "Invalid date"
      ? moment(null)._d
      : moment(req.body.date_separated).format("YYYY-MM-DD");

  const values1 = [
    req.body.emp_num,
    req.body.work_email,
    req.body.f_name,
    req.body.m_name,
    req.body.s_name,
    req.body.emp_role,
    req.body.personal_email,
    req.body.contact_num,
    moment(req.body.dob).format("YYYY-MM-DD"),
    req.body.p_address,
    req.body.c_address,
    moment(req.body.date_hired).format("YYYY-MM-DD"),
    moment(req.body.date_regularization).format("YYYY-MM-DD"),
    date_separated,
    req.body.emp_status,
    req.body.sex,
    req.body.gender,
    req.body.civil_status,
    // filename,
    fetchid,
  ];

  const values2 = [
    req.body.company_id,
    req.body.client_id,
    req.body.position_id,
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
          res.send("success");
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
          req.session.user[0].f_name +
          " gave " +
          diff +
          " PTO days to you" +
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
          req.session.user[0].f_name +
          " took away " +
          diff +
          " PTO days from you" +
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

function GetEmployeeInfoForUploadPayrun(req, res) {
  const email = req.params.email;
  const q =
    "SELECT e.`emp_num` AS 'Employee ID', e.`s_name` AS 'Last Name', e.`f_name` AS 'First Name', e.`m_name` AS 'Middle Name' , p.`position_name` AS 'Job Title',  e.`date_hired` AS 'Hire Date' FROM `emp` e INNER JOIN `emp_designation` ed ON e.emp_id = ed.emp_id INNER JOIN `position` p ON p.position_id = ed.position_id WHERE e.work_email = ?";

  db.query(q, [email], (err, data) => {
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
  GetEmployeeInfoForUploadPayrun,
  AddEmployee,
  EditEmployee,
  EditEmployeePTO,
};
