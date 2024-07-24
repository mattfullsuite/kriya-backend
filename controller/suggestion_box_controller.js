const moment = require("moment");
var db = require("../config.js");
const { v4: uuidv4 } = require("uuid");

// controllers for request feature in suggestion box

function GetRequestMessages(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;

  const q =
    "SELECT * FROM suggestion_box_request WHERE requester_id = ? ORDER BY request_date DESC";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetRequestMessageContent(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;

  const q =
    "SELECT * FROM suggestion_box_request WHERE request_id = ? AND requester_id = ?";

  db.query(q, [requestID, uid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      if (data.length != 0) {
        return res.json(data);
      } else {
        return res.sendStatus(404);
      }
    }
  });
}

function GetRequestMessageChat(req, res) {
  const requestID = req.params.request_id;

  const q =
    "SELECT request_id, sender_id, request_chat, request_timestamp, f_name, s_name, emp_pic FROM suggestion_box_request_conversation AS sbc INNER JOIN emp ON sbc.sender_id = emp.emp_id  WHERE request_id = ?";

  db.query(q, [requestID], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

function InsertRequest(req, res) {
  const request_id = uuidv4();
  const requester_id = req.session.user[0].emp_id;
  const hr_id = req.body.hr_id;
  const request_subject = req.body.request_subject;
  const request_content = req.body.request_content;

  q =
    "INSERT INTO suggestion_box_request (request_id, requester_id, hr_id, request_subject, request_content) VALUES (?, ?, ?, ?, ?)";

  db.query(
    q,
    [request_id, requester_id, hr_id, request_subject, request_content],
    (err) => {
      if (err) {
        console.log(err);
      }

      return res.sendStatus(200);
    }
  );
}

function InsertRequestChat(req, res) {
  const request_id = req.body.requestID;
  const sender_id = req.session.user[0].emp_id;
  const request_chat = req.body.request_chat;

  const q =
    "INSERT INTO suggestion_box_request_conversation (request_id, sender_id, request_chat) VALUES (?, ?, ?)";

  db.query(q, [request_id, sender_id, request_chat], (err) => {
    if (err) console.log(err);

    return res.sendStatus(200);
  });
}

// controllers for complaint feature in suggestion box

function GetComplaintMessages(req, res) {
  const uid = req.session.user[0].emp_id;
  const complaintID = req.params.request_id;

  const q =
    "SELECT * FROM suggestion_box_complaint WHERE complainant_id = ? ORDER BY complaint_date DESC";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetComplaintMessagesContent(req, res) {
  const uid = req.session.user[0].emp_id;
  const complaintID = req.params.complaint_id;

  const q =
    "SELECT * FROM suggestion_box_complaint WHERE complaint_id = ? AND complainant_id = ?";

  db.query(q, [complaintID, uid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      if (data.length != 0) {
        return res.json(data);
      } else {
        return res.sendStatus(404);
      }
    }
  });
}

function GetComplaintMessageChat(req, res) {
  const complaintID = req.params.complaint_id;

  const q = "SELECT sbc.*, f_name, s_name, emp_pic FROM suggestion_box_complaint_conversation sbc INNER JOIN emp ON sbc.sender_id = emp.emp_id WHERE sbc.complaint_id = ?";

  db.query(q, [complaintID], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

function InsertComplaint(req, res) {
  const complaint_id = uuidv4();
  const complainant_id = req.session.user[0].emp_id;
  const hr_id = req.body.hr_id;
  const complaint_subject = req.body.complaint_subject;
  const complaint_content = req.body.complaint_content;
  const is_anonymous = req.body.is_anonymous;

  const q = "INSERT INTO suggestion_box_complaint (complaint_id, complainant_id, hr_id, complaint_subject, complaint_content, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(q, [complaint_id, complainant_id, hr_id, complaint_subject, complaint_content, is_anonymous], (err, data) => {
    if(err) console.log(err);

    return res.sendStatus(200);
  })
}

function InsertComplaintChat(req, res) {
  const complaint_id = req.body.complaintID;
  const sender_id = req.session.user[0].emp_id;
  const complaint_chat = req.body.complaint_chat;

  const q = "INSERT INTO suggestion_box_complaint_conversation (complaint_id, sender_id, complaint_chat) VALUES (?, ?, ?)";

  db.query(q, [complaint_id, sender_id, complaint_chat], (err, data) => {
    if(err) console.log(err);


    return res.sendStatus(200);
  })
}

// controllers for utilities in suggestion box

function GetHr(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT emp_id, f_name, s_name FROM emp WHERE emp_role = 1 AND emp_id != ? AND date_separated IS NULL ORDER BY f_name ASC";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

module.exports = {
  GetRequestMessages,
  GetRequestMessageChat,
  GetRequestMessageContent,
  InsertRequest,
  InsertRequestChat,
  GetComplaintMessages,
  GetComplaintMessagesContent,
  GetComplaintMessageChat,
  InsertComplaint,
  InsertComplaintChat,
  GetHr,
};
