var express = require("express");
var imports =  {
    OverallTeamMood,
    TeamMoodRateStatistics,
} = require( "../controller/engagement_index_controller.js");

const router = express.Router()

router.get("/ei-getOverallTeamMood", OverallTeamMood);
router.get("/ei-getTeamMoodStatistics", TeamMoodRateStatistics);

module.exports = router;