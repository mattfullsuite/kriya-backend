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

module.exports = router;