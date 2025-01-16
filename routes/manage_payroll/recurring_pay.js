var express = require("express");
const router = express.Router();
const {
  CreateRecurrringPay,
  GetAllRecurrringPay,
  GetEmployeeRecurringPay,
  UpdateRecurringPay,
  GetActiveEmployeesRP,
  GetRecurringPayItems,
  RegularPayrollGetAllRecurrringPay,
} = require("../../controller/manage_payroll/recurring_pay_controller");

router.get("/rp-GetAllRecurringPay", GetAllRecurrringPay);
router.get("/rp-GetEmployeeRecurrringPay/:empID", GetEmployeeRecurringPay);
router.get("/rp-GetActiveEmployeesRP", GetActiveEmployeesRP);
router.post("/rp-CreateRecurrringPay", CreateRecurrringPay);
router.patch("/rp-UpdateRecurringPay", UpdateRecurringPay);
router.get("/rp-GetRecurringPayItems", GetRecurringPayItems);
router.get(
  "/rp-RegularPayrollGetAllRecurrringPay",
  RegularPayrollGetAllRecurrringPay
);

module.exports = router;
