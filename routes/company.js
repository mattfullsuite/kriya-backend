var express = require("express");
var imports = ({
  //     createCompany,
  //   readCompanyAll,
  //   updateCompany,
  //   deleteCompany,
  getAllCompanies,
  getCompanyInfo,
  getAllPayItems,
} = require("../controller/company_controller.js"));

const router = express.Router();

// router.post("/company", uploadMulter.single("logo"), createCompany);
// router.get("/company/view/:id", readCompanyAll);
// router.patch("/company/edit/:id", uploadMulter.single("logo"), updateCompany);
// router.delete("/company/remove/:id", deleteCompany);

router.get("/mp-getCompanies", getAllCompanies);
router.get("/mp-getCompany", getCompanyInfo);
router.get("/mp-getCompanyPayItems", getAllPayItems);
module.exports = router;
