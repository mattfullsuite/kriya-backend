var express = require("express");
//var mysql = require( "mysql")
var cors = require("cors");
var isEmpty = require("lodash.isempty");
//var dotenv = require("dotenv")
var cookieParser = require("cookie-parser");
var session = require("express-session");
var bodyParser = require("body-parser");
var cron = require("node-cron");
const nodemailer = require("nodemailer");
var db = require("./config.js");
var moment = require("moment");
const path = require("path");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { createServer } = require("http");

const { Server } = require("socket.io");

// var imports =  {
//   OpenAI,
//   Configuration,
// } = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.API_KEY // This is also the default, can be omitted
// });

// async function tryai() {
//   const completion = await openai.completions.create({
//     model: "gpt-3.5-turbo",
//     prompt: "Denmark loves Marvin",
//     max_tokens: 30,
//   });
//   console.log(completion.choices[0].text);
// }

// tryai();

var authentication = require("./routes/authentication.js");
var dashboardwidgets = require("./routes/dashboard_widgets.js");
var ptofiling = require("./routes/pto_filing.js");
var employeeslist = require("./routes/employees_list.js");
var requests = require("./routes/requests.js");
var announcements = require("./routes/announcements.js");
var preferences = require("./routes/preferences.js");
var directory = require("./routes/directory.js");
var administrator = require("./routes/administrator.js");
var hierarchy = require("./routes/hierarchy.js");
var superadmindashboard = require("./routes/superadmin_dashboard.js");
var admindashboard = require("./routes/admin_dashboard.js");
var reports = require("./routes/reports.js");
var module_mytimeandattendance = require("./routes/mytimeandattendance.js");
var module_mypayroll_payslip = require("./routes/manage_payroll/payslip.js");
var module_pay_items = require("./routes/manage_payroll/pay_item.js");
var module_myteam = require("./routes/myteam.js");
var module_mypulse_mood = require("./routes/mypulse_mood.js");
var module_myattendance = require("./routes/attendance.js");
var module_mypulse_survey = require("./routes/pulse_survey.js");
var module_overtime = require("./routes/overtime.js");
var module_cheer_a_peer = require("./routes/cheer_a_peer.js");
var module_company_pulse = require("./routes/company_pulse.js");
var module_applicant_tracking = require("./routes/applicant_tracking.js");
var module_employee_profile = require("./routes/employee_profile.js");
var module_engagement_index = require("./routes/engagement_index.js");
var module_north_star = require("./routes/north_star.js");
var module_task_notes = require("./routes/task_notes.js");
var dispute = require("./routes/dispute.js");
var suggestion_box = require("./routes/suggestion_box.js");
var device_management = require("./routes/device_management.js");

//memo generation
var memo_generation = require("./routes/memo_generation.js");

// company
var company_configuration = require("./routes/company/company_configuration.js");
var company_management = require("./routes/company/company_management.js");
var company_division = require("./routes/company/company_division.js");
var company_department = require("./routes/company/company_departments.js");

// employee
var employee_contributions = require("./routes/employee/employee_contribution.js");
var employee_salaries = require("./routes/employee/employee_salary.js");

var Slack = require("@slack/bolt");
var dotenv = require("dotenv");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//

var recurring_pay = require("./routes/manage_payroll/recurring_pay.js");

///ep-getDataOfLoggedInUser

//var ai = require("./routes/ai_generation.js")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "https://www.tseksuite.com/uploads");
    //cb(null, __dirname + "/uploads")
  },

  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

//dotenv.config({ path: './protected.env' })

const app = express();

/**const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
})**/

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL connected...");
  }
});

app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const server = createServer(app);

//"https://geolocation-db.com/"

