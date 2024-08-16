var db = require("../config.js");
var moment = require("moment");

var Slack = require("@slack/bolt");
var dotenv = require("dotenv");

const tix_app = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET_TIX,
  token: process.env.SLACK_BOT_TOKEN_TIX,
});

async function createDispute(req, res) {
  const uid = req.session.user[0].emp_id;
  const { dispute_type, dispute_title, dispute_body } = req.body;
  const q =
    "INSERT INTO `dispute`(`dispute_type`, `requester_id`, `dispute_title`, `dispute_body`, `dispute_status`) VALUES (?,?,?,?,?)";
  
  db.query(
    q,
    [dispute_type, uid, dispute_title, dispute_body, 0],
    (err, rows) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );

  const fn = req.session.user[0].f_name;
  const sn = req.session.user[0].s_name;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Payroll Ticket*`,
      },
    },
    {
      "type": "section",
      "text": {
          "type": "mrkdwn",
          "text": `*Appellant's Name:* ${fn} ${sn}`
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Type of Appeal:*\n ${req.body.dispute_title}`,
        },
        {
          type: "mrkdwn",
          text: `*Appeal Reason:*\n ${req.body.dispute_body}`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Check Ticket",
          },
          style: "primary",
          url: `https://app.kriyahr.com/hr/hr-management/tickets`,
        },
      ],
    },
  ];

  await tix_app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN_TIX,
    channel: process.env.SLACK_CHANNEL_TIX,
    text: "Attendance Dispute Ticket",
    blocks,
  });
};

const viewDisputes = (req, res) => {
  const cid = req.session.user[0].company_id;
  const q =
    "SELECT e.emp_num, CONCAT(e.f_name, ' ', IF(e.m_name IS NOT NULL and e.m_name != '', LEFT(e.m_name, 1), 'N/A'), '.', ' ',e.s_name) AS 'name', p.position_name, d.dispute_id, d.dispute_type, d.requester_id, d.dispute_title, d.dispute_body, d.dispute_status, CONCAT(e2.f_name, ' ', IF(e2.m_name IS NULL OR e2.m_name = '', ' ', CONCAT(SUBSTRING(e2.m_name, 1, 1), '. ')), e2.s_name) AS 'handled_by' ,d.raised_at, d.closed_at FROM `dispute` d INNER JOIN emp e ON e.emp_id = d.requester_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id INNER JOIN position p on p.position_id = ed.position_id LEFT JOIN emp e2 on e2.emp_id = d.handled_by  WHERE ed.company_id = " +
    cid +
    ";";

  db.query(q, (err, rows) => {
    if (err) return res.json(err);
    return res.json(rows);
  });
};

const viewUserDisputes = (req, res) => {
  const uid = req.session.user[0].emp_id;
  const cid = req.session.user[0].company_id;
  const q =
    "SELECT d.*, CONCAT(e2.f_name, ' ', IFNULL(CONCAT(SUBSTRING(e2.m_name, 1, 1), '. '), ''), ' ', e2.s_name) as 'handler_name' FROM `dispute` d INNER JOIN emp e ON e.emp_id = d.requester_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id LEFT JOIN emp e2 ON e2.emp_id = d.handled_by WHERE ed.company_id = ? AND d.requester_id = ?";

  db.query(q, [cid, uid], (err, rows) => {
    if (err) return res.json(err);
    return res.json(rows);
  });
};

const updateUserDispute = (req, res) => {
  const uid = req.session.user[0].emp_id;
  const cid = req.session.user[0].company_id;
  const { dispute_status, requester_id, dispute_id } = req.body;
  const q =
    "UPDATE `dispute` SET `dispute_status`= ?, `handled_by` = ?, `closed_at` = ?  WHERE `dispute_id`= ? AND `requester_id`= ?";

  db.query(
    q,
    [
      req.bodu.dispute_status,
      uid,
      moment().format("YYYY-MM-DD HH:mm:ss"),
      dispute_id,
      requester_id,
    ],
    (err, rows) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );
};

// ------------------------- Dispute For Attendance --------------------------------- //

