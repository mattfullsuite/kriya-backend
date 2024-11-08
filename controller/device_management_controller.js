var db = require("../config.js");
var moment = require("moment");

function GetDevicesOfCompany(req, res) {
  const cid = req.session.user[0].company_id;
  const { category = "All"} = req.query;

  console.log("cat: ", req.query )

  let q

  const o1 = "SELECT DISTINCT * FROM company_devices AS cd LEFT JOIN device_category AS dc ON cd.company_id = dc.company_id LEFT JOIN device_accountability AS da ON da.device_id = cd.device_id LEFT JOIN emp AS e ON da.assignee_id = e.emp_num WHERE cd.company_id = ? AND cd.device_category = dc.device_category" 
  const o2 = "SELECT DISTINCT * FROM company_devices AS cd LEFT JOIN device_category AS dc ON cd.company_id = dc.company_id LEFT JOIN device_accountability AS da ON da.device_id = cd.device_id LEFT JOIN emp AS e ON da.assignee_id = e.emp_num WHERE cd.company_id = ? AND cd.device_category = ? AND cd.device_category = dc.device_category"

  q = (category === "All") 
            ? 
            q = o1
            : 
            q = o2

            console.log("Q: ", q)

  var values = (category === "All") ? [cid] : [cid, category]

  console.log("Values: ", values)
 
  db.query(q, values, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Category: ", data)
      res.json(data);
    }
  });
}

function GetMyDevices(req, res) {
  const eid = req.session.user[0].emp_num
  const cid = req.session.user[0].company_id

  const values = [cid, eid]

  const q = "SELECT DISTINCT * FROM company_devices AS cd LEFT JOIN device_category AS dc ON cd.company_id = dc.company_id LEFT JOIN device_accountability AS da ON da.device_id = cd.device_id LEFT JOIN emp AS e ON da.assignee_id = e.emp_num WHERE cd.company_id = ? AND e.emp_num = ? AND cd.device_category = dc.device_category" 

  db.query(q, values, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("My Devices: ", data)
      res.json(data);
    }
  });
}

function AddNewDevice(req, res) {
  const cid = req.session.user[0].company_id;
  const q =
    "INSERT INTO company_devices (`device_name`, `device_brand`, `device_model`, `device_serial_no`, `device_tag`, `device_description`, `device_category`, `company_id`) VALUES (?)";

  const values = [
    req.body.device_category,
    req.body.device_brand,
    req.body.device_model,
    req.body.device_serial_no,
    req.body.device_tag,
    req.body.device_description,
    req.body.device_category,
    cid,
  ];

  console.log("REQ BODY: ", req.body)

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send("error");
      console.log(err);
    } else {

      const dev_id = data.insertId
      const values2 = [req.body.assignee_name1, dev_id, req.body.assigned_date1]
      const values3 = [req.body.assignee_name2, dev_id, req.body.assigned_date2]

      res.send("success")

      if (req.body.assignee_name1) {
        
        const q2 = "INSERT INTO device_accountability (`assignee_id`, `device_id`, `assigned_date`) VALUES (?)";

        db.query(q2, [values2], (err, data2) => {
          if (err) {
            console.log(err);
            console.log("ERROR first assignee")
          } else {
            console.log("Added first assignee")
            console.log(data2)
          }
        })
      }

      if (req.body.assignee_name2) {
        
        const q2 = "INSERT INTO device_accountability (`assignee_id`, `device_id`, `assigned_date`) VALUES (?)";

        db.query(q2, [values3], (err, data3) => {
          if (err) {
            console.log(err);
            console.log("ERROR second assignee")
          } else {
            console.log("Added second assignee")
            console.log(data3)
          }
        })
      }
    }
  });
}

function GetDeviceDetails(req, res) {
  const { deviceNumber = 0} = req.query;

  let parsedDeviceNumber = deviceNumber;

  console.log(req.query);

  const q2 = `SELECT * FROM company_devices WHERE device_id = ?`;

  db.query(q2, [parsedDeviceNumber], (err, data) => {
    if (err) {
      res.json(err);
      console.log(err)
    } else {
      res.json(data);
      console.log(data);
    }
  });
}

