var express = require("express");
const upload = require('../upload.js');
const { GetApplicants, GetPositions, GetFilterByMonth, GetFilterByQuarter, GetFilterByYear } = require("../controller/applicant_tracking_controller.js");
var imports =  {
    InsertApplicantsData,
    GetApplicantsFromDatabase,
    AddNewApplicant,
    ModifiedAddNewApplicant,
    GetPositionsFromCompany,
    GetPossibleReferrers,
    GetListOfPositions,

    //Edit
    EditApplicantData,
    GetNoteDetails,
    InsertApplicantNotes,

    //Paginated and Optimized
    GetPaginatedApplicantsFromDatabase,
    GetApplicantStatusStatistics,
    ViewApplicantData,

    //Interviews
    GetInterviews,
    GetApplicantNotesFromInterview,

    //Get Interviewees
    GetIntervieweesForApplicants,
    AddNewInterview,

    SearchApplicantList,
    ChangeStatus,
    CreateDiscussionBoxAndLockedNotes,

    RetrieveOfferTemplates,
    SendEmailToApplicant,

    //Locked Box
    InsertApplicantLockedNotes,
    GetLockedNoteDetails,
    GetApplicantLockedNotes,
    GetMentionInterviewers,

    //ATS Duplicate
    CheckDuplicate,

    //ATS Notifs
    ATSNotifs,

} = require( "../controller/applicant_tracking_controller.js");

const router = express.Router()

router.post("/ats-insertApplicantsData", InsertApplicantsData);
router.get("/ats-getApplicantsFromDatabase", GetApplicantsFromDatabase);
router.post("/ats-addNewApplicant", AddNewApplicant);
router.post("/ats-modifiedAddNewApplicant", ModifiedAddNewApplicant);
router.get("/ats-getPositionsFromCompany", GetPositionsFromCompany);
router.get("/ats-getPossibleReferrers", GetPossibleReferrers);
router.post("/ats-editApplicantData", EditApplicantData);
router.get("/ats-getJobPositions", GetListOfPositions);

//Notes
router.post("/ats-getNoteDetails", GetNoteDetails);
router.post("/ats-insertApplicantNotes", InsertApplicantNotes);
router.get("/ats-getMentions", GetMentionInterviewers)

//Optimized and Paginated
router.get("/ats-getPaginatedApplicantsFromDatabase", GetPaginatedApplicantsFromDatabase);
router.get("/ats-getApplicantStatusStatistics", GetApplicantStatusStatistics)

//View Applicant
router.get("/ats-viewApplicantData/:app_id", ViewApplicantData);

//
router.get("/ats-getInterviews/:app_id", GetInterviews);
router.get("/ats-getApplicantInterviewNotes/:app_id", GetApplicantNotesFromInterview);

//Get Interviewees
router.get("/ats-getIntervieweesForApplicants", GetIntervieweesForApplicants)
router.post("/ats-addNewInterview/:app_id", AddNewInterview);

//Search
router.get("/ats-searchApplicantsList", SearchApplicantList);
router.post("/ats-changeStatusOfApplicant", ChangeStatus)
router.post("/ats-createDiscussionBoxAndLockedNotes", CreateDiscussionBoxAndLockedNotes)

router.get("/ats-getOfferLetters", RetrieveOfferTemplates);
router.post("/ats-sendEmailLetter/:app_id", upload.single('file'), SendEmailToApplicant)

//Locked Notes
router.post("/ats-getLockedNoteDetails", GetLockedNoteDetails);
router.post("/ats-insertApplicantLockedNotes/:app_id", InsertApplicantLockedNotes);
router.get("/ats-getApplicantLockedNotes/:app_id", GetApplicantLockedNotes);

// Requisition Stats
router.get("/get-all-applicants", GetApplicants);
router.get("/get-all-positions", GetPositions);
router.get("/get-filteredData-byMonth", GetFilterByMonth);
router.get("/get-filteredData-byQuarter", GetFilterByQuarter);
router.get("/get-filteredData-byYear", GetFilterByYear);

//ATS Duplicate Check
router.get("/ats-checkDuplicate", CheckDuplicate);

//ATS Notifications
router.get("/atsNotifs", ATSNotifs)

module.exports = router;