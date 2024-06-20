var express = require("express");
var imports =  {
    GetAllActiveSurveys,
    InsertSurveyAnswer,
    GetPreviousSurveyAnswers,
    GetAnswersFromActiveSurvey,
    GetPreviousSurveyDates
} = require( "../controller/pulse_survey_controller.js");

const router = express.Router()

router.get("/mp-getAllActiveSurveys", GetAllActiveSurveys);
router.post("/mp-insertSurveyAnswer", InsertSurveyAnswer);
router.get("/mp-getPreviousSurveyAnswers", GetPreviousSurveyAnswers);
router.get("/mp-getPreviousSurveyDates", GetPreviousSurveyDates);
router.get("/mp-getAnswersFromActiveSurveys", GetAnswersFromActiveSurvey);

module.exports = router;