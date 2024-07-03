var db = require("../config.js");

function GetRequestMessages(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;

  const q =
    "SELECT * FROM suggestion_box_request WHERE request_id = ? AND emp_id = ?";

  db.query(q, [requestID, uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetRequestMessageContent(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;

  const q =
    "SELECT * FROM suggestion_box_request WHERE request_id = ? AND emp_id = ?";

  db.query(q, [requestID, uid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      if(data.length != 0) {
        return res.json(data);
      } else {
        return res.sendStatus(403);
      }
    }
  });
}

function GetRequestMessageChat(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;
  const requesterID = req.params.emp_id;

  if (uid == requesterID) {
    const q =
      "SELECT * FROM suggestion_box_request_conversation WHERE request_id = ? AND requester_id = ?";

    db.query(q, [requestID, requesterID], (err, data) => {
      if (err) return res.json(err);

      return res.json(data);
    });
  } else {
    res.sendStatus(403);
  }
}

module.exports = {
  GetRequestMessages,
  GetRequestMessageChat,
  GetRequestMessageContent,
};
