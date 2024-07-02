var express = require("express");
var imports =  {
    InsertApplicantsData,
    GetApplicantsFromDatabase,
    AddNewApplicant,
    ModifiedAddNewApplicant,
    GetPositionsFromCompany
} = require( "../controller/applicant_tracking_controller.js");

const router = express.Router()

router.post("/ats-insertApplicantsData", InsertApplicantsData);
router.get("/ats-getApplicantsFromDatabase", GetApplicantsFromDatabase);
router.post("/ats-addNewApplicant", AddNewApplicant);
router.post("/ats-modifiedAddNewApplicant", ModifiedAddNewApplicant);
router.get("/ats-getPositionsFromCompany", GetPositionsFromCompany);

module.exports = router;