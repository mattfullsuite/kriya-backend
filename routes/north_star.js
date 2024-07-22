var express = require("express");
const {
  InsertNorthStarGoalTeam,
} = require("../controller/north_star_controller.js");
var imports = ({
  InsertNorthStar,
  GetNorthStarOfMySuperior,
  InsertNorthStarGoal,
  GetMyDownlines,
  GetTaskOfSameLine,
  GetTasksYouAssigned,
  GetMyOwnNorthStar,
  GetMyTasks,
  GetMyTeamTasks,
  EditNorthStar,

  //MY TEAM
  GetMyTeamTasksYouAssigned,

  //Tasks To Review
  GetTasksForReview,

  //UpdateTask
  UpdateTaskStatus,

  //FinishedTasks
  GetFinishedTaskOfSameLine,
  GetMyFinishedTasks,

  //DownlineTasks
  GetDownlineTasks,

  GetApprover,
} = require("../controller/north_star_controller.js"));

const router = express.Router();

router.post("/ns-insertNorthStar", InsertNorthStar);
router.get("/ns-getMyNorthStar", GetNorthStarOfMySuperior);
router.get("/ns-getMyDownlines", GetMyDownlines);
router.post("/ns-insertNorthStarGoal", InsertNorthStarGoal);
router.get("/ns-getSameLineTasks", GetTaskOfSameLine);
router.get("/ns-getTasksYouAssigned", GetTasksYouAssigned);
router.get("/ns-getMyOwnNorthStar", GetMyOwnNorthStar);
router.get("/ns-getMyTeamTasks", GetMyTeamTasks);
router.get("/ns-getMyTasks", GetMyTasks);
router.post("/ns-editNorthStarGoal", EditNorthStar);
router.post("/ns-insertNorthStarGoalTeam", InsertNorthStarGoalTeam);
router.get("/ns-getMyTeamTasksYouAssigned", GetMyTeamTasksYouAssigned);

//Tasks For Review
router.get("/ns-getTasksForReview", GetTasksForReview);

//Update Task
router.post("/ns-updateTask", UpdateTaskStatus);

//Finished Tasks
router.get("/ns-getFinishedSameLineTasks", GetFinishedTaskOfSameLine);
router.get("/ns-getMyFinishedTasks", GetMyFinishedTasks);

//Downline Tasks
router.get("/ns-getDownlineTasks", GetDownlineTasks);

//Approver
router.get("/ns-getApproverOfUser", GetApprover);

module.exports = router;
