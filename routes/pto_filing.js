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
    BlockMyPendingLeaves,
    BlockMyApprovedLeaves,
    //GenerateReason
} = require( "../controller/pto_filing_controller.js");

const router = express.Router()

router.post("/fileLeave", FileLeave);

router.get("/getAllApprovers", AllApprovers);
router.get("/holidays", AllHolidays);
router.get("/myPendingLeaves", AllMyPendingLeaves);
router.get("/myApprovedLeaves", AllMyApprovedLeaves);
router.get("/blockPendingLeaves", BlockMyPendingLeaves);
router.get("/blockApprovedLeaves", BlockMyApprovedLeaves);

router.post("/approveleave/:leave_id", ApproveLeave);
router.post("/rejectleave/:leave_id", RejectLeave);
router.post("/returnTempPTO/:leave_id", ReturnTemporaryPTO);
//router.get("/generateReason", GenerateReason)

module.exports = router;

