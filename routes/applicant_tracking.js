var express = require("express");
var imports =  {
    InsertApplicantsData,
    GetApplicantsFromDatabase,
    AddNewApplicant,
} = require( "../controller/applicant_tracking_controller.js");

const router = express.Router()

router.post("/ats-insertApplicantsData", InsertApplicantsData);
router.get("/ats-getApplicantsFromDatabase", GetApplicantsFromDatabase);
router.post("/ats-addNewApplicant", AddNewApplicant);

module.exports = router;