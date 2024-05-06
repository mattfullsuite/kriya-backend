var express = require("express");
var imports =  {
    GetMostRecentMood,
    GetMoodsForDay,
    GetMoodsForWeek,
    GetMoodsLastWeek,
    GetMoodsRecentMonth,
    InsertMoodEntry,
    GetAverageMoodForWeek,
    GetAverageMoodForLastMonth,
    GetAverageMoodForMonth,
    GetMostRecentMoodsLimited,
    GetAverageMoodForLastWeek,
    GetLowMoodForWeek,
    GetNeutralMoodForWeek,
    GetHighMoodForWeek,
    GetLowMoodForMonth,
    GetNeutralMoodForMonth,
    GetHighMoodForMonth,
    GetLowMoodForYear,
    GetNeutralMoodForYear,
    GetHighMoodForYear,
    GetAverageMoodForYear,
    GetDifferentMoodsForWeek,
    GetDifferentMoodsForMonth,
    GetDifferentMoodsForYear,
    GetMyMoods,
} = require( "../controller/mypulse_mood_controller.js");

const router = express.Router()

router.get("/mp-getMostRecentMood", GetMostRecentMood);
router.get("/mp-getMoodsForDay", GetMoodsForDay);
router.get("/mp-getMoodForWeek", GetMoodsForWeek);
router.get("/mp-getMoodLastWeek", GetMoodsLastWeek);
router.post("/mp-addMood", InsertMoodEntry);
router.get("/mp-getAverageWeekly", GetAverageMoodForWeek);
router.get("/mp-getAverageLastWeek", GetAverageMoodForLastWeek);
router.get("/mp-getAverageLastMonth", GetAverageMoodForLastMonth);
router.get("/mp-getAverageMonthly", GetAverageMoodForMonth);
router.get("/mp-getAverageYearly", GetAverageMoodForYear);
router.get("/mp-getMostRecentMoodsLimited", GetMostRecentMoodsLimited);
router.get("/mp-getLowMoodForWeek", GetLowMoodForWeek);
router.get("/mp-getNeutralMoodForWeek", GetNeutralMoodForWeek);
router.get("/mp-getHighMoodForWeek", GetHighMoodForWeek);
router.get("/mp-getLowMoodForMonth", GetLowMoodForMonth);
router.get("/mp-getNeutralMoodForMonth", GetNeutralMoodForMonth);
router.get("/mp-getHighMoodForMonth", GetHighMoodForMonth);
router.get("/mp-getLowMoodForYear", GetLowMoodForYear);
router.get("/mp-getNeutralMoodForYear", GetNeutralMoodForYear);
router.get("/mp-getHighMoodForYear", GetHighMoodForYear);
router.get("/mp-getDifferentMoodsForWeek", GetDifferentMoodsForWeek);
router.get("/mp-getDifferentMoodsForMonth", GetDifferentMoodsForMonth);
router.get("/mp-getDifferentMoodsForYear", GetDifferentMoodsForYear);
router.get("/mp-getMyMoods", GetMyMoods);

module.exports = router;