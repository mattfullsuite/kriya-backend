var db = require("../config.js");
var moment = require("moment");

const createDispute = (req, res) => {
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
      dispute_status,
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

module.exports = {
  createDispute,
  viewDisputes,
  viewUserDisputes,
  updateUserDispute,
};
