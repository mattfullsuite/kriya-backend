var db = require("../../config.js");

function GetDivisions(req, res) {
  const comp_id = req.session.user[0].company_id;
  const q = "SELECT div_id, div_name FROM `division` WHERE `company_id` = ?";
  db.query(q, [comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = { GetDivisions };
