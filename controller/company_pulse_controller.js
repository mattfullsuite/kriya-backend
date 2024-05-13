var db = require("../config.js");

function GetCompanyMoodPulse(req, res){
    const cid = req.session.user[0].company_id
    const q = "SELECT DISTINCT e.f_name, d.dept_name, (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 AND emp_id = e.emp_id) AS low_logs, (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 AND emp_id = e.emp_id) AS neutral_logs, (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 AND emp_id = e.emp_id) AS high_mood FROM pulse_mood AS p INNER JOIN emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS po ON em.position_id = po.position_id INNER JOIN dept AS d ON d.dept_id = po.dept_id WHERE em.company_id = ?";
  
    db.query(q, [cid],(err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}


module.exports = 
{ 
 GetCompanyMoodPulse
};