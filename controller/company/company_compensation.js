var db = require("../../config.js");

function CreateCompanyCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { compensation_name } = req.params;
  const q =
    "INSERT INTO `company_compensation`(`company_id`, `compensation_name`) VALUES ?";
  db.query(q, [comp_id, compensation_name], (err, rows) => {
    if (err) return res.json(err);
    return res.json(rows);
  });
}

function GetCompanyCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const q = "SELECT * FROM `company_compensation` WHERE `company_id` = ? ";
  db.query(q, comp_id, (err, rows) => {
    if (err) return res.json(err);
    return res.json(rows);
  });
}

module.exports = {
  CreateCompanyCompensation,
  GetCompanyCompensation,
};
