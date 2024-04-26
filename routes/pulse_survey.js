var express = require("express");
var imports =  {
    GetAllActiveSurveys,
    InsertSurveyAnswer,
} = require( "../controller/pulse_survey_controller.js");

const router = express.Router()

router.get("/mp-getAllActiveSurveys", GetAllActiveSurveys);
router.post("/mp-insertSurveyAnswer", InsertSurveyAnswer)

module.exports = router;