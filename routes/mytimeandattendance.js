var express = require("express");
var imports =  {
    CurrentUserPTO,
    NumberOfLeavesToday,
    NumberOfLeavesWeek,
    PaidLeavesTaken,
    UnpaidLeavesTaken,
    AllMyPendingLeaves,
    AllMyApprovedLeaves,
    AllMyDeclinedLeaves,
    YourOwnLeaves,
    MyPtoHistory,
} = require("../controller/mytimeandattendance_controller.js");

const router = express.Router()

router.get("/mtaa-getUserPTO", CurrentUserPTO);
router.get("/mtaa-numofallleavestoday", NumberOfLeavesToday);
router.get("/mtaa-numofallleavesweek", NumberOfLeavesWeek);
router.get("/mtaa-countmypaidleaves", PaidLeavesTaken);
router.get("/mtaa-countmyunpaidleaves", UnpaidLeavesTaken);
router.get("/mtaa-mypendingleaves", AllMyPendingLeaves);
router.get("/mtaa-myapprovedleaves", AllMyApprovedLeaves);
router.get("/mtaa-mydeclinedleaves", AllMyDeclinedLeaves);
router.get("/mtaa-allmyleaves", YourOwnLeaves);
router.get("/mtaa-myptohistory", MyPtoHistory);

module.exports = router;