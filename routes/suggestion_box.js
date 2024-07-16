var express = require("express");
const {
  GetRequestMessages,
  GetRequestMessageChat,
  GetRequestMessageContent,
  GetHr,
  InsertRequest,
  InsertRequestChat,
} = require("../controller/suggestion_box_controller.js");

const router = express.Router();

router.get("/sb-get-request", GetRequestMessages);
router.get("/sb-get-request-conversation/:request_id/:emp_id", GetRequestMessageChat);
router.get("/sb-get-request-content/:request_id", GetRequestMessageContent);
router.get("/sb-get-hr", GetHr);

router.post("/sb-insert-request", InsertRequest);
router.post("/sb-insert-request-chat", InsertRequestChat);

module.exports = router;