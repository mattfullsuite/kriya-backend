const moment = require("moment");
var db = require("../config.js");
const { v4: uuidv4 } = require("uuid");

function GetRequestMessages(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;

  const q = "SELECT * FROM suggestion_box_request WHERE requester_id = ? ORDER BY request_date DESC";

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
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;
  const requesterID = req.params.emp_id;

  const q =
    "SELECT request_id, sender_id, request_chat, request_timestamp, f_name, s_name, emp_pic FROM suggestion_box_request_conversation AS sbc INNER JOIN emp ON sbc.sender_id = emp.emp_id  WHERE request_id = ?";

  db.query(q, [requestID], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

function GetHr(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT emp_id, f_name, s_name FROM emp WHERE emp_role = 1 AND emp_id != ? AND date_separated IS NULL ORDER BY f_name ASC";

  db.query(q, [uid], (err, data) => {
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

      q = "SELECT * FROM suggestion_box_request WHERE request_id = ?";

      db.query(q, [request_id], (err, data) => {
        if(err) console.log(err);

        return res.json(data);
      })
    }
  );
}

function InsertRequestChat(req, res) {
  const request_id = req.body.requestID;
  const sender_id = req.session.user[0].emp_id;
  const request_chat = req.body.request_chat;

  const q = "INSERT INTO suggestion_box_request_conversation (request_id, sender_id, request_chat) VALUES (?, ?, ?)";

  db.query(q, [request_id, sender_id, request_chat], (err) => {
    if(err) console.log(err);

    return res.sendStatus(200);
  });
}

module.exports = {
  GetRequestMessages,
  GetRequestMessageChat,
  GetRequestMessageContent,
  GetHr,
  InsertRequest,
  InsertRequestChat,
};
