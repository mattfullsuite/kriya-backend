var express = require("express");
const router = express.Router();

var {
  CreateCompanyCompensation,
  GetCompanyCompensation,
  UpdateCompanyCompensation,
  DeleteCompanyCompensation,
} = require("../../controller/company/company_compensation_controller");

router.post("/cc-CreateCompanyCompensation", CreateCompanyCompensation);
router.get("/cc-GetCompanyCompensation", GetCompanyCompensation);
router.patch("/cc-UpdateCompanyCompensation", UpdateCompanyCompensation);
router.delete("/cc-DeleteCompanyCompensation", DeleteCompanyCompensation);

module.exports = router;
