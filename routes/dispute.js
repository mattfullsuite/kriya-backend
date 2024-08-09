var express = require("express");
const {
  createDispute,
  viewDisputes,
  viewUserDisputes,
  updateUserDispute,

  //Attendance Dispute
  CreateAttendanceDispute,
  AllMyAttendanceDisputes
} = require("../controller/dispute_controller");

const router = express.Router();

router.post("/d-createDispute", createDispute);
router.get("/d-getAllDispute", viewDisputes);
router.get("/d-getUserdispute", viewUserDisputes);
router.patch("/d-updateUserDispute", updateUserDispute);

//Attendance
router.post("/d-createAttendanceDispute", CreateAttendanceDispute);
router.get("/d-getAllMyAttendanceDisputes", AllMyAttendanceDisputes)

module.exports = router;
