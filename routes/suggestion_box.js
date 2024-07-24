var express = require("express");
const {
  GetRequestMessages,
  GetRequestMessageChat,
  GetRequestMessageContent,
  GetHr,
  InsertRequest,
  InsertRequestChat,
  GetComplaintMessages,
  GetComplaintMessagesContent,
  GetComplaintMessageChat,
  InsertComplaintChat,
  InsertComplaint,
} = require("../controller/suggestion_box_controller.js");

const router = express.Router();
// get methods for requests
router.get("/sb-get-request", GetRequestMessages);
router.get("/sb-get-request-conversation/:request_id", GetRequestMessageChat);
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


module.exports = router;