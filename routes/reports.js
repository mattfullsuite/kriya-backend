var express = require("express");
var imports =  {
    GetAllLeaves,
    GetAllPaidLeaves,
    GetAllBetweenDateLeaves,
    GetAllPaidBetweenDateLeaves,
    GetAllOvertimes,

    //Company Revamped Reports
    GetAllCompanyMasterlist,
    GetAllCompanyLeaves,
    GetAllCompanyPTOs,
    GetAllCompanyOvertime,
    GetAllCompanyCheers
} = require( "../controller/reports_controller.js");

const router = express.Router()

router.get("/retrieveAllLeaves", GetAllLeaves);
router.get("/retrieveAllOvertimes", GetAllOvertimes)
router.get("/retrieveAllPaidLeaves", GetAllPaidLeaves);
router.post("/retrieveAllBetweenLeaves", GetAllBetweenDateLeaves);
router.post("/retrieveAllPaidBetweenLeaves", GetAllPaidBetweenDateLeaves);

router.get("/r-retrieveAllCompanyMasterlist", GetAllCompanyMasterlist);
router.get("/r-retrieveAllCompanyLeaves", GetAllCompanyLeaves);
router.get("/r-retrieveAllCompanyPTOs", GetAllCompanyPTOs);
router.get("/r-retrieveAllCompanyOvertime", GetAllCompanyOvertime);
router.get("/r-retrieveAllCompanyCheers", GetAllCompanyCheers);

module.exports = router;