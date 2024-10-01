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
    "SELECT sbr.*, hr.f_name AS hr_fname, hr.s_name AS hr_sname FROM suggestion_box_request sbr LEFT JOIN emp hr ON sbr.hr_id = hr.emp_id WHERE request_id = ? AND requester_id = ?";

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
    (err, data) => {
      if (err) {
        console.log(data);
      }

      return res.send({
        requestID: request_id,
        requesterID: requester_id,
        hrID: hr_id,
        requestSubject: request_subject,
        requestContent: request_content,
        requestDate: moment().format(),
      });
    }
  );
}

function InsertRequestChat(req, res) {
  const request_id = req.body.requestID;
  const sender_id = req.session.user[0].emp_id;
  const request_chat = req.body.request_chat;

  const q =
    "INSERT INTO suggestion_box_request_conversation (request_id, sender_id, request_chat) VALUES (?, ?, ?)";

  db.query(q, [request_id, sender_id, request_chat], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.send(data);
    }
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
    "SELECT sbc.*, hr.f_name AS hr_fname, hr.s_name AS hr_sname FROM suggestion_box_complaint sbc LEFT JOIN emp hr ON sbc.hr_id = hr.emp_id WHERE complaint_id = ? AND complainant_id = ?";

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

  const q =
    "SELECT sbc.*, f_name, s_name, emp_pic FROM suggestion_box_complaint_conversation sbc INNER JOIN emp ON sbc.sender_id = emp.emp_id WHERE sbc.complaint_id = ?";

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

  const q =
    "INSERT INTO suggestion_box_complaint (complaint_id, complainant_id, hr_id, complaint_subject, complaint_content, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    q,
    [
      complaint_id,
      complainant_id,
      hr_id,
      complaint_subject,
      complaint_content,
      is_anonymous,
    ],
    (err, data) => {
      if (err) console.log(err);

      return res.sendStatus(200);
    }
  );
}

function InsertComplaintChat(req, res) {
  const complaint_id = req.body.complaintID;
  const sender_id = req.session.user[0].emp_id;
  const complaint_chat = req.body.complaint_chat;

  const q =
    "INSERT INTO suggestion_box_complaint_conversation (complaint_id, sender_id, complaint_chat) VALUES (?, ?, ?)";

  db.query(q, [complaint_id, sender_id, complaint_chat], (err, data) => {
    if (err) console.log(err);

    return res.sendStatus(200);
  });
}

// controllers for utilities in suggestion box

