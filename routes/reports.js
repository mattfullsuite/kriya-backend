var express = require("express");
var imports =  {
    GetAllLeaves,
    GetAllPaidLeaves,
    GetAllBetweenDateLeaves,
    GetAllPaidBetweenDateLeaves,
    GetAllOvertimes
} = require( "../controller/reports_controller.js");

const router = express.Router()

router.get("/retrieveAllLeaves", GetAllLeaves);
router.get("/retrieveAllOvertimes", GetAllOvertimes)
router.get("/retrieveAllPaidLeaves", GetAllPaidLeaves);
router.post("/retrieveAllBetweenLeaves", GetAllBetweenDateLeaves);
router.post("/retrieveAllPaidBetweenLeaves", GetAllPaidBetweenDateLeaves);

module.exports = router;