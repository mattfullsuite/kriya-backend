var express = require("express");
var imports =  {
    InsertNorthStar,
    GetNorthStarOfMySuperior,
    InsertNorthStarGoal,
    GetMyDownlines,
    GetTaskOfSameLine,
    GetTasksYouAssigned,
    GetTasksForReview
} = require( "../controller/north_star_controller.js");

const router = express.Router()

router.post("/ns-insertNorthStar", InsertNorthStar);
router.get("/ns-getMyNorthStar", GetNorthStarOfMySuperior);
router.get("/ns-getMyDownlines", GetMyDownlines);
router.post("/ns-insertNorthStarGoal", InsertNorthStarGoal);
router.get("/ns-getSameLineTasks", GetTaskOfSameLine);
router.get("/ns-getTasksYouAssigned", GetTasksYouAssigned);
router.get("/ns-getTasksForReview", GetTasksForReview);

module.exports = router;