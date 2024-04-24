var db = require("../config.js");

function GetAllActiveSurveys(req, res) {
    const q = "SELECT * FROM pulse_survey WHERE survey_status = 1 ORDER BY pulse_survey_id ASC LIMIT 5"

    db.query(q,
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
}

function InsertSurveyAnswer(req, res) {
    var uid = req.session.user[0].emp_id;
    const values = [
        uid, 
        req.body.survey_id,
        req.body.survey_answer,
    ]

    const q = "INSERT INTO pulse_survey_answers (`respondent_id`, `survey_id`, `answer_body`) VALUES (?)"

    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err);
        } else {
            res.json("success");
            console.log("success");
        }
    })
};


module.exports = { 
    GetAllActiveSurveys,
    InsertSurveyAnswer
}