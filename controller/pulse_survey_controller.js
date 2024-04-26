var db = require("../config.js");

function GetAllActiveSurveys(req, res) {
  var uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM pulse_survey WHERE pulse_survey_id not in (SELECT survey_id FROM pulse_survey_answers WHERE respondent_id = ?)";

  db.query(q, uid, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function InsertSurveyAnswer(req, res) {
  var uid = req.session.user[0].emp_id;
  const values = [uid, req.body.survey_id, req.body.survey_answer];

  const q =
    "INSERT INTO pulse_survey_answers (`respondent_id`, `survey_id`, `answer_body`) VALUES (?)";

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send("error");
    } else {
      res.send("success");
    }
  });
}

module.exports = {
  GetAllActiveSurveys,
  InsertSurveyAnswer,
};
