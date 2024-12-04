var db = require("../config.js");
var moment = require("moment");
var nodemailer = require("nodemailer");

function GenerateMemos(req, res) {

  const cid = req.session.user[0].company_id;

  const q = ` 
    SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN emp_shift AS es ON e.emp_num = es.emp_num WHERE a.status = 'Late Start' AND ed.company_id = ? AND e.date_separated IS NULL 

    UNION 

    SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id WHERE LEFT(a.hours_worked, 2) AND ed.company_id = ? AND e.date_separated IS NULL

    UNION 

    SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id LEFT JOIN leaves l ON a.date = l.leave_from WHERE l.leave_from IS NULL AND a.hours_worked IS NULL AND ed.company_id = ? AND e.date_separated IS NULL

    UNION 

    SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id INNER JOIN leaves l ON l.requester_id = e.emp_id WHERE e.emp_status = "Probationary" AND l.use_pto_points = 0 AND ed.company_id = ? AND e.date_separated IS NULL `;

  db.query(q, [cid, cid, cid, cid], (err, data) => {
    if (err) {
      // res.send("error");
      console.log(err);
    } else {
      data.map((d) => {
        const q1 =
          "SELECT violation_severity, memo_status FROM generated_memos WHERE emp_num = ? ORDER BY generated_memos_id DESC LIMIT 1";

        db.query(q1, d.emp_num, (err, data1) => {
          if (err) {
            res.send("error");
            console.log(err);
          } else {
            console.log("First Level Data 1:", data1);

            const q2 =
              "INSERT INTO generated_memos (`emp_num`, `violation_severity`, `memo_status`, `company_id`) VALUES (?)";

            const values = [d.emp_num, checkViolationSeverity(data1[0]?.violation_severity, data1[0]?.memo_status), "Pending", cid];

            db.query(q2, [values], (err, data2) => {
              if (err) {
                res.send("error");
                console.log(err);
              } else {
                console.log("Second Level Data:", data2);
              }
            });

          }
        });
      });

      res.send("success");
    }
  });
}

function checkViolationSeverity(violation, status){
  if (status === "Refreshed") {
    return "First Warning"
  } else if (violation === "First Warning" && status !== "Ignored"){
    return "Final Warning"
  } else if (violation === "Final Warning" && status !== "Ignored"){
    return "3 Days Suspension"
  } else if (violation === "3 Days Suspension" && status !== "Ignored"){
    return "6 Days Suspension"
  } else if (violation === "6 Days Suspension" && status !== "Ignored"){
    return "12 Days Suspension"
  } else if (violation === "12 Days Suspension" && status !== "Ignored"){
    return "30 Days Suspension"
  } else if (violation === "30 Days Suspension" && status !== "Ignored"){
    return "Dismissal"
  } else {
    return "First Warning"
  }
}

function GetAllNamesOfViolators(req, res) {
  const cid = req.session.user[0].company_id;

  const q =
    "SELECT gm.*, e.f_name, e.s_name, ex.f_name AS executor_f_name, ex.s_name AS executor_s_name FROM generated_memos gm INNER JOIN emp e ON gm.emp_num = e.emp_num LEFT JOIN emp ex ON gm.executor_id = ex.emp_num WHERE gm.company_id = ? ORDER BY e.s_name";

  db.query(q, [cid], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send(data);
      // console.log(data);
    }
  });
}

function IgnoreMemo(req, res) {
  const gm_id = req.body.memo_id
  const emp_num = req.session.user[0].emp_num

  console.log("GEN: ", req.body.memo_id)

  const q =
    "UPDATE generated_memos SET `memo_status` = 'Ignored', `date_processed` = CURRENT_TIMESTAMP, `executor_id` = ? WHERE generated_memos_id = ?";

  db.query(q, [emp_num, gm_id], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send("success");
      console.log(data);
    }
  });
}

function SentEmailStatus(req, res) {
  const gm_id = req.body.memo_id
  const emp_num = req.session.user[0].emp_num

  console.log("GEN: ", req.body.memo_id)

  const q =
    "UPDATE generated_memos SET `memo_status` = 'Notice Sent', `date_processed` = CURRENT_TIMESTAMP, `executor_id` = ? WHERE generated_memos_id = ?";

  db.query(q, [emp_num, gm_id], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send("success");
      console.log(data);
    }
  });
}


// function GetAllNamesOfViolators(req, res) {
//   const cid = req.session.user[0].company_id;

//   const lms = moment()
//     .subtract(1, "months")
//     .startOf("month")
//     .format("YYYY-MM-DD hh:mm");
//   const lme = moment()
//     .subtract(1, "months")
//     .endOf("month")
//     .format("YYYY-MM-DD hh:mm");

//   //const q = "SELECT DISTINCT f_name, s_name, emp_num FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id WHERE LEFT(a.hours_worked, 2) < 09 AND ed.company_id = ? GROUP BY f_name, s_name, emp_num"

//   const q = `
//     SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN emp_shift AS es ON e.emp_num = es.emp_num WHERE a.status = 'Late Start' AND ed.company_id = ?

//     UNION

//     SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id WHERE LEFT(a.hours_worked, 2)

//     UNION

//     SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id LEFT JOIN leaves l ON a.date = l.leave_from WHERE l.leave_from IS NULL AND a.hours_worked IS NULL

//     UNION

//     SELECT e.emp_num, e.f_name, e.s_name FROM emp e INNER JOIN leaves l ON l.requester_id = e.emp_id WHERE e.emp_status = "Probationary" AND l.use_pto_points = 0;`;

