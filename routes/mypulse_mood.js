var express = require("express");
var imports =  {
    GetMostRecentMood,
    GetMoodsForDay,
    GetMoodsForWeek,
    GetMoodsLastWeek,
    GetMoodsRecentMonth,
} = require( "../controller/mypulse_mood_controller.js");

const router = express.Router()

router.get("/mp-getMostRecentMood", GetMostRecentMood);
router.get("/mp-getMoodsForDay", GetMoodsForDay);
router.get("/mp-getMoodForWeek", GetMoodsForWeek);
router.get("/mp-getMoodLastWeek", GetMoodsLastWeek);
router.get("/mp-")

module.exports = router;