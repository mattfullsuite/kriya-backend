var express = require("express");
var imports =  {
    GetDepartmentLeaves,
    GetDepartmentLeavesToday,
    NumberOfLeavesForPastFiveMonths,
    NumberOfLeavesForPastFourMonths,
    NumberOfLeavesForPastThreeMonths,
    NumberOfLeavesForPastTwoMonths,
    NumberOfLeavesForPastMonth,
    NumberOfLeavesForCurrentMonth,
    NumberOfLeavesForCurrentWeek,
    NumberOfLeavesForPastWeek,
    NumberOfLeavesForPastTwoWeeks,
    NumberOfLeavesForPastThreeWeeks,
    ShowAllDepartmentLeavesExceptPending,
    ShowAllDepartmentLeavesOfTeam,
} = require("../controller/myteam_controller.js");

const router = express.Router()

router.get("/mt-getDepartmentLeaves", GetDepartmentLeaves);

//Monthly
router.get("/mt-getDepartmentLeavesToday", GetDepartmentLeavesToday);
router.get("/mt-getDepartmentLeavesPastFiveMonths", NumberOfLeavesForPastFiveMonths);
router.get("/mt-getDepartmentLeavesPastFourMonths", NumberOfLeavesForPastFourMonths);
router.get("/mt-getDepartmentLeavesPastThreeMonths", NumberOfLeavesForPastThreeMonths);
router.get("/mt-getDepartmentLeavesPastTwoMonths", NumberOfLeavesForPastTwoMonths);
router.get("/mt-getDepartmentLeavesPastMonth", NumberOfLeavesForPastMonth);
router.get("/mt-getDepartmentLeavesCurrent", NumberOfLeavesForCurrentMonth);

//Weekly
router.get("/mt-getDepartmentLeavesCurrentWeek", NumberOfLeavesForCurrentWeek);
router.get("/mt-getDepartmentLeavesPastWeek", NumberOfLeavesForPastWeek);
router.get("/mt-getDepartmentLeavesPastTwoWeeks", NumberOfLeavesForPastTwoWeeks);
router.get("/mt-getDepartmentLeavesPastThreeWeeks", NumberOfLeavesForPastThreeWeeks);

//DepartmentLeaves
router.get("/mt-getAllDepartmentLeaves", ShowAllDepartmentLeavesExceptPending);
router.get("/mt-getAllDepartmentLeavesOfTeam", ShowAllDepartmentLeavesOfTeam);

module.exports = router;