var db = require("../config.js");
var nodemailer = require("nodemailer");
const moment = require("moment");
const fs = require("fs");

var Slack = require("@slack/bolt");
var dotenv = require("dotenv");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ats_app = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET_ATS,
  token: process.env.SLACK_BOT_TOKEN_ATS,
});

async function SendEmailToApplicant(req, res) {
  const work_email = req.session.user[0].work_email;
  const app_id = req.params.app_id;

  //var fileName = req.body.email_attachment?.substring(req.body.email_attachment?.lastIndexOf('/') + 1);

  q3 =
    "SELECT f_name, s_name, position_applied, email FROM applicant_tracking WHERE app_id = ?";

  db.query(q3, [app_id], (err, data) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      emp_email = data[0].email;

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

function InsertApplicantsData(req, res) {
  const cid = req.session.user[0].company_id;

  const data = req.body;
  console.log(JSON.stringify(data));

  //const q = "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `position_applied`, `status`) VALUES (?)"
  const q =
    "INSERT INTO applicant_tracking (`app_start_date`, `position_applied`, `s_name`, `f_name`, `m_name`, `status`, `reason_for_rejection`, `reason_for_blacklist`, `email`, `contact_no`, `test_result`, `cv_link`, `source`, `referrer_name`, `company_id`) VALUES (?)";

  data.map((d) => {
    db.query(q, [d, cid], (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Added.");
        // res.send(data)
      }
    });
  });

  console.log("Successfully added everything in database!");
}

function GetApplicantsFromDatabase(req, res) {
  const q = "SELECT * FROM applicant_tracking ORDER BY app_start_date ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {         
      res.json(data);
    }
  });
}

function GetPaginatedApplicantsFromDatabase(req, res) {
  const unum = req.session.user[0].emp_num;
  const cid = req.session.user[0].company_id;
  const { limit = 10, page = 1, active = 0, filter = "" } = req.query;

  console.log("Active: ", active);
  console.log("Filter: ", filter);

  let query1;
  let query2;
  let values2 = [];

  const filters = filter.split(',').map(f => f.trim());

  if (filter == "" && active == 0) {
    query1 = `SELECT COUNT(*) AS count FROM applicant_tracking WHERE company_id = ${cid}`;
  } else if (filter !== "" && active == 0) {
    const placeholders = filters.map(() => "status = ?").join(" OR ");
    query1 = `SELECT COUNT(*) AS count FROM applicant_tracking WHERE company_id = ${cid} AND ${placeholders}`;
  } else if (filter == "" && active == 1) {
    query1 = `SELECT COUNT(*) AS count FROM applicant_tracking WHERE
      status != 'Withdrawn Application' 
      AND status != 'Job Offer Rejected' 
      AND status != 'Not Fit' 
      AND status != 'Abandoned' 
      AND status != 'No Show' 
      AND status != 'Blacklisted' 
      AND status != 'Started Work' 
      AND company_id = ${cid}`;
  } else if (filter !== "" && active == 1) {
    const placeholders = filters.map(() => "status = ?").join(" OR ");
    query1 = `SELECT COUNT(*) AS count FROM applicant_tracking WHERE company_id = ${cid} 
      AND (${placeholders}) 
      AND status != 'Withdrawn Application' 
      AND status != 'Job Offer Rejected' 
      AND status != 'Not Fit' 
      AND status != 'Abandoned' 
      AND status != 'No Show' 
      AND status != 'Blacklisted' 
      AND status != 'Started Work'`;
  }

  db.query(query1, filters, (err, data1) => {
    if (err) {
      return res.json(err);
    } else {
      let parsedLimit = parseInt(limit);
      let parsedPage = parseInt(page);

      let offset = (parsedPage - 1) * parsedLimit;

      const totalCount = data1[0].count;
      const totalPages = Math.ceil(totalCount / parsedLimit);

      let pagination = {
        page: parsedPage,
        total_pages: totalPages,
        total: parseInt(totalCount),
        limit: parsedLimit,
        offset,
      };

      if (filter == "" && active == 0) {
        query2 = `SELECT * FROM applicant_tracking WHERE status != 'Withdrawn Application' 
        AND status != 'Job Offer Rejected' 
        AND status != 'Not Fit' 
        AND status != 'Abandoned' 
        AND status != 'No Show' 
        AND status != 'Blacklisted' 
        AND status != 'Started Work' 
        WHERE company_id = ${cid} 
        ORDER BY app_start_date DESC LIMIT ? OFFSET ?`;
        values2 = [parsedLimit, offset];
      } else if (filter !== "" && active == 0) {
        const placeholders = filters.map(() => "status = ?").join(" OR ");
        query2 = `SELECT * FROM applicant_tracking WHERE ${placeholders} AND company_id = ${cid} ORDER BY app_start_date DESC LIMIT ? OFFSET ?`;
        values2 = [...filters, parsedLimit, offset];
      } else if (filter == "" && active == 1) {
        query2 = `SELECT * FROM applicant_tracking WHERE company_id = ${cid} ORDER BY app_start_date DESC LIMIT ? OFFSET ?`;
        values2 = [parsedLimit, offset];
      } else if (filter !== "" && active == 1) {
        const placeholders = filters.map(() => "status = ?").join(" OR ");
        query2 = `SELECT * FROM applicant_tracking WHERE (${placeholders}) 
        AND status != 'Withdrawn Application' 
        AND status != 'Job Offer Rejected' 
        AND status != 'Not Fit' 
        AND status != 'Abandoned' 
        AND status != 'No Show' 
        AND status != 'Blacklisted' 
        AND status != 'Started Work' 
        AND company_id = ${cid} 
        ORDER BY app_start_date DESC LIMIT ? OFFSET ?`;
        values2 = [...filters, parsedLimit, offset];
      }

      db.query(query2, values2, (err, data2) => {
        if (err) {
          return res.json(err);
        } else {
          console.log(data2);
          return res.json({ data2, pagination });
        }
      });
    }
  });
}


