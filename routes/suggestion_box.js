var express = require("express");
const {
  GetRequestMessages,
  GetRequestMessageChat,
  GetRequestMessageContent,
} = require("../controller/suggestion_box_controller.js");

const router = express.Router();

router.get("/sb-get-request", GetRequestMessages);
router.get("/sb-get-request-conversation/:request_id/:emp_id", GetRequestMessageChat);
router.get("/sb-get-request-content/:request_id", GetRequestMessageContent);

module.exports = router;