function GetCategoryOfDevicesPerCompany(req, res) {
  const cid = req.session.user[0].company_id;
  const q = "SELECT * FROM device_category WHERE company_id = ? ORDER BY device_category";

  db.query(q, cid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function CountDevicesPerCategory(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT device_category, COUNT(device_category) AS count FROM company_devices WHERE company_id = ? GROUP BY device_category`

  db.query(q, cid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function UploadAccountabilityData(req, res) {
  const cid = req.session.user[0].company_id;

  const data = req.body;
  console.log(JSON.stringify(data));

  const q =
    "INSERT INTO company_devices (`device_name`, `device_brand`, `device_model`, `device_serial_no`, `device_tag`, `device_description`, `device_category`, `company_id`) VALUES (?)";

  data.map((d) => {
   
    var values = [
      d[0],
      d[1],
      d[2],
      d[3],
      d[4],
      d[5],
      d[6],
      cid,
    ];
    
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err);
      } else {
        //console.log("Added.");
        console.log("RESPONSE:", data);
        
        const q2 = "INSERT INTO device_accountability (`assignee_id`, `device_id`, `assigned_date`, `returned_date`) VALUES (?)";

        var values2 = [
          d[7],
          data.insertId,
          (d[8] === "" || d[8] === null) ? null : moment(d[8]).format('YYYY-MM-DD'),
          (d[9] === "" || d[9] === null) ? null : moment(d[9]).format('YYYY-MM-DD'),
        ];

        db.query(q2, [values2], (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log("2: ", data)
          }
        })
      }
    });
  });

  //console.log("Successfully added everything in database!");
}

function GetAssignedDevices(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT DISTINCT * FROM company_devices AS cd LEFT JOIN device_category AS dc ON cd.company_id = dc.company_id INNER JOIN device_accountability AS da ON da.device_id = cd.device_id INNER JOIN emp AS e ON da.assignee_id = e.emp_num WHERE cd.company_id = ? AND cd.device_category = dc.device_category`

  db.query(q, [cid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("2: ", data)
      res.send(data)
    }
  })
}

function GetUnassignedDevices(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT DISTINCT * FROM company_devices AS cd LEFT JOIN device_category AS dc ON cd.company_id = dc.company_id INNER JOIN device_accountability AS da ON da.device_id = cd.device_id LEFT JOIN emp AS e ON da.assignee_id = e.emp_num WHERE cd.company_id = ? AND e.emp_num IS NULL AND cd.device_category = dc.device_category`

  db.query(q, [cid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.send(data);
    }
  })
}

function GetDeviceCategoryPerCompany(req, res) {
  const cid = req.session.user[0].company_id;
  const q = `SELECT DISTINCT * FROM device_category WHERE company_id = ?`

  db.query(q, [cid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send(data)
    }
  })
}

function AddNewDeviceCategory(req, res){
  console.log("CATEGORY, ", req.body);
  const cid = req.session.user[0].company_id;

  const values = [
    req.body.device_category,
    req.body.device_image,
    cid
  ];

  const q =
    "INSERT INTO `device_category` (`device_category`, `device_image`, `company_id`) VALUES (?)";

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send("err");
      console.log(err)
    }
    else { 
      res.send("success");
      console.log("DATA: ", data)
    }
  });
}

module.exports = {
  GetDevicesOfCompany,
  AddNewDevice,
  GetMyDevices,

  //Retrieve Device Details Using Device Number
  GetDeviceDetails,
  GetCategoryOfDevicesPerCompany,
  CountDevicesPerCategory,
  UploadAccountabilityData,

  //Count
  GetAssignedDevices,
  GetUnassignedDevices,

  GetDeviceCategoryPerCompany,
  AddNewDeviceCategory,
};
