var express = require("express");
var imports =  {
    GetAllActiveSurveys,
    InsertSurveyAnswer,
    GetPreviousSurveyAnswers,
    GetAnswersFromActiveSurvey,
    GetPreviousSurveyDates,

    //Anon Pulse Survey
    GetAllAnonActiveSurveys,
    InsertAnonSurveyAnswer,
} = require( "../controller/pulse_survey_controller.js");

const router = express.Router()

router.get("/mp-getAllActiveSurveys", GetAllActiveSurveys);
router.post("/mp-insertSurveyAnswer", InsertSurveyAnswer);
router.get("/mp-getPreviousSurveyAnswers", GetPreviousSurveyAnswers);
router.get("/mp-getPreviousSurveyDates", GetPreviousSurveyDates);
router.get("/mp-getAnswersFromActiveSurveys", GetAnswersFromActiveSurvey);

//Anon Pulse Survey
router.get("/mp-getAllAnonActiveSurveys", GetAllAnonActiveSurveys);
router.post("/mp-insertAnonSurveyAnswer", InsertAnonSurveyAnswer);

module.exports = router;