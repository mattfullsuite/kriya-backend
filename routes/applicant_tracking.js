var express = require("express");
var imports =  {
    InsertApplicantsData,
    GetApplicantsFromDatabase,
    AddNewApplicant,
    ModifiedAddNewApplicant,
    GetPositionsFromCompany,
    GetPossibleReferrers,

    //Edit
    EditApplicantData,
    GetNoteDetails,
    InsertApplicantNotes
} = require( "../controller/applicant_tracking_controller.js");

const router = express.Router()

router.post("/ats-insertApplicantsData", InsertApplicantsData);
router.get("/ats-getApplicantsFromDatabase", GetApplicantsFromDatabase);
router.post("/ats-addNewApplicant", AddNewApplicant);
router.post("/ats-modifiedAddNewApplicant", ModifiedAddNewApplicant);
router.get("/ats-getPositionsFromCompany", GetPositionsFromCompany);
router.get("/ats-getPossibleReferrers", GetPossibleReferrers);
router.post("/ats-editApplicantData", EditApplicantData);

//Notes
router.post("/ats-getNoteDetails", GetNoteDetails);
router.post("/ats-insertApplicantNotes", InsertApplicantNotes);

module.exports = router;