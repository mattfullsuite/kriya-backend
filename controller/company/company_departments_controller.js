var db = require("../../config.js");

function GetDepartments(req, res) {
  const comp_id = req.session.user[0].company_id;
  const q =
    "SELECT de.dept_id, de.dept_name FROM `dept` de INNER JOIN `division` di on di.div_id = de.div_id INNER JOIN company c on c.company_id = di.company_id WHERE c.company_id = ? ";
  db.query(q, [comp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = { GetDepartments };
