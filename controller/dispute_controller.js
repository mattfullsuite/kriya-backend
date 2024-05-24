var db = require("../config.js");

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
    "SELECT * FROM `dispute` d INNER JOIN emp e ON e.emp_id = d.requester_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id WHERE ed.company_id = " +
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
    "SELECT d.* FROM `dispute` d INNER JOIN emp e ON e.emp_id = d.requester_id INNER JOIN emp_designation ed ON ed.emp_id = e.emp_id WHERE ed.company_id = ? AND d.requester_id = ?";

  db.query(q, [cid, uid], (err, rows) => {
    if (err) return res.json(err);
    return res.json(rows);
  });
};

module.exports = {
  createDispute,
  viewDisputes,
  viewUserDisputes,
};
