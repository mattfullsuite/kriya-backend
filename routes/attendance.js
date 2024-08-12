var express = require("express");
var imports =  {
    InsertAttendanceIntoDatabase,
    GetLimitedAttendance,
    GetAttendance,
    GetMyLeaves,
    GetEmployeesWithStatusForAttendance,

    GetAttendanceOfOne,
    GetOneStatusForAttendance,
    ChangeAttendanceOfOne,

    GetMyOwnIncompleteData,
    GetMyOwnLeaveOvertimeData,
    GetMyStatusForAttendance,
    GetLeavesOfOne,
    AddNewDate,
    DisableDatesOfOne,

    //Pagination
    GetPaginatedEmployeesWithStatusForAttendance,
    GetPaginatedAttendanceOfOne
} = require( "../controller/attendance_controller.js");

const router = express.Router()

router.post("/mtaa-insertAttendanceData", InsertAttendanceIntoDatabase);
router.get("/mtaa-getLimitedAttendanceData", GetLimitedAttendance);
router.get("/mtaa-getAttendanceData", GetAttendance);
router.get("/mtaa-getLeaveData", GetMyLeaves)
router.get("/mtaa-getAttendanceList", GetEmployeesWithStatusForAttendance);

router.get("/mtaa-getPaginatedAttendanceList", GetPaginatedEmployeesWithStatusForAttendance);
router.get("/mtaa-getPaginatedAttendanceOfOne", GetPaginatedAttendanceOfOne)

router.post("/mtaa-getStatusOfOne", GetOneStatusForAttendance);
router.post("/mtaa-getAttendanceOfOne", GetAttendanceOfOne);
router.post("/mtaa-getDisabledDates", DisableDatesOfOne)
router.post("/mtaa-changeAttendanceOfOne", ChangeAttendanceOfOne);
router.post("/mtaa-getLeavesOfOne", GetLeavesOfOne);
//GetOneStatusForAttendance

router.get("/mtaa-getMyIncompleteData", GetMyOwnIncompleteData)
router.get("/mtaa-getMyLeaveOT", GetMyOwnLeaveOvertimeData)
router.get("/mtaa-getMyStatusForAttendance", GetMyStatusForAttendance)
router.post("/mtaa-addNewDate", AddNewDate);

module.exports = router;