function GetHr(req, res) {
  const uid = req.session.user[0].emp_id;
  const companyID = req.session.user[0].company_id;

  const q =
    "SELECT hr.emp_id, hr.f_name, hr.s_name FROM emp hr INNER JOIN emp_designation ed ON hr.emp_id = ed.emp_id WHERE ed.company_id = ? AND hr.emp_role = 1 AND hr.emp_id != ? AND hr.date_separated IS NULL ORDER BY hr.f_name ASC";

  db.query(q, [companyID, uid], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

function GetRequestChat(req, res) {
  const requestID = req.params.request_id;

  const q =
    "SELECT request_id, sender_id, request_chat, request_timestamp, f_name, s_name, emp_pic, emp_role FROM suggestion_box_request_conversation AS sbc INNER JOIN emp ON sbc.sender_id = emp.emp_id WHERE request_id = ? ORDER BY sbc.request_timestamp ASC";

  db.query(q, [requestID], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

// controllers for HR tickets

function GetRequestTickets(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT sbr.request_id, sbr.request_subject, sbr.request_content, sbr.request_date, sbr.is_resolved, requester.f_name AS requester_fname, requester.s_name AS requester_sname FROM suggestion_box_request sbr INNER JOIN emp requester ON sbr.requester_id = requester.emp_id WHERE (hr_id = ? OR hr_id IS NULL) AND (requester_id != ?)";

  db.query(q, [uid, uid], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

function GetRequestTicketContent(req, res) {
  const uid = req.session.user[0].emp_id;
  const requestID = req.params.request_id;

  const q =
    "SELECT sbr.*, requester.f_name AS requester_fname, requester.s_name AS requester_sname FROM suggestion_box_request sbr INNER JOIN emp requester ON sbr.requester_id = requester.emp_id WHERE (sbr.hr_id = ? OR sbr.hr_id IS NULL) AND (sbr.request_id = ?)";

  db.query(q, [uid, requestID], (err, data) => {
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

function GetComplaintTickets(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT sbc.complaint_id, sbc.complaint_subject, sbc.complaint_content, sbc.complaint_date, sbc.is_anonymous, sbc.is_resolved, complainant.f_name AS complainant_fname, complainant.s_name AS complainant_sname FROM suggestion_box_complaint sbc INNER JOIN emp complainant ON sbc.complainant_id = complainant.emp_id WHERE (hr_id = ? OR hr_id IS NULL) AND (complainant_id != ?)";

  db.query(q, [uid, uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function GetComplaintTicketContent(req, res) {
  const uid = req.session.user[0].emp_id;
  const complaintID = req.params.complaint_id;

  const q =
    "SELECT sbc.*, complainant.f_name AS complainant_fname, complainant.s_name AS complainant_sname, hr.f_name AS hr_fname, hr.s_name AS hr_sname FROM suggestion_box_complaint sbc INNER JOIN emp complainant ON sbc.complainant_id = complainant.emp_id LEFT JOIN emp hr ON sbc.hr_id = hr.emp_id WHERE (sbc.hr_id = ? OR sbc.hr_id IS NULL) AND (sbc.complaint_id = ?)";

  db.query(q, [uid, complaintID], (err, data) => {
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

function UpdateRequestStatus(req, res) {
  const requestID = req.body.requestID;
  const status = req.body.status;

  const q =
    "UPDATE suggestion_box_request SET is_resolved = ? WHERE request_id = ?";

  db.query(q, [status, requestID], (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
}

function UpdateComplaintStatus(req, res) {
  const complaintID = req.body.complaintID;
  const status = req.body.status;

  const q =
    "UPDATE suggestion_box_complaint SET is_resolved = ? WHERE complaint_id = ?";

  db.query(q, [status, complaintID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

// controller for suggestion box

// post
function InsertNewSuggestionBox(req, res, next) {
  const uid = req.session.user[0].emp_id;
  const sb_id = uuidv4();
  const creator_id = req.session.user[0].emp_id;
  const hr_id = req.body.hr_id;
  const sb_type = req.body.sb_type;
  const sb_subject = req.body.sb_subject;
  const sb_content = req.body.sb_content;

  const q =
    "INSERT INTO suggestion_box (sb_id, creator_id, hr_id, sb_type, sb_subject, sb_content) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    q,
    [sb_id, creator_id, hr_id, sb_type, sb_subject, sb_content],
    (err, data) => {
      if (err) {
        res.json(err);
      } else {
        if (hr_id != null) {
          const q =
            "INSERT INTO conversation_seen_status (sb_id, receiver_id) VALUES (?, ?)";

          db.query(q, [sb_id, hr_id], (err, data) => {
            if (err) console.log(err);
            else {
              res.json({
                sb_id: sb_id,
                creator_id: creator_id,
                hr_id: hr_id,
                sb_type: sb_type,
                sb_subject: sb_subject,
                sb_content,
                sb_content,
                sb_date: moment().format(),
                latest_chat: null,
                latest_chat_time: null,
                is_resolved: 0,
                count_chat: 1,
              });
            }
          });
        } else {
          const q =
            "INSERT INTO conversation_seen_status (sb_id, receiver_id) SELECT ?, hr.emp_id FROM emp hr WHERE hr.emp_role = 1 AND hr.emp_id != ?";

          db.query(q, [sb_id, uid], (err, data) => {
            if (err) console.log(err);
            else {
              res.json({
                sb_id: sb_id,
                creator_id: creator_id,
                hr_id: hr_id,
                sb_type: sb_type,
                sb_subject: sb_subject,
                sb_content,
                sb_content,
                latest_chat: null,
                latest_chat_time: null,
                sb_date: moment().format(),
                is_resolved: 0,
                count_chat: 1,
              });
            }
          });
        }
      }
    }
  );
}

function InsertNewSuggestionBoxSeenStatus(req, res) {
  const uid = req.session.user[0].emp_id;
  const sb_id = req.body.sb_id;
  const receiver_id = req.body.receiver_id;

  if (receiver_id != null) {
    const q =
      "INSERT INTO conversation_seen_status (sb_id, receiver_id) VALUES (?, ?)";

    db.query(q, [sb_id, receiver_id], (err, data) => {
      if (err) console.log(err);
      else {
        res.sendStatus(200);
      }
    });
  } else {
    const q =
      "INSERT INTO conversation_seen_status (sb_id, receiver_id) SELECT ?, hr.emp_id FROM emp hr WHERE hr.emp_role = 1 AND hr.emp_id != ?";

    db.query(q, [sb_id, uid], (err, data) => {
      if (err) console.log(err);
      else {
        res.sendStatus(200);
      }
    });
  }
}

function InsertNewSuggestionBoxConversation(req, res, next) {
  const sb_id = req.body.sb_id;
  const sender_id = req.session.user[0].emp_id;
  const sb_chat = req.body.sb_chat;

  const q =
    "INSERT INTO suggestion_box_conversation (sb_id, sender_id, sb_chat) VALUES (?, ?, ?);";

  db.query(q, [sb_id, sender_id, sb_chat], (err) => {
    if (err) {
      console.log(err);
    } else {
      next();
    }
  });
}
// end of post

// get
function GetSuggestionBox(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT sb.*, sbc.sender_id AS latest_sender_id, sbc.sb_chat AS latest_chat, sbc.sb_timestamp AS latest_chat_time, COALESCE((SELECT COUNT(*) FROM conversation_seen_status sbss WHERE sbss.sb_id = sb.sb_id AND sbss.is_seen = 0 AND sbss.receiver_id = ?), 0) AS count_chat FROM suggestion_box sb LEFT JOIN suggestion_box_conversation sbc ON sb.sb_id = sbc.sb_id AND sbc.sb_timestamp = (SELECT MAX(sbc2.sb_timestamp) FROM suggestion_box_conversation sbc2 WHERE sbc2.sb_id = sb.sb_id) WHERE (sb.creator_id = ?) ORDER BY count_chat DESC, sb.sb_date DESC, sbc.sb_timestamp DESC";

  db.query(q, [uid, uid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetSuggestionBoxInfo(req, res) {
  const sb_id = req.params.sbID;
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT sb.*, hr.emp_id AS hr_id, hr.f_name AS hr_fname, hr.s_name AS hr_sname FROM suggestion_box sb LEFT JOIN emp hr ON sb.hr_id = hr.emp_id WHERE sb_id = ? AND sb.creator_id = ?";

  db.query(q, [sb_id, uid], (err, data) => {
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

function GetSuggestionBoxConversation(req, res) {
  const sb_id = req.params.sbID;

  const q =
    "SELECT sbc.*, sender.f_name AS sender_fname, sender.s_name AS sender_sname FROM suggestion_box_conversation sbc INNER JOIN emp sender ON sbc.sender_id = sender.emp_id WHERE sbc.sb_id = ? ORDER BY sbc.sb_timestamp ASC";

  db.query(q, [sb_id], (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
}

function GetSuggestionBoxCount(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT COUNT(css.sb_id) AS sb_count FROM conversation_seen_status css INNER JOIN suggestion_box sb ON css.sb_id = sb.sb_id WHERE css.receiver_id = ? AND css.is_seen = 0 AND sb.creator_id = ?";

  db.query(q, [uid, uid], (err, data) => {
    if (err) console.log(err);
    else {
      res.json(data);
    }
  });
}
// end of get

// controller for hr tickets

// get
function GetEmployeeInitiated(req, res) {
  const uid = req.session.user[0].emp_id;

  const q ="SELECT sb.*, sbc.sender_id AS latest_sender_id, sbc.sb_chat AS latest_chat, sbc.sb_timestamp AS latest_chat_time, COALESCE((SELECT COUNT(*) FROM conversation_seen_status sbss WHERE sbss.sb_id = sb.sb_id AND sbss.is_seen = 0 AND sbss.receiver_id = ?), 0) AS count_chat FROM suggestion_box sb LEFT JOIN suggestion_box_conversation sbc ON sb.sb_id = sbc.sb_id AND sbc.sb_timestamp = (SELECT MAX(sbc2.sb_timestamp) FROM suggestion_box_conversation sbc2 WHERE sbc2.sb_id = sb.sb_id) WHERE (sb.hr_id = ? OR sb.hr_id IS NULL AND sb.creator_id != ?) ORDER BY count_chat DESC, sb.sb_date DESC, sbc.sb_timestamp DESC";

  db.query(q, [uid, uid, uid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetEmployeeInitiatedInfo(req, res) {
  const uid = req.session.user[0].emp_id;
  const sb_id = req.params.sbID;

  const q =
    "SELECT * FROM suggestion_box sb WHERE (sb.hr_id = ? OR hr_id IS NULL) AND (sb.sb_id =?)";

  db.query(q, [uid, sb_id], (err, data) => {
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

function GetTicketsCount(req, res) {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT COUNT(css.sb_id) AS ticket_count FROM conversation_seen_status css INNER JOIN suggestion_box sb ON css.sb_id = sb.sb_id WHERE css.receiver_id = ? AND css.is_seen = 0 AND sb.creator_id != ?";

  db.query(q, [uid, uid], (err, data) => {
    if (err) console.log(err);
    else {
      res.json(data);
    }
  });
}

// function GetCountTicket(req, res) {
//   SELECT request_id, COUNT(request_id) FROM conversation_seen_status
// }
// end of get

// post

function UpdateSuggestionBoxStatus(req, res) {
  const sb_id = req.body.sb_id;
  const sb_status = req.body.status;

  const q = "UPDATE suggestion_box SET is_resolved = ? WHERE sb_id = ?";

  db.query(q, [sb_status, sb_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.sendStatus(200);
    }
  });
}

function UpdateSuggestionBoxSeenStatus(req, res) {
  const sb_id = req.body.sb_id;
  const uid = req.session.user[0].emp_id;
  
  const q = "UPDATE conversation_seen_status SET is_seen = ? WHERE sb_id = ? AND receiver_id = ? AND is_seen = 0";

  db.query(q, [1, sb_id, uid], (err, data) => {
    if(err) console.log(err);

    else {
      res.json(data.affectedRows);
    }
  });
}

// end of post

module.exports = {
  GetRequestMessages,
  GetRequestChat,
  GetRequestMessageContent,
  InsertRequest,
  InsertRequestChat,
  GetComplaintMessages,
  GetComplaintMessagesContent,
  GetComplaintMessageChat,
  InsertComplaint,
  InsertComplaintChat,
  GetHr,
  GetRequestTickets,
  GetRequestTicketContent,
  GetComplaintTickets,
  GetComplaintTicketContent,
  UpdateRequestStatus,
  UpdateComplaintStatus,
  InsertNewSuggestionBox,
  GetSuggestionBox,
  GetSuggestionBoxInfo,
  GetSuggestionBoxConversation,
  InsertNewSuggestionBoxConversation,
  InsertNewSuggestionBoxSeenStatus,
  GetEmployeeInitiated,
  GetEmployeeInitiatedInfo,
  GetTicketsCount,
  UpdateSuggestionBoxStatus,
  UpdateSuggestionBoxSeenStatus,
  GetSuggestionBoxCount,
};