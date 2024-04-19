var express = require("express");
var imports =  {
    GetMostRecentMood,
    GetMoodsForDay,
    GetMoodsForWeek,
    GetMoodsLastWeek,
    GetMoodsRecentMonth,
    InsertMoodEntry,
    GetAverageMoodForWeek,
    GetAverageMoodForMonth,
    GetMostRecentMoodsLimited,
    GetAverageMoodForLastWeek
} = require( "../controller/mypulse_mood_controller.js");

const router = express.Router()

router.get("/mp-getMostRecentMood", GetMostRecentMood);
router.get("/mp-getMoodsForDay", GetMoodsForDay);
router.get("/mp-getMoodForWeek", GetMoodsForWeek);
router.get("/mp-getMoodLastWeek", GetMoodsLastWeek);
router.post("/mp-addMood", InsertMoodEntry);
router.get("/mp-getAverageWeekly", GetAverageMoodForWeek);
router.get("/mp-getAverageLastWeek", GetAverageMoodForLastWeek);
router.get("/mp-getAverageMonthly", GetAverageMoodForMonth);
router.get("/mp-getMostRecentMoodsLimited", GetMostRecentMoodsLimited);


module.exports = router;