app.use(
  cors({
    origin: [process.env.ORIGIN_URL, "https://app.kriyahr.com"],
    methods: ["GET", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  session({
    key: "userId",
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    proxy: true,
    name: "HRISUserCookie",
    cookie: {
      secure: process.env.JAWSDB_URL ? true : false,
      httpOnly: process.env.JAWSDB_URL ? false : true,
      secure: process.env.JAWSDB_URL ? true : false,
      httpOnly: process.env.JAWSDB_URL ? false : true,
      expires: 60 * 60 * 24 * 1000,
      sameSite: process.env.JAWSDB_URL ? "none" : null,
      sameSite: process.env.JAWSDB_URL ? "none" : null,
    },
  })
);

app.use(function (req, res, next) {
  res.set("credentials", "include");
  next();
});

// ------- socket.io ------- //
const io = new Server(server, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  pingTimeout: 60000,  // 60 seconds
  pingInterval: 25000, // 25 seconds - time between pings
  cors: {
    origin: [process.env.ORIGIN_URL, "https://app.kriyahr.com"],
    methods: ["GET", "PATCH", "POST", "DELETE", "OPTIONS"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user is connected: " + socket.id);

  socket.on("joinRoom", (joinData) => {
    if (socket.rooms.has(joinData)) {
      console.log("Socket is already in the room");
      console.log("Rooms:");
      console.log(socket.rooms);
    } else {
      console.log("Room: " + joinData);
      socket.join(joinData);
      console.log("Socket joined the room");
      console.log("Rooms:");
      console.log(socket.rooms);
    }
  });

  socket.on("leaveRoom", (leaveData) => {
    socket.leave(leaveData);
  });

  socket.on("sendHrRequestMessage", (sendHrRequestData) => {
    socket
      .to(sendHrRequestData.request_id)
      .emit("receiveHrRequestMessage", sendHrRequestData);
  });

  socket.on("sendRequesterMessage", (sendRequesterData) => {
    socket
      .to(sendRequesterData.request_id)
      .emit("receiveRequesterMessage", sendRequesterData);
  });

  socket.on("sendHrComplaintMesssage", (sendHrComplaintData) => {
    socket
      .to(sendHrComplaintData.complaint_id)
      .emit("receiveHrComplaintMessage", sendHrComplaintData);
  });

  socket.on("sendComplainantMessage", (sendHrComplainantData) => {
    socket
      .to(sendHrComplainantData.complaint_id)
      .emit("receiveComplainantMessage", sendHrComplainantData);
  });

  socket.on("closeComplaint", (closeComplaintData) => {
    socket
      .to(closeComplaintData.complaintID)
      .emit("receiveCloseComplaint", closeComplaintData.is_resolved);
  });

  socket.on("closeRequest", (closeRequestData) => {
    socket
      .to(closeRequestData.requestID)
      .emit("receiveCloseRequest", closeRequestData.is_resolved);
  });

  socket.on("sendHRMessage", (sendHrData) => {
    socket.to(sendHrData.sb_id).emit("receiveHrData", sendHrData);

    if (sendHrData.receiver_id !== null) {
      socket.to(`tickets-${sendHrData.receiver_id}`).emit("addTicketCount", {
        count: 1,
        sb_id: sendHrData.sb_id,
        latest_chat: sendHrData.sb_chat,
        latest_chat_time: sendHrData.sb_timestamp,
      });
    } else {
      socket.to(`tickets-all`).emit("addTicketCount", {
        count: 1,
        sb_id: sendHrData.sb_id,
        latest_chat: sendHrData.sb_chat,
        latest_chat_time: sendHrData.sb_timestamp,
      });
    }
  });

  socket.on("sendBoth", (sendBothData) => {
    socket.to(sendBothData.sb_id).emit("receiveBothData", sendBothData);
    console.log(sendBothData.hr_id);
    console.log(sendBothData.creator_id);

    socket.to(`suggestionBox-${sendBothData.creator_id}`).emit("addSuggestionBoxCount", {
      count: 1,
      sb_id: sendBothData.sb_id,
      latest_chat: sendBothData.sb_chat,
      latest_chat_time: sendBothData.sb_timestamp,
    })
  });

  socket.on("sendClose", (sendCloseData) => {
    socket.to(sendCloseData.sb_id).emit("receiveClose", sendCloseData);
  });

  socket.on("newSuggestionBox", (newSuggestionBoxData) => {
    if (newSuggestionBoxData.hr_id === null) {
      socket
        .to("newSuggestionBoxAll")
        .emit("receiveNewAll", newSuggestionBoxData);
      socket
        .to(`tickets-all`)
        .emit("addTicketCount", { count: 1, newMessage: true });
      io.to(`suggestionBox-${newSuggestionBoxData.creator_id}`).emit(
        "addNewSuggestion",
        newSuggestionBoxData
      );
    } else {
      socket
        .to(`newSuggestionBox-${newSuggestionBoxData.hr_id}`)
        .emit("receiveNewOnlyMe", newSuggestionBoxData);
      socket
        .to(`tickets-${newSuggestionBoxData.hr_id}`)
        .emit("addTicketCount", { count: 1, newMessage: true });
      io.to(`suggestionBox-${newSuggestionBoxData.creator_id}`).emit(
        "addNewSuggestion",
        newSuggestionBoxData
      );
    }
  });

  socket.on("newEmployeeTickets", (newEmployeeTicketsData) => {
    io.to(`employeeTicket-${newEmployeeTicketsData.requester_id}`).emit(
      "newRequesterTicket",
      newEmployeeTicketsData
    );
  });

  socket.on("minusTicketCount", (minusTicketCountData) => {
    console.log("ticket count: " + minusTicketCountData.count);
    io.to(`tickets-${minusTicketCountData.hr_id}`).emit(
      "minusTicketCount",
      minusTicketCountData.count
    );
  });

  socket.on("minusSuggestionBoxCount", (minusSbCountData) => {
    console.log("SB count: " + minusSbCountData.count);
    io.to(`suggestionBox-${minusSbCountData.creator_id}`).emit("minusSuggestionBoxCount", minusSbCountData.count);
  });

  socket.on('disconnect', () => {
    delete socket.id;
  
  });
});
// ------- end of socket.io ------- //

server.listen(process.env.PORT || 6197, () => {
  console.log("Connected to backend mysql database!");
});

// -------------------- CLEAN CODES --------------------------//

// -------------------- GENERAL METHODS --------------------------//

app.use(authentication);

//Dashboard
app.use(dashboardwidgets);
app.use(ptofiling);
app.use(employeeslist);
app.use(requests);
app.use(announcements);
app.use(preferences);
app.use(directory);

app.use(administrator);
app.use(hierarchy);
app.use(superadmindashboard);
app.use(admindashboard);
app.use(reports);

//modules
app.use(module_mytimeandattendance);
app.use(module_mypayroll_payslip);
app.use(module_pay_items);
app.use(module_myteam);
app.use(module_mypulse_mood);
app.use(module_myattendance);
app.use(module_mypulse_survey);
app.use(module_overtime);
app.use(module_cheer_a_peer);
app.use(module_company_pulse);
app.use(module_applicant_tracking);
app.use(module_employee_profile);
app.use(module_engagement_index);
app.use(module_north_star);
app.use(module_task_notes);

//dispute
app.use(dispute);

// suggestion box
app.use(suggestion_box);

//contribution
app.use(employee_contributions);
//salary
app.use(employee_salaries);

//company
app.use(company_management);
app.use(company_configuration);
app.use(company_division);
app.use(company_department);

//device management
app.use(device_management);
app.use(memo_generation);

app.use(recurring_pay);

//app.use(ai)

// -------------------- END OF CLEAN CODES --------------------------//

// -------------------- ADMIN METHODS --------------------------//

app.get("/myProfile", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM emp AS e INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN position AS p ON p.position_id = ed.position_id WHERE e.emp_id = ? LIMIT 1";
  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.delete("/employeesList/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const q = "DELETE FROM emp WHERE user_id = ?";

  db.query(q, [user_id], (err, data) => {
    if (err) return res.json(err);
    return res.json("Employee has been deleted successfully.");
  });
});

// -------------------- ANNOUNCEMENT METHODS --------------------------//

app.get("/announcements", (req, res) => {
  const q =
    "SELECT * FROM announcements AS a INNER JOIN emp AS e ON a.emp_id=e.emp_id LIMIT 3";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.delete("/announcements/:ann_id", (req, res) => {
  const ann_id = req.params.ann_id;
  const q = "DELETE FROM announcements WHERE ann_id = ?";

  db.query(q, [ann_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json("Announcement #" + ann_id + "has been deleted successfully.");
    }
  });
});

app.delete("/division/:div_id", (req, res) => {
  const div_id = req.params.div_id;
  const q = "DELETE FROM division WHERE div_id = ?";

  db.query(q, [div_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json("Division #" + div_id + " has been deleted successfully.");
    }
  });
});

// -------------------- EMPLOYEE METHODS --------------------------//

app.get("/employeeProfile/:emp_id", (req, res) => {
  const fetchid = req.params.emp_id;
  db.query("SELECT * FROM emp WHERE emp_id=?", fetchid, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      var value = JSON.parse(JSON.stringify(result));
      console.log(value[0].f_name);
      console.log(value[0].m_name);
      console.log(value[0].s_name);
    }
  });
});

app.post("/addDivision", (req, res) => {
  const q = "INSERT INTO `division` (`div_name`) VALUES (?) ";
  const values = [req.body.div_name];

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("success");
    }
  });
});

