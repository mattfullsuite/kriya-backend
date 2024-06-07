const { Models } = require("openai/resources/models.mjs");
var db = require("../../config.js");

function GetCompanyConfiguration(req, res) {
  const comp_id = req.session.user[0].company_id;
  const q = "SELECT * FROM `company_configuration` WHERE `company_id` = ?";
  db.query(q, comp_id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function UpdateCompanyConfiguration(req, res) {
  const comp_id = req.session.user[0].company_id;
  const { configuration_value } = req.body;
  const { configuration_id } = req.params;
  const q =
    "UPDATE `company_configuration` SET `configuration_value`= ? WHERE `company_configuration_id` = ? AND `company_id` = ?";
  db.query(q, [configuration_value, configuration_id, comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

module.exports = {
  GetCompanyConfiguration,
  UpdateCompanyConfiguration,
};