function AddNewApplicant(req, res) {
  const q =
    "INSERT INTO applicant_tracking (`s_name`, `f_name`, `m_name`, `date_hired`, `cv`, `test_result`, `status`) VALUES (?)";

  const values = req.body;

  db.query(q, [values], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function ModifiedAddNewApplicant(req, res) {
  const cid = req.session.user[0].company_id;
  const q =
    "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `position_applied`, `status`, `company_id`) VALUES (?)";

  const values = [
    moment(req.body.app_start_date).format("YYYY-MM-DD"),
    req.body.s_name,
    req.body.f_name,
    req.body.m_name,
    req.body.email,
    req.body.contact_no,
    req.body.cv_link,
    req.body.source,
    req.body.position_applied,
    req.body.status,
    cid,
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.send(data);
      //console.log(data)
    }
  });
}

function GetPositionsFromCompany(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT DISTINCT position_name FROM emp_designation em INNER JOIN position p ON p.position_id = em.position_id WHERE em.company_id = ? ORDER BY position_name ASC`;

  db.query(q, cid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
      // console.log("Retrieved all positions from company " + cid)
    }
  });
}

//Get Referrers

function GetPossibleReferrers(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT * FROM emp e INNER JOIN emp_designation em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL`;

  db.query(q, cid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

//Edit Employee

function EditApplicantData(req, res) {
  console.log("Data: ", req.body);

  const values = [
    moment(req.body.app_start_date).format("YYYY-MM-DD"), //
    req.body.position_applied, //
    req.body.status, //
    req.body.s_name, //
    req.body.f_name, //
    req.body.m_name, //
    req.body.email, //
    req.body.source, //
    req.body.contact_no, //
    req.body.cv_link, //
    req.body.referrer,
    req.body.test_result,
    req.body.app_id, //
  ];

  const q =
    "UPDATE applicant_tracking SET `app_start_date` = ?, `position_applied` = ?, `status` = ?, `s_name` = ?, `f_name` = ?, `m_name` = ?, `email` = ?, `source` = ?, `contact_no` = ?, `cv_link` = ?, `referrer_name` = ?, `test_result` = ? WHERE app_id = ?";

  db.query(q, values, (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {
      res.send("success");
      console.log(data);
    }
  });
}

//NOTES

function GetNoteDetails(req, res) {
  const note_id = req.body.note_id;
  const q =
    "SELECT * FROM applicant_notes INNER JOIN emp ON emp_id = noter_id WHERE note_id = ? ORDER BY noted_at;";

  db.query(q, [note_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetListOfPositions(req, res) {
  const q = `SELECT DISTINCT position_applied FROM applicant_tracking`;

  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetApplicantStatusStatistics(req, res) {
  const { position = "" } = req.query;

  let jobApplied = position;
  console.log("JA: ", jobApplied);

  let query;

  jobApplied !== ""
    ? (query = `SELECT 
      COUNT(case when status = 'Sent Test' then 1 else null end) as sent_test,
      COUNT(case when status = 'First Interview Stage' then 1 else null end) as first_interview_stage,
      COUNT(case when status = 'Second Interview Stage' then 1 else null end) as second_interview_stage,
      COUNT(case when status = 'Third Interview Stage' then 1 else null end) as third_interview_stage,
      COUNT(case when status = 'Fourth Interview Stage' then 1 else null end) as fourth_interview_stage,
      COUNT(case when status = 'Final Interview Stage' then 1 else null end) as final_interview_stage,
      COUNT(case when status = 'For Job Offer' then 1 else null end) as for_job_offer,
      COUNT(case when status = 'Job Offer Sent' then 1 else null end) as job_offer_sent,
      COUNT(case when status = 'Job Offer Accepted' then 1 else null end) as job_offer_accepted,
      COUNT(case when status = 'Started Work' then 1 else null end) as started_work,
      COUNT(case when status = 'Job Offer Rejected' then 1 else null end) as job_offer_rejected,
      COUNT(case when status = 'Withdrawn Application' then 1 else null end) as withdrawn_application,
      COUNT(case when status = 'Not Fit' then 1 else null end) as not_fit,
      COUNT(case when status = 'Abandoned' then 1 else null end) as abandoned,
      COUNT(case when status = 'No Show' then 1 else null end) as no_show,
      COUNT(case when status = 'Blacklisted' then 1 else null end) as blacklisted,
      COUNT(case when status = 'Sent Interview Invitation' then 1 else null end) as sent_interview,
      COUNT(case when status = 'AWOL' then 1 else null end) as awol,
      COUNT(case when status = 'For Hiring Decision' then 1 else null end) as for_hiring_decision
      FROM applicant_tracking WHERE position_applied = ?`)
    : (query = `SELECT 
      COUNT(case when status = 'Sent Test' then 1 else null end) as sent_test,
      COUNT(case when status = 'First Interview Stage' then 1 else null end) as first_interview_stage,
      COUNT(case when status = 'Second Interview Stage' then 1 else null end) as second_interview_stage,
      COUNT(case when status = 'Third Interview Stage' then 1 else null end) as third_interview_stage,
      COUNT(case when status = 'Fourth Interview Stage' then 1 else null end) as fourth_interview_stage,
      COUNT(case when status = 'Final Interview Stage' then 1 else null end) as final_interview_stage,
      COUNT(case when status = 'For Job Offer' then 1 else null end) as for_job_offer,
      COUNT(case when status = 'Job Offer Sent' then 1 else null end) as job_offer_sent,
      COUNT(case when status = 'Job Offer Accepted' then 1 else null end) as job_offer_accepted,
      COUNT(case when status = 'Started Work' then 1 else null end) as started_work,
      COUNT(case when status = 'Job Offer Rejected' then 1 else null end) as job_offer_rejected,
      COUNT(case when status = 'Withdrawn Application' then 1 else null end) as withdrawn_application,
      COUNT(case when status = 'Not Fit' then 1 else null end) as not_fit,
      COUNT(case when status = 'Abandoned' then 1 else null end) as abandoned,
      COUNT(case when status = 'No Show' then 1 else null end) as no_show,
      COUNT(case when status = 'Blacklisted' then 1 else null end) as blacklisted,
      COUNT(case when status = 'Sent Interview Invitation' then 1 else null end) as sent_interview,
      COUNT(case when status = 'AWOL' then 1 else null end) as awol,
      COUNT(case when status = 'For Hiring Decision' then 1 else null end) as for_hiring_decision
      FROM applicant_tracking`);

  db.query(query, jobApplied, (err, data) => {
    if (err) return res.json(err);
    else {
      console.log("JOB:", data);
      res.json(data);
    }
  });
}

//View Applicant
function ViewApplicantData(req, res) {
  const app_id = req.params.app_id;

  //console.log("APP ID: ", app_id)

  const q = "SELECT * FROM applicant_tracking WHERE app_id = ?";

  db.query(q, [app_id], (err, data) => {
    if (err) return res.json(err);
    else {
      res.send(data);
      console.log(data);
    }
  });
}

//Get Possible 5 Interviews
function GetInterviews(req, res) {
  const app_id = req.params.app_id;
  const q = `SELECT ai.*, e.f_name, e.s_name FROM applicant_interview ai LEFT JOIN emp e ON ai.interviewer_id = e.emp_id WHERE ai.applicant_id = ?`;

  db.query(q, [app_id], (err, data) => {
    if (err) return res.json(err);
    else {
      res.send(data);
      console.log(data);
    }
  });
}

//Get Possible Interviewers (Any employee that can access applicant tracking system)

function GetIntervieweesForApplicants(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT * FROM emp e INNER JOIN hr_access ha ON e.emp_id = ha.hr_id INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id WHERE ha.access_applicant_tracking = 1 AND ed.company_id = ?`;

  db.query(q, [cid], (err, data) => {
    if (err) return res.json(err);
    else {
      res.send(data);
      console.log(data);
    }
  });
}

//Get Task Notes
function GetApplicantNotesFromInterview(req, res) {
  const app_id = req.params.app_id;
  const { interviewNo = 1 } = req.query;
  let parsedNumber = parseInt(interviewNo);
  // console.log("APP: ", app_id)
  // console.log("No: ", parsedNumber)

  const q = `SELECT an.*, ai.*, e.emp_pic, e.f_name, e.s_name FROM applicant_notes an INNER JOIN applicant_interview ai ON an.interview_id = ai.applicant_interview_id LEFT JOIN emp e ON an.noter_id = e.emp_id WHERE ai.applicant_id = ? AND ai.applicant_interview_id = ?`;

  db.query(q, [app_id, parsedNumber], (err, data) => {
    if (err) return res.json(err);
    else {
      res.send(data);
      //   console.log(data)
    }
  });
}

function GetMentionInterviewers(req, res) {
  const cid = req.session.user[0].company_id;
  const uid = req.session.user[0].emp_id;
  // const q = "SELECT e.emp_id AS id, CONCAT(e.f_name, ' ', e.s_name) AS display FROM emp AS e INNER JOIN hr_access ha ON e.emp_id = ha.hr_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND e.emp_id != ? AND e.date_separated IS NULL AND ha.access_applicant_tracking = 1 ORDER BY e.f_name"
  const q =
    "SELECT e.emp_id AS id, substring_index(work_email, '@', 1) AS display FROM emp AS e INNER JOIN hr_access ha ON e.emp_id = ha.hr_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND e.emp_id != ? AND e.date_separated IS NULL AND ha.access_applicant_tracking = 1 ORDER BY e.f_name";

  db.query(q, [cid, uid], (err, data) => {
    if (err) {
      res.send("error");
    } else {
      res.json(data);
    }
  });
}

//Notes

async function InsertApplicantNotes(req, res) {
  const uid = req.session.user[0].emp_id;
  const emp_email = req.session.user[0].work_email.substring(
    0,
    req.session.user[0].work_email.indexOf("@")
  );
  const q =
    "INSERT INTO applicant_notes (`interview_id`, `note_type`, `noter_id`, `note_body`) VALUES (?)";

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${emp_email}> shared a note for ${req.body.applicant}`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${req.body.note_body}`,
      },
    },
  ];

  console.log(req.body);

  const values = [req.body.interview_id, 2, uid, req.body.note_body];

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send("error");
      console.log(data);
    } else {
      res.sendStatus(200);
      console.log(data);
    }
  });

  await ats_app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN_ATS,
    channel: process.env.SLACK_CHANNEL_ATS,
    text: "New ATS Message",
    blocks,
  });
}

//
function AddNewInterview(req, res) {
  const app_id = req.params.app_id;
  const q =
    "INSERT INTO applicant_interview (`applicant_id`, `interviewer_id`, `interview_status`, `date_of_interview`) VALUES (?)";

  console.log("REQ BODY: ", req.body);

  console.log("APP_ID: ", app_id);
  console.log("INTERVIEWER_ID: ", req.body.interviewer_id);
  console.log("DATE INTERVIEW: ", req.body.date_of_interview);

  const values = [
    app_id,
    req.body.interviewer_id,
    "PENDING",
    req.body.date_of_interview,
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.log("ERR: ", err);
      res.send("error");
    } else {
      console.log("SUCCESS: ", data);
      res.send(data);
    }
  });
}

function SearchApplicantList(req, res) {
  var cid = req.session.user[0].company_id;

  const { searchTerm = "" } = req.query;

  let query;

  // (active == 0) ?
  query = `SELECT * FROM applicant_tracking WHERE CONCAT(f_name, s_name, position_applied, email, source, status) LIKE ?`;
  // :
  // query = `SELECT * FROM applicant_tracking
  // WHERE status != 'Withdrawn Application'
  // AND status != 'Job Offer Rejected' AND status != 'Not Fit' AND status != 'Abandoned' AND status != 'No Show'
  // AND status != 'Blacklisted' AND status != 'Started Work'
  // CONCAT(f_name, s_name, m_name, position_applied, email, source, status, reason_for_rejection, reason_for_blacklist) LIKE ?`

  //const q = `SELECT * FROM applicant_tracking WHERE CONCAT(f_name, s_name, m_name, position_applied, email, source, status, reason_for_rejection, reason_for_blacklist) LIKE ?`;

  const st = "%" + searchTerm + "%";

  db.query(query, [st, cid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.send(data);
    }
  });
}

//Edit Employee

function ChangeStatus(req, res) {
  console.log("Data: ", req.body);

  const q = "UPDATE applicant_tracking SET `status` = ? WHERE app_id = ?";

  db.query(q, [req.body.status, req.body.app_id], (err, data) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      res.send("success");
      console.log(data);
    }
  });
}

//Create Discussion Box
function CreateDiscussionBoxAndLockedNotes(req, res) {
  const discussion_q =
    "INSERT INTO applicant_interview (`applicant_id`) SELECT app_id FROM applicant_tracking WHERE app_id NOT IN (SELECT DISTINCT at.app_id FROM applicant_tracking AS at INNER JOIN applicant_interview AS ai ON at.app_id = ai.applicant_id)";
  db.query(discussion_q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });

  // const locked_q =
  // "INSERT INTO applicant_locked_box (`applicant_id`) SELECT app_id FROM applicant_tracking WHERE app_id NOT IN (SELECT DISTINCT at.app_id FROM applicant_tracking AS at INNER JOIN applicant_locked_box AS ai ON at.app_id = ai.applicant_id)";

  // db.query(locked_q, (err, data) => {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     console.log(data);
  //   }
  // });
}

//Email Templates
function RetrieveOfferTemplates(req, res) {
  const cid = req.session.user[0].company_id;

  const aq = "SELECT * FROM email_templates WHERE company_id = ?";
  db.query(aq, cid, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
}

//Locked Notes
function GetLockedNoteDetails(req, res) {
  const note_id = req.body.note_id;
  const q =
    "SELECT * FROM applicant_locked_notes INNER JOIN emp ON emp_id = noter_id WHERE note_id = ? ORDER BY noted_at;";

  db.query(q, [note_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function InsertApplicantLockedNotes(req, res) {
  const app_id = req.params.app_id;
  const uid = req.session.user[0].emp_id;

  const q =
    "INSERT INTO applicant_locked_notes (`applicant_id`, `noter_id`, `note_body`) VALUES (?)";

  console.log(req.body);

  const values = [app_id, uid, req.body.note_body];

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send("error");
      console.log(data);
    } else {
      res.sendStatus(200);
      console.log(data);
    }
  });
}

function GetApplicantLockedNotes(req, res) {
  const app_id = req.params.app_id;
  const { interviewNo = 1 } = req.query;
  let parsedNumber = parseInt(interviewNo);
  // console.log("APP: ", app_id)
  // console.log("No: ", parsedNumber)

  const q = `SELECT aln.*, e.emp_pic, e.f_name, e.s_name FROM applicant_locked_notes aln LEFT JOIN emp e ON aln.noter_id = e.emp_id WHERE aln.applicant_id = ?`;

  db.query(q, [app_id], (err, data) => {
    if (err) return res.json(err);
    else {
      res.send(data);
      //   console.log(data)
    }
  });
}

// requisition stats

function GetApplicants(req, res) {
  db.query("SELECT * FROM applicant_tracking", (error, result, fields) => {
    res.status(200).json(result);
  });
}

function GetPositions(req, res) {
  db.query(
    "SELECT DISTINCT position_applied FROM applicant_tracking",
    (error, result, fields) => {
      res.status(200).json(result);
    }
  );
}

function GetFilterByMonth(req, res) {
  const position = req.query.position;
  const query = `
      SELECT 
          position_applied,
          COUNT(CASE 
              WHEN status IN ('Not fit', 'Withdrawn Application', 'Blacklisted', 'No Show', 'Abandoned') THEN 1 
              ELSE NULL 
          END) AS 'Closed Applications',
          COUNT(CASE 
              WHEN status IN ('Job Offer Accepted', 'Started Work', 'Job Offer Rejected', 'Job Offer Sent') THEN 1 
              ELSE NULL 
          END) AS 'Passed Applications',
          COUNT(CASE 
              WHEN status NOT IN ('Not fit', 'Withdrawn Application', 'Blacklisted', 'No Show', 'Abandoned', 'Job Offer Accepted', 'Started Work', 'Job Offer Rejected', 'Job Offer Sent') THEN 1 
              ELSE NULL 
          END) AS 'On Progress Applications',
          YEAR(app_start_date) AS Year,
          MONTH(app_start_date) AS Month
      FROM 
          applicant_tracking
      WHERE 
          position_applied = ?
      GROUP BY 
          position_applied, 
          YEAR(app_start_date), 
          MONTH(app_start_date);
  `;

  db.query(query, [position], (error, result, fields) => {
    if (error) {
      res.status(500).json({ error: "Database query error" });
    } else {
      res.status(200).json(result);
    }
  });
}

function GetFilterByQuarter(req, res) {
  const position = req.query.position;
  const query = `
      SELECT 
          position_applied,
          COUNT(CASE 
              WHEN status IN ('Not fit', 'Withdrawn Application', 'Blacklisted', 'No Show', 'Abandoned') THEN 1 
              ELSE NULL 
          END) AS 'Closed Applications',
          COUNT(CASE 
              WHEN status IN ('Job Offer Accepted', 'Started Work', 'Job Offer Rejected', 'Job Offer Sent') THEN 1 
              ELSE NULL 
          END) AS 'Passed Applications',
          COUNT(CASE 
              WHEN status NOT IN ('Not fit', 'Withdrawn Application', 'Blacklisted', 'No Show', 'Abandoned', 'Job Offer Accepted', 'Started Work', 'Job Offer Rejected', 'Job Offer Sent') THEN 1 
              ELSE NULL 
          END) AS 'On Progress Applications',
          YEAR(app_start_date) AS Year,
          QUARTER(app_start_date) AS Quarter
      FROM 
          applicant_tracking
      WHERE 
          position_applied = ?
      GROUP BY 
          position_applied, 
          YEAR(app_start_date), 
          QUARTER(app_start_date);
  `;

  db.query(query, [position], (error, result, fields) => {
    if (error) {
      res.status(500).json({ error: "Database query error" });
    } else {
      res.status(200).json(result);
    }
  });
}

function GetFilterByYear(req, res) {
  const position = req.query.position;
  const query = `
      SELECT 
          position_applied,
          COUNT(CASE 
              WHEN status IN ('Not fit', 'Withdrawn Application', 'Blacklisted', 'No Show', 'Abandoned') THEN 1 
              ELSE NULL 
          END) AS 'Closed Applications',
          COUNT(CASE 
              WHEN status IN ('Job Offer Accepted', 'Started Work', 'Job Offer Rejected', 'Job Offer Sent') THEN 1 
              ELSE NULL 
          END) AS 'Passed Applications',
          COUNT(CASE 
              WHEN status NOT IN ('Not fit', 'Withdrawn Application', 'Blacklisted', 'No Show', 'Abandoned', 'Job Offer Accepted', 'Started Work', 'Job Offer Rejected', 'Job Offer Sent') THEN 1 
              ELSE NULL 
          END) AS 'On Progress Applications',
          YEAR(app_start_date) AS Year
      FROM 
          applicant_tracking
      WHERE 
          position_applied = ?
      GROUP BY 
          position_applied, 
          YEAR(app_start_date);
  `;

  db.query(query, [position], (error, result, fields) => {
    if (error) {
      res.status(500).json({ error: "Database query error" });
    } else {
      res.status(200).json(result);
    }
  });
}

//for clicking the 'Add New' in the ATS, this will check if there's a duplicate applicant
function CheckDuplicate(req, res) {
  const { f_name = "", m_name = "", s_name = "", email = "", contact_no = "" } = req.query;  
  let conditions = [];
  let values = [];

  if (f_name) {
    conditions.push("a.f_name LIKE ? OR a.f_name LIKE ?");
    values.push("%" + f_name + "%");
    values.push(f_name)
  }
  if (m_name) {
    conditions.push("a.m_name LIKE ? OR a.m_name LIKE ?");
    values.push("%" + m_name + "%");
    values.push(m_name)
  }
  if (s_name) {
    conditions.push("a.s_name LIKE ? OR a.s_name LIKE ?");
    values.push("%" + s_name + "%");
    values.push(s_name)
  }
  if (email) {
    conditions.push("a.email LIKE ?");
    values.push("%" + email + "%");
  }
  if (contact_no) {
    conditions.push("a.contact_no LIKE ?");
    values.push("%" + contact_no + "%");
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" OR ")}` : "";

  const query = 
  `SELECT app_id, s_name, f_name, m_name, email, contact_no, app_start_date, position_applied, status
  FROM applicant_tracking a 
  ${whereClause} 
  GROUP BY app_id, s_name, f_name, m_name, email, contact_no;`

  db.query(query, values, (err, data) => {
    if (err) {
      res.send("err");
    } else if (data.length == 0){
      res.send("none");
    } else {
      res.send(data);
    }
  });
}

//For ATS Notifs - Anthony
function ATSNotifs(req, res) {
  const query = `SELECT
    at.app_id,
    CONCAT(at.f_name, " ", at.s_name) as name,
    ai.recent_interview_date AS app_start_date,
    at.status,
    CASE 
        WHEN at.status = "Final Interview Stage" AND TIMESTAMPDIFF(HOUR, ai.recent_interview_date, NOW()) > 48 THEN CONCAT(at.f_name, " ", at.s_name, " has finished all four rounds of interview, please update status.")
        WHEN at.status = "For Hiring Decision" AND TIMESTAMPDIFF(DAY, ai.recent_interview_date, NOW()) > 3 THEN CONCAT(at.f_name, " ", at.s_name, " is waiting for a job offer, please confirm status.")
        WHEN at.status = "Job Offer Sent" AND TIMESTAMPDIFF(DAY, ai.recent_interview_date, NOW()) > 5 THEN CONCAT(at.f_name, " ", at.s_name, "'s job offer has been sent over 5 days ago, please check status.")
        WHEN (at.status = "First Interview Stage" OR at.status = "Second Interview Stage" OR at.status = "Third Interview Stage" OR at.status = "Fourth Interview Stage") AND TIMESTAMPDIFF(DAY, ai.recent_interview_date, NOW()) > 5 THEN CONCAT(at.f_name, " ", at.s_name, "'s last interview was over five days ago, please provide an update.")
        ELSE NULL
    END AS notification
FROM 
    applicant_tracking at
JOIN 
    (SELECT 
         applicant_id, 
         MAX(date_of_interview) AS recent_interview_date
     FROM 
         applicant_interview
     GROUP BY 
         applicant_id) ai 
ON 
    at.app_id = ai.applicant_id
WHERE 
    (at.status = "Final Interview Stage" AND TIMESTAMPDIFF(HOUR, ai.recent_interview_date, NOW()) > 48)
    OR (at.status = "For Hiring Decision" AND TIMESTAMPDIFF(DAY, ai.recent_interview_date, NOW()) > 3)
    OR (at.status = "Job Offer Sent" AND TIMESTAMPDIFF(DAY, ai.recent_interview_date, NOW()) > 5)
    OR ((at.status = "First Interview Stage" OR at.status = "Second Interview Stage" OR at.status = "Third Interview Stage" OR at.status = "Fourth Interview Stage") AND TIMESTAMPDIFF(DAY, ai.recent_interview_date, NOW()) > 5);
    `;

db.query(query, (err, data) => {
   if (err) return res.json(err);
    return res.send(data); 
  });
}

module.exports = {
  InsertApplicantsData,
  GetApplicantsFromDatabase,
  AddNewApplicant,
  ModifiedAddNewApplicant,
  GetPositionsFromCompany,
  GetPossibleReferrers,

  //Edit Applicant
  EditApplicantData,
  GetNoteDetails,
  InsertApplicantNotes,
  GetPaginatedApplicantsFromDatabase,

  //Applicant STatus Statistics
  GetApplicantStatusStatistics,
  ViewApplicantData,
  GetInterviews,
  GetApplicantNotesFromInterview,

  //Get Interviewees
  GetIntervieweesForApplicants,
  AddNewInterview,

  SearchApplicantList,
  ChangeStatus,
  CreateDiscussionBoxAndLockedNotes,

  RetrieveOfferTemplates,
  SendEmailToApplicant,

  //Locked Box
  InsertApplicantLockedNotes,
  GetLockedNoteDetails,
  GetApplicantLockedNotes,
  GetMentionInterviewers,
  GetListOfPositions,

  // Requisition Stats,
  GetApplicants,
  GetPositions,
  GetFilterByMonth,
  GetFilterByQuarter,
  GetFilterByYear,

  //ATS Duplicate Checker
  CheckDuplicate,

  //ATS Notifs
  ATSNotifs,
};
