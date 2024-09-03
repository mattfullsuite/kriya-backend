var express = require("express");
const upload = require('../upload.js');
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
   CreateDiscussionBox,

   RetrieveOfferTemplates,
   SendEmailToApplicant
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
router.post("/ats-createDiscussionBox", CreateDiscussionBox)

router.get("/ats-getOfferLetters", RetrieveOfferTemplates);
router.post("/ats-sendEmailLetter/:app_id", upload.single('file'), SendEmailToApplicant)

module.exports = router;