//   db.query(q, [cid], (err, data) => {
//     if (err) {
//       res.send("error");
//       console.log(err);
//     } else {
//       res.send(data);
//       console.log(data);
//     }
//   });
// }

function GetLatesOfViolator(req, res) {
  const lms = moment()
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD hh:mm");
  const lme = moment()
    .subtract(1, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const { emp_no = "" } = req.query;

  console.log("EMP NO: ", emp_no);

  const q =
    "SELECT a.date, a.time_in, CAST(CAST(a.time_in AS time) - CAST(es.start AS time) AS time) AS late_mins FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN emp_shift AS es ON e.emp_num = es.emp_num WHERE a.status = 'Late Start' AND a.date > ? AND a.date < ? AND e.emp_num = ?";

  db.query(q, [lms, lme, emp_no], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      let total = 0;

      data.map((d) => {
        total += moment.duration(d.late_mins).asMinutes();
        console.log("total: ", total);
      });

      if (total >= 15) {
        res.send(data);
        console.log(data);
      } else {
        console.log("Exemption! " + emp_no);
        res.send([]);
      }
    }
  });
}

function GetUndertimesOfViolator(req, res) {
  const lms = moment()
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD hh:mm");
  const lme = moment()
    .subtract(1, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const { emp_no = "" } = req.query;

  console.log("EMP NO: ", emp_no);

  const q =
    "SELECT a.* FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id WHERE LEFT(a.hours_worked, 2) < 09 AND a.date > ? AND a.date < ? AND e.emp_num = ?";

  db.query(q, [lms, lme, emp_no], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send(data);
      console.log(data);
    }
  });
}

function GetAWOLsOfViolator(req, res) {
  const lms = moment()
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD hh:mm");
  const lme = moment()
    .subtract(1, "months")
    .endOf("month")
    .format("YYYY-MM-DD hh:mm");

  const { emp_no = "" } = req.query;

  console.log("EMP NO: ", emp_no);

  // const q = `SELECT a.*, l.* FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id LEFT JOIN leaves l ON a.date = l.leave_from
  // WHERE l.leave_from IS NULL AND a.hours_worked IS NULL AND a.date > ? AND a.date < ? AND e.emp_num = ?`

  const q = `SELECT a.date FROM emp e INNER JOIN attendance a ON e.emp_num = a.employee_id INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id LEFT JOIN leaves l ON a.date = l.leave_from 
    WHERE l.leave_from IS NULL AND a.hours_worked IS NULL AND a.date > ? AND a.date < ? AND e.emp_num = ?`;

  db.query(q, [lms, lme, emp_no], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send(data);
      console.log(data);
    }
  });
}

function GetUnpaidLeavesOfProbationary(req, res) {
  const { emp_no = "" } = req.query;

  console.log("EMP NO: ", emp_no);

  const q = `SELECT e.emp_num, l.* FROM emp e INNER JOIN leaves l ON l.requester_id = e.emp_id
    WHERE e.emp_num = ? AND e.emp_status = "Probationary" AND l.use_pto_points = 0`;

  db.query(q, [emp_no], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send(data);
      console.log(data);
    }
  });
}

function GetAllMemosOfViolator(req, res) {
  const cid = req.session.user[0].company_id;
  const { emp_no = "" } = req.query;

  const q =
    "SELECT gm.*, e.f_name, e.s_name, ex.f_name AS executor_f_name, ex.s_name AS executor_s_name FROM generated_memos gm INNER JOIN emp e ON gm.emp_num = e.emp_num LEFT JOIN emp ex ON gm.executor_id = ex.emp_num WHERE gm.company_id = ? AND gm.emp_num = ?";

  db.query(q, [cid, emp_no], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send(data);
      console.log("MEMO: ", data)
      // console.log(data);
    }
  });
}

async function SendEmailToViolator(req, res) {
  const work_email = req.session.user[0].work_email;
  const emp_num = req.body.emp_num;

  console.log("EN: ", req.body.emp_num);

  //var fileName = req.body.email_attachment?.substring(req.body.email_attachment?.lastIndexOf('/') + 1);

  q3 = "SELECT f_name, s_name, work_email FROM emp WHERE emp_num = ?";

  db.query(q3, [emp_num], (err, data) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      emp_email = data[0].work_email;

      try {
        let transporter = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_ADDRESS_ATS,
            pass: process.env.EMAIL_PASSWORD_ATS,
          },
        });

        req.body.email_attachment
          ? transporter.sendMail({
              from: work_email, // sender address
              to: emp_email, // list of receivers
              subject: req.body.email_title, // Subject line
              text: req.body.email_body, // plain text body
              //html: `<p>` + req.body.email_body + `</p>`,
              attachments: [
                {
                  filename: req.body.email_attachment_name,
                  //path: req.body.email_attachment,
                  content: req.body.email_attachment.split("base64,")[1],
                  encoding: "base64",
                  //contentType: "application/pdf",
                },
              ],
            })
          : transporter.sendMail({
              from: work_email, // sender address
              to: emp_email, // list of receivers
              subject: req.body.email_title, // Subject line
              text: req.body.email_body, // plain text body
              //html: `<p>` + req.body.email_body + `</p>`,
            });

        console.log("Email sent.");
      } catch (e) {
        console.log(e);
      }
      res.send("success");
    }
  });
}

module.exports = {
  GenerateMemos,

  IgnoreMemo,
  SentEmailStatus,

  GetAllNamesOfViolators,
  GetUndertimesOfViolator,
  GetAWOLsOfViolator,
  GetUnpaidLeavesOfProbationary,
  GetLatesOfViolator,

  SendEmailToViolator,
  GetAllMemosOfViolator
};
