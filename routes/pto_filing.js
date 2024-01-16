var express = require("express");
var imports =  {
    FileLeave,
    AllApprovers,
    AllHolidays,
    AllMyPendingLeaves,
    AllMyApprovedLeaves,
    ApproveLeave,
    RejectLeave,
    ReturnTemporaryPTO,
} = require( "../controller/pto_filing_controller.js");

const router = express.Router()

router.post("/fileLeave", FileLeave);

router.get("/getAllApprovers", AllApprovers);
router.get("/holidays", AllHolidays);
router.get("/myPendingLeaves", AllMyPendingLeaves);
router.get("/myApprovedLeaves", AllMyApprovedLeaves);

router.post("/approveleave/:leave_id", ApproveLeave);
router.post("/rejectleave/:leave_id", RejectLeave);
router.post("/returnTempPTO/:leave_id", ReturnTemporaryPTO);

module.exports = router;

