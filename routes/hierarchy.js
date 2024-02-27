var express = require("express");
var imports =  {
    AddSuperior,
    GetEmployee,
    GetInferiorAndSuperior,
    GetOwnSuperior,
    EscalateLeaves,
} = require( "../controller/hierarchy_controller.js");

const router = express.Router()

router.post("/addSuperior", AddSuperior);
router.get("/getInferior", GetEmployee);
router.get("/getInferiorAndSuperior", GetInferiorAndSuperior);
router.get("/getOwnSuperior", GetOwnSuperior)
router.post("/escalateleave/:leave_id", EscalateLeaves)

module.exports = router;