var express = require("express");
var imports =  {
    UpcomingBirthdays,
    UpcomingAnniversaries,
    CurrentUserPTO,
    NumberOfLeavesToday,
    NumberOfLeavesWeek,
    NumberOfEmployees,
    NumberOfRegularEmployees,
    NumberOfProbationaryEmployees,
    NumberOfPartTimeEmployees,
    YourOwnLeaves,
    CheckIfOnlineUserIsManager,
    DisplayAllLeaves,
    DisplayAllPendingLeaves,
    DisplayAllApprovedLeaves,
    DisplayAllDeclinedLeaves,
    GetApproverDetailsOnModal,
} = require( "../controller/dashboard_widgets_controller.js");

const router = express.Router()

router.get("/getupcomingbdays", UpcomingBirthdays);
router.get("/getupcominganniversaries", UpcomingAnniversaries);
router.get("/getUserPTO", CurrentUserPTO);
router.get("/numofallleavestoday", NumberOfLeavesToday);
router.get("/numofallleavesweek", NumberOfLeavesWeek);
router.get("/getCurrentEmployees", NumberOfEmployees);
router.get("/getRegularEmployees", NumberOfRegularEmployees);
router.get("/getProbationaryEmployees", NumberOfProbationaryEmployees);
router.get("/getPartTimeEmployees", NumberOfPartTimeEmployees);
router.get("/showallmyleaves", YourOwnLeaves);
router.get("/checkIfManager", CheckIfOnlineUserIsManager);
router.get("/showallleaves", DisplayAllLeaves)
router.get("/showpendingleaves", DisplayAllPendingLeaves);
router.get("/showapprovedleaves", DisplayAllApprovedLeaves);
router.get("/showrejectedleaves", DisplayAllDeclinedLeaves);
router.get("/getApproverDetails", GetApproverDetailsOnModal);

module.exports = router;