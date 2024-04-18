var express = require("express");
var imports =  {
    InsertAttendanceIntoDatabase,
    GetLimitedAttendance
} = require( "../controller/attendance_controller.js");

const router = express.Router()

router.post("/mtaa-insertAttendanceData", InsertAttendanceIntoDatabase);
router.get("/mtaa-getLimitedAttendanceData", GetLimitedAttendance);

module.exports = router;