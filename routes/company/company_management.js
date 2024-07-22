var express = require("express");
var uploadMulter = require("../handlers/utilities/multerFileHandler.js");
const {
  UpdateCompany,
} = require("../../controller/company/company_management_controller.js");

var {
  CreateCompany,
  UpdateCompany,
} = require("../../controller/company/company_management_controller.js");

const router = express.Router();

router.post(
  "/cm-CreateCompany",
  uploadMulter.single("company_logo"),
  CreateCompany
);
router.patch(
  "/cm-UpdateCompany",
  uploadMulter.single("company_logo"),
  UpdateCompany
);
