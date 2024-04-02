var express = require("express");
var imports =  {
    GetAllLeaves,
    GetAllPaidLeaves,
    GetAllBetweenDateLeaves,
    GetAllPaidBetweenDateLeaves,
} = require( "../controller/reports_controller.js");

const router = express.Router()

router.get("/retrieveAllLeaves", GetAllLeaves);
router.get("/retrieveAllPaidLeaves", GetAllPaidLeaves);
router.post("/retrieveAllBetweenLeaves", GetAllBetweenDateLeaves);
router.post("/retrieveAllPaidBetweenLeaves", GetAllPaidBetweenDateLeaves);

module.exports = router;