app.delete("/deleteDivision", (req, res) => {
  const q = "DELETE FROM `division` WHERE div_id = ?";

  db.query(q, [user_id], (err, data) => {
    if (err) return res.json(err);
    return res.json("Division has been deleted successfully.");
  });
});

app.get("/showdirectory", (req, res) => {
  const q =
    "SELECT * FROM department as d INNER JOIN department_employees AS de ON d.dept_id=de.dept_id INNER JOIN emp AS e ON de.emp_id = e.emp_id INNER JOIN title as t ON e.emp_id = t.emp_id";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//TL

app.get("/showalldleaves", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE approver_id = ? ORDER BY date_filed DESC";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get("/showapproveddepartmentleaves", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 1 AND approver_id = ? ORDER BY date_filed DESC";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get("/showpendingleaveslimited", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ? ORDER BY date_filed DESC LIMIT 3";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/showpendingdepartmentleaveslimited", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ? ORDER BY date_filed DESC LIMIT 10";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/showpendingdepartmentleaves", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ? ORDER BY date_filed DESC";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/countpendingdepartmentleaves", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT COUNT(*) FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/showrejecteddepartmentleaves", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 2 AND approver_id = ? ORDER BY date_filed DESC";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/numofdeptleavestoday", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const today = moment().format("YYYY/MM/DD");

  const q =
    "SELECT COUNT(*) as count FROM leaves WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to";

  db.query(q, [uid, today], (err, data) => {
    if (err) {
      return res.json(err);
    }

    return res.json(data);
  });
});

app.get("/numofdeptleavesweek", (req, res) => {
  const uid = req.session.user[0].emp_id;
  //const today1 = moment().startOf('week').format("YYYY/MM/DD");
  const today2 = moment().startOf("week").add("days", 1).format("YYYY/MM/DD");
  const today3 = moment().startOf("week").add("days", 2).format("YYYY/MM/DD");
  const today4 = moment().startOf("week").add("days", 3).format("YYYY/MM/DD");
  const today5 = moment().startOf("week").add("days", 4).format("YYYY/MM/DD");
  const today6 = moment().startOf("week").add("days", 5).format("YYYY/MM/DD");
  //const today7 = moment().endOf('week').format("YYYY/MM/DD");

  const q =
    "SELECT COUNT(*) AS count FROM leaves WHERE " +
    "approver_id = ? AND leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " +
    "approver_id = ? AND leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " +
    "approver_id = ? AND leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " +
    "approver_id = ? AND leave_status = 1 AND ? BETWEEN leave_from AND leave_to OR " +
    "approver_id = ? AND leave_status = 1 AND ? BETWEEN leave_from AND leave_to";

  db.query(
    q,
    [uid, today2, uid, today3, uid, today4, uid, today5, uid, today6],
    (err, data) => {
      if (err) {
        return console.log(err);
      }

      return res.json(data);
    }
  );
});

//HR

app.get("/showalldeptleaves", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE approver_id = ? AND leave_status != 0 ORDER BY date_filed DESC";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("showselectedleave/:leave_id", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const leaveid = req.param.leave_id;

  const q =
    "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE requester_id = ? AND leave_id = ?";

  db.query(q, [uid, leave_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/showTitles", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT * FROM emp AS e INNER JOIN title AS t ON e.emp_id=t.emp_id where e.emp_id=?";
  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/getComplaints", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q =
    "(SELECT hr_id, complaint_id, complainer_id, date_filed, content_type, content_body, documentation, complaint_status, f_name, m_name, s_name, emp_pic, position_name FROM complaints INNER JOIN emp ON complaints.complainer_id = emp.emp_id INNER JOIN emp_designation ON emp_designation.emp_id = emp.emp_id INNER JOIN position ON emp_designation.position_id = position.position_id WHERE hr_id = ? OR hr_id = ? ORDER BY complaint_id DESC) UNION (SELECT hr_id, complaint_id, complainer_id, date_filed, content_type, content_body, documentation, complaint_status, NULL AS f_name, NULL AS m_name, NULL AS s_name, NULL AS emp_pic, NULL AS position_name FROM complaints WHERE complainer_id IS NULL AND (hr_id = ? OR hr_id = ?) ORDER BY complaint_id DESC)";

  db.query(q, [uid, 0, uid, 0], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      return res.json(data);
    }
  });
});

app.post("/editComplaints", (req, res) => {
  const cID = req.body.cID;
  const doc = req.body.documentation;
  const resolved = req.body.resolved === true ? 1 : 0;

  const q =
    "UPDATE complaints SET documentation = ?, complaint_status = ? WHERE complaint_id = ?";

  db.query(q, [doc, resolved, cID], (err, data) => {
    if (err) return res.json(err);
    else {
      return res.send("success");
    }
  });
});

app.get("/division", (req, res) => {
  const q = "SELECT * FROM division";

  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/department", (req, res) => {
  const q = "SELECT * FROM department";

  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/getHolidays", (req, res) => {
  const cid = req.session.user[0].company_id;

  const q = "SELECT h_date FROM holiday WHERE company_id = ?";

  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//ptoprobi

app.post("/ptoProbationary", (req, res) => {
  var currDate = "2024-02-29";
  const q =
    "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET emp_status = 'Regular', leave_balance = leave_balance + 5 " +
    "WHERE emp_status = 'PROBATIONARY' AND date_regularization = CURDATE()";

  db.query(q, (err, data) => {
    if (err) {
      return res.json(err);
    }
    console.log("Rows affected");
    return res.json(data);
  });
});

//ptoRegular

app.post("/ptoRegular", (req, res) => {
  const q =
    "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 0.83 " +
    "WHERE emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()";

  db.query(q, (err, data) => {
    if (err) {
      return res.json(err);
    }
    console.log("Rows affected");
    return res.json(data);
  });
});

//pto1year
app.post("/ptoTenure", (req, res) => {
  const q =
    "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 1.25 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()";

  db.query(q, (err, data) => {
    if (err) {
      return res.json(err);
    }
    console.log("Rows affected");
    return res.json(data);
  });
});

//refreshPTOinMarch
app.post("/ptoRefresh", (req, res) => {
  const q =
    "UPDATE leave_credits" +
    "SET leave_balance = 0 " +
    "WHERE DAY(GetDate()) = 1 AND DAY(GetMonth()) = 3";

  db.query(q, (err, data) => {
    if (err) {
      return res.json(err);
    }
    console.log("Rows affected");
    return res.json(data);
  });
});

//PTO working Student
app.post("/ptoTenure", (req, res) => {
  const q =
    "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 1.25 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()";

  db.query(q, (err, data) => {
    if (err) {
      return res.json(err);
    }
    console.log("Rows affected");
    return res.json(data);
  });
});

//HR Dashboard
app.get("countAllEmployees", (req, res) => {
  const q = "SELECT COUNT(*) FROM emp WHERE date_separated IS NULL";

  db.query(q, (err, count) => {
    if (err) {
      res.json(err);
    } else {
      res.json(count);
    }
  });
});

app.get("/myDeclinedLeaves", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q = "SELECT * FROM leaves WHERE leave_status = 2 AND emp_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/myPTOHistory", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q =
    "(SELECT log_type, log_time, log_desc, Null AS hr_name FROM emp AS e INNER JOIN pto_logs AS p ON e.emp_id = p.emp_id AND p.hr_id IS NULL WHERE e.emp_id = ?) UNION (SELECT log_type, log_time, log_desc, em.f_name AS hr_name FROM emp AS e INNER JOIN pto_logs AS p ON e.emp_id = p.emp_id INNER JOIN emp AS em ON p.hr_id = em.emp_id WHERE e.emp_id = ?) ORDER BY log_time DESC";

  const values = [uid, uid];
  db.query(q, [uid, uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/myDepartmentPendingLeaves", (req, res) => {});

/** --------------------- CRON Jobs --------------------------- **/

cron.schedule("0 0 * * *", function () {
  giveMonthlyHeartbits();
});

cron.schedule("0 0 * * *", function () {
  cronLogs();
  dailyPtoAccrual();
});

cron.schedule("0 0 1 1 *", function () {
  yearlyAccrual();
});

// ---------------------------------------- CHEER A PEER ---------------------------------------------- //
function giveMonthlyHeartbits() {
  const q2 =
    "UPDATE heartbits SET `heartbits_balance` = 100 WHERE ADDDATE(LAST_DAY(CURDATE()), 1) = CURDATE()";
  db.query(q2, (err, data) => {
    if (err) {
      res.send("error");
      console.log("Not the end of the month.");
    } else {
      console.log("Updated all heartbits to 100.");
    }
  });
}

function cronLogs() {
  // ---------------------------------------- PROBATIONARY ---------------------------------------------- //

  let get_id;

  const prob_q =
    "SELECT emp_id FROM emp WHERE emp_status = 'PROBATIONARY' AND date_regularization = CURDATE()";

  db.query(prob_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    get_id = data;
    console.log(get_id);

    for (var i = 0; i < get_id.length; i++) {
      console.log(get_id[i].emp_id);
      var id = get_id[i].emp_id;

      const min_q_log =
        "INSERT INTO pto_logs (`log_type`, `log_desc`, `emp_id`) VALUES (?) ";

      let category;
      let reason;

      category = "AUTO";
      reason =
        "You have gained 5 PTO days for being regularized. Congratulations!";

      const VALUES = [category, reason, id];

      db.query(min_q_log, [VALUES], (err, data) => {
        if (err) {
          return console.log(err);
        }
        console.log(reason);
      });
    }
  });

  // ---------------------------------------- REGULAR ---------------------------------------------- //

  let reg_array;

  const reg_q = `SELECT emp_id FROM emp WHERE CURDATE() < DATE_ADD(date_hired, INTERVAL 1 YEAR) AND emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()`;

  db.query(reg_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    reg_array = data;
    console.log(reg_array);

    for (var i = 0; i < reg_array.length; i++) {
      console.log(reg_array[i].emp_id);
      var id = reg_array[i].emp_id;

      const min_q_log =
        "INSERT INTO pto_logs (`log_type`, `log_desc`, `emp_id`) VALUES (?) ";

      let category;
      let reason;

      category = "AUTO";
      reason = "You have gained 0.83 PTO days.";

      const VALUES = [category, reason, id];

      db.query(min_q_log, [VALUES], (err, data) => {
        if (err) {
          return console.log(err);
        }
        console.log("Log done.");
      });
    }
  });

  // ---------------------------------------- TENURE ---------------------------------------------- //

  let tenure_array;

  const tenure_q = `SELECT emp_id FROM emp WHERE CURDATE() > DATE_ADD(date_hired, INTERVAL 1 YEAR) AND emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()`;

  db.query(tenure_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    tenure_array = data;
    console.log(tenure_array);

    for (var i = 0; i < tenure_array.length; i++) {
      console.log(tenure_array[i].emp_id);
      var id = tenure_array[i].emp_id;

      const min_q_log =
        "INSERT INTO pto_logs (`log_type`, `log_desc`, `emp_id`) VALUES (?) ";

      let category;
      let reason;

      category = "AUTO";
      reason = "You have gained 1.25 PTO days.";

      const VALUES = [category, reason, id];

      db.query(min_q_log, [VALUES], (err, data) => {
        if (err) {
          return console.log(err);
        }
        console.log("Log done.");
      });
    }
  });

  // ---------------------------------------- TENURE ---------------------------------------------- //

  let scholar_array;

  const scholar_q = `SELECT emp_id FROM emp WHERE CURDATE() > DATE_ADD(date_hired, INTERVAL 1 YEAR) AND emp_status = 'Part-time' AND LAST_DAY(CURDATE()) = CURDATE()`;

  db.query(scholar_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    scholar_array = data;
    console.log(scholar_array);

    for (var i = 0; i < scholar_array.length; i++) {
      console.log(scholar_array[i].emp_id);
      var id = scholar_array[i].emp_id;

      const min_q_log =
        "INSERT INTO pto_logs (`log_type`, `log_desc`, `emp_id`) VALUES (?) ";

      let category;
      let reason;

      category = "AUTO";
      reason = "You have gained 0.625 PTO days.";

      const VALUES = [category, reason, id];

      db.query(min_q_log, [VALUES], (err, data) => {
        if (err) {
          return console.log(err);
        }
        console.log("Log done.");
      });
    }
  });
}

function dailyPtoAccrual() {
  const prob_q = `UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id SET emp_status = 'Regular', leave_balance = leave_balance + 5 WHERE emp_status = 'Probationary' AND date_regularization = CURDATE()`;

  const reg_q = `UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance + 0.83 WHERE CURDATE() < DATE_ADD(date_hired, INTERVAL 1 YEAR) AND emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()`;

  const tenure_q = `UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance + 1.25 WHERE CURDATE() > DATE_ADD(date_hired, INTERVAL 1 YEAR) AND emp_status = 'Regular' AND LAST_DAY(CURDATE()) = CURDATE()`;

  const scholar_q = `UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance + 0.625 WHERE CURDATE() > DATE_ADD(date_hired, INTERVAL 1 YEAR) AND emp_status = 'Part-time' AND LAST_DAY(CURDATE()) = CURDATE()`;

  db.query(prob_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    console.log("Probationary PTO accrual done.");
  });

  db.query(reg_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    console.log("Regular PTO accrual done.");
  });

  db.query(tenure_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    console.log("Tenured PTO accrual done.");
  });

  db.query(scholar_q, (err, data) => {
    if (err) {
      return console.log(err);
    }
    console.log("Working Scholar accrual done.");
  });
}

