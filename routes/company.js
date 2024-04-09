// import express from "express";
// import uploadMulter from "../utils/multerFileHandler.js";
// import {
//   createCompany,
//   readCompanyAll,
//   updateCompany,
//   deleteCompany,
//   getAllCompanies,
// } from "../controller/company_controller.js";

var express = require("express");
var imports =  {
//     createCompany,
//   readCompanyAll,
//   updateCompany,
//   deleteCompany,
  getAllCompanies,
  getAllPayItems,
} = require( "../controller/company_controller.js");

const router = express.Router();

// router.post("/company", uploadMulter.single("logo"), createCompany);
// router.get("/company/view/:id", readCompanyAll);
// router.patch("/company/edit/:id", uploadMulter.single("logo"), updateCompany);
// router.delete("/company/remove/:id", deleteCompany);

router.get("/mp-getcompanies", getAllCompanies);
router.get("/mp-getcompanypayitems", getAllPayItems);

module.exports = router;