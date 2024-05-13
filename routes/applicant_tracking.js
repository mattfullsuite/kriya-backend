var express = require("express");
var imports =  {
    InsertApplicantsData
} = require( "../controller/applicant_tracking_controller.js");

const router = express.Router()

router.post("/ats-insertApplicantsData", InsertApplicantsData);

module.exports = router;