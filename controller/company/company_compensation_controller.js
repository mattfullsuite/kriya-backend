var db = require("../../config.js");

function CreateCompanyCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { compensation_name } = req.body;
  const q =
    "INSERT INTO `company_compensation`(`company_id`, `compensation_name`) VALUES ?";
  db.query(q, [comp_id, compensation_name], (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function GetCompanyCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const q = "SELECT * FROM `company_compensation` WHERE `company_id` = ? ";
  db.query(q, comp_id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function UpdateCompanyCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { compensation_name } = req.body;
  const { compensation_id } = req.params;
  const q =
    "UPDATE `company_compensation` SET `compensation_name`='?' WHERE `company_compensation_id` = ? AND `company_id` = ?";
  db.query(q, [compensation_name, compensation_id, comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function DeleteCompanyCompensation(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { compensation_id } = req.params;
  const q =
    "DELETE FROM `company_compensation` WHERE `company_compensation_id`= ? AND `company_id` = ?";
  db.query(q, [compensation_id, comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

module.exports = {
  CreateCompanyCompensation,
  GetCompanyCompensation,
  UpdateCompanyCompensation,
  DeleteCompanyCompensation,
};
