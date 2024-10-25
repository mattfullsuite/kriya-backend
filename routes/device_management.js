var express = require("express");
var imports =  {
    GetDevicesOfCompany,
    AddNewDevice,
    GetDeviceDetails,
    GetCategoryOfDevicesPerCompany,
    CountDevicesPerCategory,
    UploadAccountabilityData,
    GetMyDevices,

    //COunt
    GetAssignedDevices,
    GetUnassignedDevices
} = require( "../controller/device_management_controller.js");

const router = express.Router()

router.get("/dm-getDevicesOfCompany", GetDevicesOfCompany);
router.get("/dm-getMyDevices", GetMyDevices);
router.post("/dm-addNewDevice", AddNewDevice);
router.get("/dm-retrieveDeviceDetails", GetDeviceDetails);
router.get("/dm-getCategoryOfDevices", GetCategoryOfDevicesPerCompany)
router.get("/dm-countDevicesPerCategory", CountDevicesPerCategory)
router.post("/dm-uploadAccountabilityData", UploadAccountabilityData)

router.get("/dm-getAssignedDevices", GetAssignedDevices);
router.get("/dm-getUnassignedDevices", GetUnassignedDevices);

module.exports = router;