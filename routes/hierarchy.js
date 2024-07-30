var express = require("express");
var imports =  {
    AddSuperior,
    GetEmployee,
    GetInferiorAndSuperior,
    GetOwnSuperior,
} = require( "../controller/hierarchy_controller.js");

const router = express.Router()

router.post("/addSuperior", AddSuperior);
router.get("/getInferior", GetEmployee);
router.get("/getInferiorAndSuperior", GetInferiorAndSuperior);
router.get("/getOwnSuperior", GetOwnSuperior)

module.exports = router;