var db = require("../config.js");

function GetAllActiveSurveys(req, res) {
  var uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM pulse_survey WHERE pulse_survey_id not in (SELECT survey_id FROM pulse_survey_answers WHERE respondent_id = ?) AND survey_status = 1";

  db.query(q, uid, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function GetAnswersFromActiveSurvey(req, res) {
  var uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM pulse_survey INNER JOIN pulse_survey_answers ON pulse_survey_id = survey_id WHERE survey_status = 1 AND respondent_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function InsertSurveyAnswer(req, res) {
  var uid = req.session.user[0].emp_id;
  const values = req.body;

  console.log(values);

  const dataProcessed = values.map((items) => {
    const { survey_id, answer } = items;

    return [uid, survey_id, answer];
  });

  console.log(dataProcessed);

  const q =
    "INSERT INTO pulse_survey_answers (`respondent_id`, `survey_id`, `answer_body`) VALUES ?";

  db.query(q, [dataProcessed], (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("success");
    }
  });
}

function GetPreviousSurveyAnswers(req, res) {
  var uid = req.session.user[0].emp_id;
  const q =
    "SELECT *, CAST(date_created AS date) AS converted_date FROM pulse_survey_answers psa INNER JOIN pulse_survey ON pulse_survey_id = survey_id WHERE respondent_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function GetPreviousSurveyDates(req, res) {
  var uid = req.session.user[0].emp_id;
  const q =
    "SELECT DISTINCT CAST(date_created AS date) AS converted_date FROM pulse_survey_answers psa INNER JOIN pulse_survey ON pulse_survey_id = survey_id WHERE respondent_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

module.exports = {
  GetAllActiveSurveys,
  InsertSurveyAnswer,
  GetPreviousSurveyAnswers,
  GetAnswersFromActiveSurvey,
  GetPreviousSurveyDates,
};
