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
  RejectDispute,
  GetRequesters,
  RequesterPastDisputes,
  GetRequesterDisputes,
  GetPendingDisputes,
  GetRecentDisputes
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


// get methods for tickets
router.get("/d-get-requesters/:dispute_type", GetRequesters);
router.get("/d-get-requester-disputes/:type/:requesterID", GetRequesterDisputes);
router.get("/d-get-requester-past-disputes/:type/:requesterID", RequesterPastDisputes);

router.get("/d-get-my-pending-disputes", GetPendingDisputes);
router.get("/d-get-recent-disputes", GetRecentDisputes);


module.exports = router;