async function CreateAttendanceDispute(req, res) {
  const uid = req.session.user[0].emp_id;

  console.log("req body, ", req.body);

  const values = [
    "Attendance Dispute",
    uid,
    moment(req.body.dispute_date).format("YYYY-MM-DD"),
    req.body.dispute_title,
    req.body.dispute_body,
    0,
  ];

  const q =
    "INSERT INTO `dispute`(`dispute_type`, `requester_id`, `dispute_date`, `dispute_title`, `dispute_body`, `dispute_status`) VALUES (?)";

  db.query(q, [values], (err, data) => {
    if (err) return res.send(err);
    return res.send(data);
  });

  const fn = req.session.user[0].f_name;
  const sn = req.session.user[0].s_name;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Attendance Ticket*`,
      },
    },
    {
      "type": "section",
      "text": {
          "type": "mrkdwn",
          "text": `*Appellant's Name:* ${fn} ${sn}`
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Date to Appeal:*\n ${moment(req.body.dispute_date).format(
            "MMMM DD YYYY"
          )}`,
        },
        {
          type: "mrkdwn",
          text: `*Type of Appeal:*\n ${req.body.dispute_title}`,
        },
        {
          type: "mrkdwn",
          text: `*Appeal Reason:*\n ${req.body.dispute_body}`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Check Ticket",
          },
          style: "primary",
          url: `https://app.kriyahr.com/hr/hr-management/tickets`,
        },
      ],
    },
  ];

  await tix_app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN_TIX,
    channel: process.env.SLACK_CHANNEL_TIX,
    text: "Attendance Dispute Ticket",
    blocks,
  });
}

function AllMyAttendanceDisputes(req, res) {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM dispute d LEFT JOIN emp e ON d.handled_by = e.emp_id WHERE requester_id = ? AND dispute_type = 'Attendance Dispute' ORDER BY raised_at DESC";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetHRPendingAttendanceDisputes(req, res) {
  const cid = req.session.user[0].company_id

  const q = `SELECT d.*, er.f_name AS r_f_name, er.s_name AS r_s_name, eh.f_name AS h_f_name, eh.s_name AS h_s_name FROM dispute d LEFT JOIN emp eh ON d.handled_by = eh.emp_id INNER JOIN emp er ON d.requester_id = er.emp_id INNER JOIN emp_designation ed ON d.requester_id = ed.emp_id WHERE dispute_type = 'Attendance Dispute' AND ed.company_id = ? AND d.dispute_status = 0 ORDER BY raised_at DESC`

  db.query(q, [cid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetHRAttendanceDisputes(req, res) {
  const cid = req.session.user[0].company_id

  const q = `SELECT d.*, er.f_name AS r_f_name, er.s_name AS r_s_name, eh.f_name AS h_f_name, eh.s_name AS h_s_name FROM dispute d LEFT JOIN emp eh ON d.handled_by = eh.emp_id INNER JOIN emp er ON d.requester_id = er.emp_id INNER JOIN emp_designation ed ON d.requester_id = ed.emp_id WHERE dispute_type = 'Attendance Dispute' AND ed.company_id = ? ORDER BY raised_at DESC`

  db.query(q, [cid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function ApproveDispute(req, res) {
  const did = req.params.dispute_id;
  const uid = req.session.user[0].emp_id
  const q = "UPDATE dispute SET dispute_status = 1, handled_by = ? WHERE dispute_id = ?";

  db.query(q, 
      [uid, did], 
      (err,data) => {
      if (err){
          console.log(err);
          res.send("error")
      } else {
          console.log(data)
          res.send(data)
      }
  })
}

function RejectDispute(req, res) {
  const did = req.params.dispute_id;
  const uid = req.session.user[0].emp_id
  const q = "UPDATE dispute SET dispute_status = 2, handled_by = ? WHERE dispute_id = ?";

  db.query(q, 
      [uid, did], 
      (err,data) => {
      if (err){
          console.log(err);
          res.send("error")
      } else {
          console.log(data)
          res.send(data)
      }
  })
}

module.exports = {
  createDispute,
  viewDisputes,
  viewUserDisputes,
  updateUserDispute,

  //Attendance Dispute
  CreateAttendanceDispute,
  AllMyAttendanceDisputes,
  GetHRAttendanceDisputes,
  GetHRPendingAttendanceDisputes,

  //Action Disputes
  ApproveDispute,
  RejectDispute
};