app.get("/getApprover", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT manager_id FROM department AS d INNER JOIN department_employees AS de ON d.dept_id=de.dept_id WHERE emp_id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.post("/editMyProfile", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "UPDATE emp SET personal_email = '" +
    req.body.personal_email +
    "', contact_num = '" +
    req.body.contact_num +
    "', emergency_contact_name = '" +
    req.body.emergency_contact_name +
    "', emergency_contact_num = '" +
    req.body.emergency_contact_num +
    "', civil_status = '" +
    req.body.civil_status +
    "' WHERE emp_id = " +
    uid;

  db.query(q, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("success");
    }
    // if (err) return console.log(err);
    // return res.json(data);
  });
});

app.post("/subtractPTO", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance - " +
    req.body.use_pto_points +
    " WHERE l.emp_id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/makeDeptLead", (req, res) => {
  const q1 =
    "UPDATE dept SET manager_id = " +
    req.body.emp_id +
    "  WHERE dept_id = " +
    req.body.dept_id;

  db.query(q1, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });

  const q2 = "UPDATE emp SET emp_role = 3 WHERE emp_id = " + req.body.emp_id;

  db.query(q2, (err, data) => {
    if (err) return console.log(err);
    return console.log(
      "Successfully set employee to lead role. Please check if dashbaord changed."
    );
  });
});

