var express = require("express");
const {
  GetRequestMessages,
  GetRequestChat,
  GetRequestMessageContent,
  GetHr,
  InsertRequest,
  InsertRequestChat,
  GetComplaintMessages,
  GetComplaintMessagesContent,
  GetComplaintMessageChat,
  InsertComplaintChat,
  InsertComplaint,
  GetRequestTickets,
  GetRequestTicketContent,
  GetComplaintTickets,
  GetComplaintTicketContent,
  UpdateComplaintStatus,
  UpdateRequestStatus,
  InsertNewSuggestionBox,
  GetSuggestionBox,
  GetSuggestionBoxInfo,
  GetSuggestionBoxConversation,
  InsertNewSuggestionBoxConversation,
  GetEmployeeInitiatedInfo,
  GetEmployeeInitiated,
  UpdateSuggestionBoxStatus,
  InsertNewSuggestionBoxSeenStatus,
  GetTicketsCount,
  UpdateSuggestionBoxSeenStatus,
  GetSuggestionBoxCount,
} = require("../controller/suggestion_box_controller.js");

const router = express.Router();
// get methods for requests
router.get("/sb-get-request", GetRequestMessages);
router.get("/sb-get-request-conversation/:request_id", GetRequestChat);
router.get("/sb-get-request-content/:request_id", GetRequestMessageContent);

// post methods for requests
router.post("/sb-insert-request", InsertRequest);
router.post("/sb-insert-request-chat", InsertRequestChat);

// get methods for complaints
router.get("/sb-get-complaint", GetComplaintMessages);
router.get("/sb-get-complaint-content/:complaint_id", GetComplaintMessagesContent);
router.get("/sb-get-complaint-conversation/:complaint_id", GetComplaintMessageChat);

// post methods for complaints
router.post("/sb-insert-complaint", InsertComplaint);
router.post("/sb-insert-complaint-chat", InsertComplaintChat);

// get methods for utilities
router.get("/sb-get-hr", GetHr);

//get methods for hr tickets
router.get("/sb-get-request-tickets", GetRequestTickets);
router.get("/sb-get-request-ticket-content/:request_id", GetRequestTicketContent);
router.get("/sb-get-complaint-tickets", GetComplaintTickets);
router.get("/sb-get-complaint-ticket-content/:complaint_id", GetComplaintTicketContent);

// post methods for hr tickets
router.post("/sb-update-complaint-status", UpdateComplaintStatus);
router.post("/sb-update-request-status", UpdateRequestStatus);

router.patch("/sb-update-conversation-seen-status", UpdateSuggestionBoxSeenStatus);








// post methods for employee services center - suggestion box
router.post("/sb-insert-new-suggestion-box", InsertNewSuggestionBox);
router.post("/sb-insert-new-suggestion-box-conversation", InsertNewSuggestionBoxConversation, InsertNewSuggestionBoxSeenStatus);


// get methods for employee services center - suggestion box
router.get("/sb-get-suggestion-box", GetSuggestionBox);
router.get("/sb-get-suggestion-box-info/:sbID", GetSuggestionBoxInfo);
router.get("/sb-get-suggestion-box-conversation/:sbID", GetSuggestionBoxConversation);
router.get("/sb-get-suggestion-box-count", GetSuggestionBoxCount);

// get methods for hr tickets
router.get("/sb-get-employee-initiated", GetEmployeeInitiated);

router.get("/sb-get-employee-initiated-info/:sbID", GetEmployeeInitiatedInfo);

router.get("/sb-get-ticket-count", GetTicketsCount);

// post methods for hr tickets
router.post("/sb-update-suggestion-box-status", UpdateSuggestionBoxStatus);

router.patch("/sb-update-conversation-seen-status", UpdateSuggestionBoxSeenStatus);


module.exports = router;