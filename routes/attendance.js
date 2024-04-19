var express = require("express");
var imports =  {
    InsertAttendanceIntoDatabase,
    GetLimitedAttendance,
    GetAttendance,
    GetMyLeaves,
} = require( "../controller/attendance_controller.js");

const router = express.Router()

router.post("/mtaa-insertAttendanceData", InsertAttendanceIntoDatabase);
router.get("/mtaa-getLimitedAttendanceData", GetLimitedAttendance);
router.get("/mtaa-getAttendanceData", GetAttendance);
router.get("/mtaa-getLeaveData", GetMyLeaves)

module.exports = router;