app.get("/getUserAvatar", (req, res) => {
  const uid = req.session.user[0].emp_id;
  const q = "SELECT emp_pic FROM emp WHERE emp_id = 4";

  db.query(q, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get("/isWorkEmailUnique", (req, res) => {
  const q = "SELECT * FROM emp WHERE work_email = ?";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

/** -------------------------- */

app.get("/getAllCompanies", (req, res) => {
  const q = "SELECT * FROM company ORDER BY company_name ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/getAllClients", (req, res) => {
  const q = "SELECT * FROM client ORDER BY client_name ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/getAllPositionsInDivision", (req, res) => {
  const q =
    "SELECT * FROM position WHERE div_id = ? ORDER BY position_name ASC";

  db.query(q, req.body.div_id, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

app.post("/addNewDivision", (req, res) => {
  const cid = req.session.user[0].company_id;
  const q = "INSERT INTO division (`div_name`, `company_id`) VALUES (?) ";
  const values = [req.body.div_name, cid];

  if (!isEmpty(req.body.div_name)) {
    db.query(q, [values], (err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send("success");
      }
    });
  } else {
    res.send("error");
  }
});

app.post("/addNewDepartment", (req, res) => {
  const q = "INSERT INTO dept (`div_id`,`dept_name`) VALUES (?) ";
  const values = [req.body.div_id, req.body.dept_name];

  if (!isEmpty(req.body.div_id) && !isEmpty(req.body.dept_name)) {
    db.query(q, [values], (err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send("success");
      }
    });
  } else {
    res.send("error");
  }
});

app.post("/addNewPosition", (req, res) => {
  const q = "INSERT INTO `position` (`dept_id`, `position_name`) VALUES (?) ";
  const values = [req.body.dept_id, req.body.position_name];

  if (!isEmpty(req.body.dept_id) && !isEmpty(req.body.position_name)) {
    db.query(q, [values], (err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send("success");
      }
    });
  } else {
    res.send("error");
  }
});

// -------------------------EMPLOYEE DIRECTORY QUERIES------------------------- //

app.get("/getExecutiveDivision", (req, res) => {
  const q =
    "SELECT * FROM emp_designation INNER JOIN emp ON emp_designation.emp_id = emp.emp_id INNER JOIN company ON emp_designation.company_id = company.company_id INNER JOIN client ON emp_designation.client_id = CLIENT.client_id INNER JOIN position ON emp_designation.position_id = POSITION.position_id INNER JOIN dept ON position.dept_id = dept.dept_id INNER JOIN division ON dept.div_id = division.div_id WHERE division.div_id = 1";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

// -------------------------EMPLOYEE DIRECTORY QUERIES------------------------- //

app.get("/getAllPositionsInDivision", (req, res) => {
  const q =
    "SELECT * FROM position WHERE div_id = ? ORDER BY position_name ASC";

  db.query(q, req.body.div_id, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/getOwnEmpDesignation", (req, res) => {
  const uid = req.session.user[0].emp_id;

  const q =
    "SELECT * FROM emp AS e INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN company AS c ON c.company_id = ed.company_id INNER JOIN client AS cl ON cl.client_id = ed.client_id INNER JOIN position AS p ON p.position_id = ed.position_id INNER JOIN dept AS de ON de.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = de.div_id WHERE e.emp_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/getUserEmpDesignation/:emp_id", (req, res) => {
  const id = req.params.emp_id;

  const q =
    "SELECT * FROM emp AS e INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN company AS c ON c.company_id = ed.company_id INNER JOIN client AS cl ON cl.client_id = ed.client_id INNER JOIN position AS p ON p.position_id = ed.position_id INNER JOIN dept AS de ON de.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = de.div_id WHERE e.emp_id = ?";

  db.query(q, id, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

// ----------FORGOT PASSWORD---------- //

app.post("/forgot-password", (req, res) => {
  const email = req.body.email;

  const q = "SELECT * FROM emp WHERE work_email = ?";

  db.query(q, [email], (err, data) => {
    if (data.length == 0) {
      res.send("error");
    } else {
      const user_key = data[0].emp_key;

      try {
        let transporter = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "tech@kriyahr.com",
            pass: "faew yxtz hkhb njnm",
          },
        });
        transporter.sendMail({
          from: "tech@kriyahr.com", // sender address
          to: email, // list of receivers
          subject: "Action required: Reset password | kriyaHR", // Subject line
          text: "Reset password", // plain text body
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en">

                    <head></head>
                      
                      <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word">
                        
                  <div id="email" style="margin: auto;width: 600px;background-color: white;">
                    
                  
                           <table role="presentation" width="100%">
                              <tr>
                           
                                <td bgcolor="#0097B2" align="center" style="color: white;vertical-align: top;">
                              
                               <img alt="logo" src="https://fullsuite.ph/wp-content/uploads/2023/09/2-2.png" width="100%" align="middle">
                                  
                              
                              </td> 
                  
                  
                          </tr></table>
                    
                    <table role="presentation" border="0" cellpadding="0" cellspacing="10px" style="padding: 30px 30px 30px 60px;">
                       <tr>
                         <td style="vertical-align: top;">
                          <h2 style="font-size: 28px;font-weight: 900;"> Reset Password</h2>
                              
                              <p style="font-weight: 100;">
                                This is the link to reset your password: ${process.env.ORIGIN_URL}/reset-password/${user_key}
                              </p>
                  
                  
                              <br><br><br>
                              <h3>Cheers!</h3>
                              <h2 style="font-size: 28px;font-weight: 900;">the <span style="color: #0097B2">f</span>ull<span style="color: #0097B2">s</span>uite HRIS team.</h2>
                            </td> 
                            </tr>
                                   </table>
                    
                       
                          <!--Footer Row-->
                    <table role="presentation" bgcolor="#EAF0F6" width="100%" style="margin-top: 50px;">
                        <tr>
                            <td align="center" style="padding: 30px 30px;vertical-align: top;">
                  
                                <p style="font-size: 11px;font-weight: 100;">166-C Military Cutoff Road, Baguio City, Benguet
                                  Purok 2, Poblacion, Lianga, Surigao del Sur</p>
                                
                     
                            </td>
                            </tr>
                        </table>
                  
                        <table role="presentation" width="100%">
                          <tr>
                       
                          
                           <img alt="logo" src="https://fullsuite.ph/wp-content/uploads/2023/09/3-1-1.png" height="200px" width="100%" align="middle">
                  
                      </tr></table>
                    
                        </div>
                      </body>
                        </html>`,
        });
      } catch (e) {
        console.log("----------------" + e + "----------------");
      }

      res.send("success");
    }
  });
});

app.get("/reset-password/:user_key", (req, res) => {
  const user_key = req.params.user_key;

  const q = "SELECT emp_key FROM emp WHERE emp_key = ?";

  db.query(q, [user_key], (err, data) => {
    if (err) {
      console.log(e);
    } else {
      res.json(data);
    }
  });
});

app.post("/reset-password/:user_key", (req, res) => {
  const user_key = req.params.user_key;
  const newPassword = String(req.body.password);

  //----- HASHING ALGO -----//
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(newPassword, salt);

  const q1 =
    "UPDATE emp SET `password` = '" +
    hashed +
    "' WHERE emp_key = '" +
    user_key +
    "'";

  db.query(q1, [user_key], (err, data) => {
    if (err) {
      res.send("error");
    } else {
      function generateRandomnString(n) {
        let randomString = "";
        let characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

        for (let i = 0; i < n; i++) {
          randomString += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }

        return randomString;
      }

      const new_key = generateRandomnString(30);

      const q2 =
        "UPDATE emp SET `emp_key` = '" +
        new_key +
        "' WHERE emp_key = '" +
        user_key +
        "'";

      db.query(q2, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.send("success");
        }
      });
    }
  });
});

const birthdays_app = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET_BDAYS,
  token: process.env.SLACK_BOT_TOKEN_BDAYS,
});

function mentionBirthdays() {
  const q = `SELECT work_email FROM emp e INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id 
  WHERE MONTH(e.dob) = MONTH(NOW()) AND DAY(e.dob) = DAY(NOW())
  AND ed.company_id = 1`;

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Birthdays Today: ", data);

      data.map((d) => {
        console.log("D: ", d);
        wishBirthday(d.work_email);
      });
    }
  });
}

async function wishBirthday(email) {
  const e = email.substring(0, email.indexOf("@"));

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `It's <@${e}>'s birthday today! Wish them a happy birthday!`,
      },
    },
  ];

  await birthdays_app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN_BDAYS,
    channel: process.env.SLACK_CHANNEL_BDAYS,
    text: `Someone has a birthday today! Wish them a happy birthday.`,
    blocks,
  });
}

cron.schedule("0 0 * * *", async function () {
  mentionBirthdays();
});
