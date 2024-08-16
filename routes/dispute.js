var express = require("express");
const {
  createDispute,
  viewDisputes,
  viewUserDisputes,
  updateUserDispute,

  //Attendance Dispute
  CreateAttendanceDispute,
  AllMyAttendanceDisputes,
  GetHRAttendanceDisputes,
  GetHRPendingAttendanceDisputes,

  //Actions
  ApproveDispute,
  RejectDispute
} = require("../controller/dispute_controller");

const router = express.Router();

router.post("/d-createDispute", createDispute);
router.get("/d-getAllDispute", viewDisputes);
router.get("/d-getUserdispute", viewUserDisputes);
router.patch("/d-updateUserDispute", updateUserDispute);

//Attendance
router.post("/d-createAttendanceDispute", CreateAttendanceDispute);
router.get("/d-getAllMyAttendanceDisputes", AllMyAttendanceDisputes)
router.get("/d-getAllAttendanceDisputes", GetHRAttendanceDisputes)
router.get("/d-getAllPendingDisputes", GetHRPendingAttendanceDisputes)

//Actions
router.post("/d-approveDispute/:dispute_id", ApproveDispute);
router.post("/d-rejectDispute/:dispute_id", RejectDispute);

module.exports = router;
