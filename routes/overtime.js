var express = require("express");
var imports =  {
    FileOvertime,
    GetAllPendingOvertimes,
    ApproveOvertime,
    RejectOvertime
} = require( "../controller/overtime_controller.js");

const router = express.Router()

router.post("/fileOvertime", FileOvertime);
router.get("/o-getPendingOvertime",  GetAllPendingOvertimes)
router.post("/o-approveOvertime/:overtime_id", ApproveOvertime);
router.post("/o-rejectOvertime/:overtime_id", RejectOvertime);

//ApproveOvertime


module.exports = router;