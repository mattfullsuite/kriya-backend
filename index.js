var express = require("express")
//var mysql = require( "mysql")
var cors = require("cors")
//var dotenv = require("dotenv")
var cookieParser = require("cookie-parser")
var session = require("express-session")
var bodyParser = require("body-parser")
var cron = require('node-cron')
const nodemailer = require('nodemailer')
var HomeHandler = require("./handlers/authentication/home.js");
//var LoginHandler = require( "./handlers/authentication/login.js");
var ProcessLoginHandler = require("./handlers/authentication/process_login.js")
var LogoutHandler = require("./handlers/authentication/logout.js");
var DailyPTOAccrual = require("./handlers/utilities/cron-daily.js")
var db = require("./config.js");
var moment = require("moment")
const path = require("path")
const bcrypt = require("bcryptjs");
const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/" + "../frontend/public/uploads")
    },

    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

//dotenv.config({ path: './protected.env' })

const app = express()

/**const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
})**/

db.connect ( (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MYSQL connected...")
    }
})

app.use(express.json());

app.use(cors(
    {
    origin: [process.env.ORIGIN_URL],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true
    }
));

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true}));

app.use(session({
    key: "userId",
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 60 * 60 * 24 * 1000, 
    }
}))


app.listen(process.env.DATABASE_PORT, ()=>{
    console.log("Connected to backend mysql database!");
})

/**app.get("/", (req, res) => {
    res.json("Hi hmmm ano kaya dito?")
})**/

// -------------------- GENERAL METHODS --------------------------//



app.get('/', HomeHandler);

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
})

app.post("/processlogin", ProcessLoginHandler);
app.get('/logout', LogoutHandler)


// -------------------- ADMIN METHODS --------------------------//

app.get("/myProfile", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM emp AS e INNER JOIN emp_designation AS ed ON e.emp_id = ed.emp_id INNER JOIN position AS p ON p.position_id = ed.position_id WHERE e.emp_id = ? LIMIT 1"
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
});


app.get("/employeeslist", (req, res) => {
    const q = "SELECT * FROM emp ORDER BY s_name"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
});

app.delete("/employeesList/:user_id", (req, res) => {
    const user_id = req.params.user_id;
    const q = "DELETE FROM emp WHERE user_id = ?";

    db.query(q, [user_id], (err,data) => {
        if(err) return res.json(err)
        return res.json("Employee has been deleted successfully.")
    })
})

app.get("/viewEmployee/:emp_id", async (req, res) => {
    const emp_id = req.params.emp_id;    
    const q = "SELECT * FROM emp AS e INNER JOIN leave_credits AS l ON e.emp_id=l.emp_id INNER JOIN emp_designation AS ed ON e.emp_id=ed.emp_id WHERE e.emp_id = ?";

    db.query(q, [emp_id], (err,data) => {
        if(err) return res.json(err)
        return res.send(data)
    })
})

app.post('/addEmployee', (req,res) => {

    function generateRandomnString(n) {
        let randomString = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

        for(let i = 0; i < n; i++) {
            randomString += characters.charAt(Math.floor(Math.random()*characters.length));
        }

        return randomString;
    }

    const emp_key = generateRandomnString(30)

    const q = "INSERT INTO `emp`(`user_id`, `work_email`, `f_name`, `m_name`, `s_name`, `personal_email`, `contact_num`, `dob`, `p_address`, `c_address`, `date_hired`, `sex`, `created_by`, `updated_by`, `emp_key`) VALUES (?)";
    const values = 
        [req.body.user_id, 
        req.body.work_email,
        req.body.f_name,
        req.body.m_name, 
        req.body.s_name,
        req.body.personal_email,
        req.body.contact_num,
        req.body.dob,
        req.body.p_address,
        req.body.c_address,
        req.body.date_hired,
        req.body.sex,
        req.body.created_by,
        req.body.updated_by,
        ]

    db.query(q, [values, emp_key], (err, data) => {
        if (err) return res.json(err);
        return res.json("New employee added!")
    })

})

// -------------------- ANNOUNCEMENT METHODS --------------------------//

app.get("/announcements", (req, res) => {
    const q = "SELECT * FROM announcements AS a INNER JOIN emp AS e ON a.emp_id=e.emp_id LIMIT 3" 
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
});

app.delete("/announcements/:ann_id", (req, res) => {
    const ann_id = req.params.ann_id;
    const q = "DELETE FROM announcements WHERE ann_id = ?";

    db.query(q, 
        [ann_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Announcement #" + ann_id + "has been deleted successfully.")
        }
    })
})

app.delete("/holiday/:h_id", (req, res) => {
    const h_id = req.params.h_id;
    const q = "DELETE FROM holiday WHERE h_id = ?";

    db.query(q, 
        [h_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Holiday #" + h_id + " has been deleted successfully.")
        }
    })
})

app.post('/addEmployee', (req,res) => {

    "INSERT INTO `announcements` (`ann_id`, `emp_id`, `ann_title`, `ann_content`, `ann_category`) VALUES (?)";
    const values = 
        [req.body.emp_id,
         req.body.ann_title,
         req.body.ann_title,
         req.ann_content,
         req.ann_category,]

    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err)
        } else {
            console.log("New Announcement added!")
        }
    })

})

// -------------------- EMPLOYEE METHODS --------------------------//

app.get("/employeeProfile/:emp_id", (req, res) => {
    const fetchid=req.params.emp_id;
    db.query(
        "SELECT * FROM emp WHERE emp_id=?",
        fetchid, (err, result) => {
            if (err){
                console.log(err);
            } else {
                var value=JSON.parse(JSON.stringify(result))
                console.log(value[0].f_name)
                console.log(value[0].m_name)
                console.log(value[0].s_name)
            }
        })
})

app.post("/editEmployee/:emp_id", (req, res)=> {
    const fetchid=req.params.emp_id;

    //const q = "UPDATE `emp` SET (`emp_id`, `emp_num`, `work_email`, `password`, `f_name`, `m_name`, `s_name`, `emp_role`,`personal_email`, `contact_num`, `dob`, `p_address`, `c_address`, `date_hired`, `date_regularization`,`emp_status`,`sex`,`gender`,`civil_status`) VALUES (?)";
    const q = "UPDATE emp SET " + 
    "`emp_num` = '" + req.body.emp_num +  "'," +
    "`work_email` = '" + req.body.work_email + "'," +
    "`f_name` = '" + req.body.f_name + "'," +
    "`m_name` = '" + req.body.m_name + "'," + 
    "`s_name` = '" + req.body.s_name + "'," + 
    "`emp_role` = " + req.body.emp_role + "," + 
    "`personal_email` = '" + req.body.personal_email + "'," +
    "`contact_num` =" + req.body.contact_num + "," +
    "`dob` = '" + moment(req.body.dob).format("YYYY-MM-DD") + "'," +
    "`p_address`= '" + req.body.p_address + "'," +  
    "`c_address`= '" +  req.body.c_address + "'," +
    "`date_hired` = '" + moment(req.body.date_hired).format("YYYY-MM-DD") + "'," +
    "`date_regularization`='" + moment(req.body.date_regularization).format("YYYY-MM-DD") + "'," +
    "`emp_status`='" + req.body.emp_status + "'," + 
    "`sex`='" + req.body.sex + "'," +
    "`gender`='" + req.body.gender + "'," +
    "`civil_status`='" + req.body.civil_status + "'" +
    "WHERE `emp_id` = " + fetchid;

    db.query(q, (err, data) => {
        if (err) {
            console.log(err)
        }
        res.json(data);
    })

    // const designationValues = 
    // [
    //     fetchid,
    //     req.body.company_id,
    //     req.body.client_id,
    //     req.body.position_id,
    // ]

    // //const q3 = "UPDATE `emp_designation` SET (`emp_id`, `company_id`,`div_id`,`dept_id`,`client_id`,`position_id`) VALUES (?)"
    // const q3 = "UPDATE emp_designation SET emp_id=?,dept_id=?,client_id=?,position_id=?"

    // db.query(q3, [designationValues], (err, data3) => {
    //     if (err) {console.log(err)};
    //     console.log("Inserted new designation for new employee.")
    // })

})

app.post("/addHoliday", (req,res) => {
    const q = "INSERT INTO holiday (`h_name`, `h_date`) VALUES (?) "
    const values = 
    [req.body.h_name, 
    req.body.h_date] 

    db.query(q, [values], (err, data)=> { 
        if (err) return res.json(err)
        return res.json("Holiday added!")
    })
})

app.post("/addcompany", (req,res) => {
    const q = "INSERT INTO company (`company_id`, `company_name`, `company_loc`) VALUES (?) "
    const values = [2, "TeeTalkPH", "Baguio City"] 

    db.query(q, [values], (err, data)=> { 
        if (err) return res.json(err)
        return res.json("Company has been created successfully!")
    })
})

app.get("/showdirectory", (req, res) => {
    const q = "SELECT * FROM department as d INNER JOIN department_employees AS de ON d.dept_id=de.dept_id INNER JOIN emp AS e ON de.emp_id = e.emp_id INNER JOIN title as t ON e.emp_id = t.emp_id"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/getUserPTO", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM `leave_credits` AS l INNER JOIN `emp` AS e ON l.emp_id = e.emp_id WHERE e.emp_id = ?"

    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
})


//TL
app.get("/showalldleaves", (req, res) => {
    const uid = req.session.user[0].emp_id

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id INNER JOIN title as t ON t.emp_id = e.emp_id WHERE approver_id = ? ORDER BY date_filed DESC"

    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }
        return res.json(data)
    })
})

app.get("/showapproveddepartmentleaves", (req, res) => {
    const uid = req.session.user[0].emp_id

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id INNER JOIN title as t ON t.emp_id = e.emp_id WHERE leave_status = 1 AND approver_id = ? ORDER BY date_filed DESC"

    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }
        return res.json(data)
    })
})

app.get("/showpendingdepartmentleaveslimited", (req, res) => {
    const uid = req.session.user[0].emp_id

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ? ORDER BY date_filed DESC LIMIT 3"
    
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
})

app.get("/showpendingdepartmentleaves", (req, res) => {
    const uid = req.session.user[0].emp_id

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id INNER JOIN title as t ON t.emp_id = e.emp_id WHERE leave_status = 0 AND approver_id = ? ORDER BY date_filed DESC"
    
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
})

app.get("/countpendingdepartmentleaves", (req, res) => {
    const uid = req.session.user[0].emp_id

    const q = "SELECT COUNT(*) FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id INNER JOIN title as t ON t.emp_id = e.emp_id WHERE leave_status = 0 AND approver_id = ?"
    
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
})

app.get("/showrejecteddepartmentleaves", (req, res) => {
    const uid = req.session.user[0].emp_id

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id INNER JOIN title as t ON t.emp_id = e.emp_id WHERE leave_status = 2 AND approver_id = ? ORDER BY date_filed DESC"
    
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
})

app.get("/numofdeptleavestoday" , (req, res) => {
    const uid = req.session.user[0].emp_id
    const today = moment().format("YYYY/MM/DD")

    const q = "SELECT * FROM leaves WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to"

    db.query(q,
        [uid, today],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
})

//HR
app.get("/showallleaves", (req, res) => {
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id ORDER BY date_filed DESC"
    
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/showpendingleaves", (req, res) => {
    const q = "SELECT * FROM leaves INNER JOIN emp ON requester_id=emp_id WHERE leave_status = 0 ORDER BY date_filed DESC"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/showallmyleaves", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE requester_id = ? ORDER BY date_filed DESC"
    
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/getApproverDetails", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM emp WHERE emp_role = 3"
    
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/showalldeptleaves", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE approver_id = ? AND leave_status != 0 ORDER BY date_filed DESC"
    
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("showselectedleave/:leave_id", (req, res) => {
    const uid = req.session.user[0].emp_id
    const leaveid = req.param.leave_id

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE requester_id = ? AND leave_id = ?"
    
    db.query(q,[uid, leave_id],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/showapprovedleaves", (req, res) => {
    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE leave_status = 1 ORDER BY date_filed DESC"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/showrejectedleaves", (req, res) => {
    const q = "SELECT * FROM leaves INNER JOIN emp ON requester_id=emp_id WHERE leave_status = 2 ORDER BY date_filed DESC"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/showTitles", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM emp AS e INNER JOIN title AS t ON e.emp_id=t.emp_id where e.emp_id=?"
    db.query(q,[uid],(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

//Approve
app.post("/approveleave/:leave_id", (req, res) => {
    const leave_id = req.params.leave_id;
    const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

    db.query(q, 
        [1, leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Leave #" + leave_id + "has been updated successfully.")
        }
    })
})

//Reject
app.post("/rejectleave/:leave_id", (req, res) => {
    const leave_id = req.params.leave_id;
    const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

    db.query(q, 
        [2, leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Leave #" + leave_id + "has been updated successfully.")
        }
    })
})

app.post("/returnTempPTO/:leave_id", (req, res) => {
    const leave_id = req.params.leave_id;

    const q = "UPDATE leaves AS l JOIN leave_credits AS lc ON l.requester_id=lc.emp_id SET leave_balance = leave_balance + use_pto_points WHERE leave_id = ?";

    db.query(q, 
        [leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            res.json("Ptos have been returned for " + leave_id + "")
        }
    })
})


app.get("/holidays", (req, res) => {

    const q = "SELECT * FROM holiday";

    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/getHolidays", (req, res) => {

    const q = "SELECT h_date FROM holiday";

    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})



//ptoprobi

app.post("/ptoProbationary", (req, res) => {
    var currDate = "2024-02-29";
    const q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET emp_status = 'REGULAR', leave_balance = leave_balance + 5 " +
     "WHERE emp_status = 'PROBATIONARY' AND date_regularization = CURDATE()"
    
    db.query(q,(err,data)=> {
        if(err) {
            return res.json(err)
        }
        console.log("Rows affected")
        return res.json(data)
    })
})

//ptoRegular

app.post("/ptoRegular", (req, res) => {
    const q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 0.83 " +
     "WHERE emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(q,(err,data)=> {
        if(err) {
            return res.json(err)
        }
        console.log("Rows affected")
        return res.json(data)
    })
})

//pto1year
app.post("/ptoTenure", (req, res) => {
    const q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 1.25 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(q,(err,data)=> {
        if(err) {
            return res.json(err)
        }
        console.log("Rows affected")
        return res.json(data)
    })
})

//refreshPTOinMarch
app.post("/ptoRefresh", (req, res) => {
    const q = "UPDATE leave_credits" +
    "SET leave_balance = 0 " +
     "WHERE DAY(GetDate()) = 1 AND DAY(GetMonth()) = 3"
    
    db.query(q,(err,data)=> {
        if(err) {
            return res.json(err)
        }
        console.log("Rows affected")
        return res.json(data)
    })
})

//PTO working Student
app.post("/ptoTenure", (req, res) => {
    const q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 1.25 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(q,(err,data)=> {
        if(err) {
            return res.json(err)
        }
        console.log("Rows affected")
        return res.json(data)
    })
})


//Check Upcoming Bdays
app.get("/getupcomingbdays", (req, res) => {
    const q = "SELECT * FROM emp ORDER BY DAYOFYEAR(dob) < DAYOFYEAR(CURDATE()) , DAYOFYEAR(dob) LIMIT 5;"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    }) 
})

app.get("/getupcominganniversaries", (req, res) => {
    const q = "SELECT * FROM emp ORDER BY DAYOFYEAR(date_hired) < DAYOFYEAR(CURDATE()) , DAYOFYEAR(date_hired) LIMIT 5;"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

//HR Dashboard
app.get("countAllEmployees", (req, res) => {
    const q = "SELECT COUNT(*) FROM emp WHERE date_separated IS NULL"

    db.query(q, (err, count) => {
        if (err){
            res.json(err)
        } else {
            res.json(count)
        }
    })
})

app.get("/myDeclinedLeaves", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 2 AND emp_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/myPendingLeaves", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 0 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/myApprovedLeaves", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 1 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})


app.get("/myDepartmentPendingLeaves", (req, res) => {

})

/** --------------------- CRON Jobs --------------------------- **/

cron.schedule("0 0 * * *", function () {
    dailyPtoAccrual();
});

cron.schedule("0 0 1 1 *", function() {
    yearlyAccrual();
})

function yearlyAccrual() { 
    const year_q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 6 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'WORKING_SCHOLAR'"

    db.query(year_q,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Working Scholar yearly accrual done.")
    })
}

function dailyPtoAccrual() {

    const prob_q ="UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
        "SET emp_status = 'REGULAR', leave_balance = leave_balance + 5 " +
        "WHERE emp_status = 'PROBATIONARY' AND date_regularization = CURDATE()";

    const reg_q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
        "SET leave_balance = leave_balance + 0.83 " +
        "WHERE emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"

    const tenure_q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
        "SET leave_balance = leave_balance + 1.25 " +
        "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"

    const scholar_q = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
        "SET leave_balance = leave_balance + 0.625 " +
        "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'WORKING_SCHOLAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(prob_q,(err,data) => {
        if(err) {
            return console.log(err)
        }
        console.log("Probationary PTO accrual done.")
    })
    
    db.query(reg_q,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Regular PTO accrual done.")
    })
    
    db.query(tenure_q,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Tenured PTO accrual done.")
    })
    
    db.query(scholar_q,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Working Scholar accrual done.")
    })
}

app.get("/getAllApprovers", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM emp JOIN dept ON emp_id = manager_id WHERE emp_role = 3 AND emp_id != ?"

    db.query(q,[uid],
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
})


app.get("/getApprover", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT manager_id FROM department AS d INNER JOIN department_employees AS de ON d.dept_id=de.dept_id WHERE emp_id = ?"

    db.query(q,
        [uid],
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
})

app.post("/addNewEmployee", upload.single("emp_pic"), (req, res)=> {

    function generateRandomnString(n) {
        let randomString = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

        for(let i = 0; i < n; i++) {
            randomString += characters.charAt(Math.floor(Math.random()*characters.length));
        }

        return randomString;
    }

    const tempPassword = generateRandomnString(20)
    
    const empKey = generateRandomnString(30)

    //----- HASHING ALGO -----//
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(tempPassword, salt)
    const filename =  (req.file === undefined) ? null : req.file.filename;

    const q = "INSERT INTO `emp` ( `emp_num`, `work_email`, `password`, `f_name`, `m_name`, `s_name`, `emp_role`,`personal_email`, `contact_num`, `dob`, `p_address`, `c_address`, `date_hired`, `date_regularization`,`emp_status`,`sex`,`gender`,`civil_status`, `emp_key`, `emp_pic`) VALUES (?)";
    const values = 
        [
        req.body.emp_num,
        req.body.work_email,
        hashed,
        req.body.f_name,
        req.body.m_name, 
        req.body.s_name,
        req.body.emp_role,
        req.body.personal_email,
        req.body.contact_num,
        req.body.dob,
        req.body.p_address,
        req.body.c_address,
        req.body.date_hired,
        req.body.date_regularization,
        req.body.emp_status,
        req.body.sex,
        req.body.gender,
        req.body.civil_status,
        empKey,
        filename
        ]

    db.query(q, [values], (err, data) => {
        if (err) {
            res.send("error")
        }
        else {
            const q2 = "INSERT INTO `leave_credits` (`emp_id`, `leave_balance`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1)," + 0 + ")"

            db.query(q2, (err, data2) => {
            if (err) {
                console.log(err)
            };
                console.log("Inserted leave credits for new employee.")
            })
        
            const designationValues = 
            [
                req.body.company_id,
                req.body.client_id,
                req.body.position_id,
            ]
        
            const q3 = "INSERT INTO `emp_designation` (`emp_id`, `company_id`,`client_id`,`position_id`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1), ?)"
        
            db.query(q3, [designationValues], (err, data3) => {
                if (err) {console.log(err)};
            })

            res.send("success")
        
        
            try {
                let transporter = nodemailer.createTransport({
                    host: "smtp.elasticemail.com",
                    port: 2525,
                    secure: false,
                    auth: {
                      user: 'marvin@fullsuite.ph',
                      pass: '15BC029719F114C8D23A0436E328A510D55E',
                    },
                    tls: {
                         ciphers: 'SSLv3'
                    }
               });
                transporter.sendMail({
                    from: 'marvin@fullsuite.ph', // sender address
                    to: req.body.work_email, // list of receivers
                    subject: 'Action required: Temporary password | Fullsuite', // Subject line
                    text: tempPassword, // plain text body
                    html: '<div style="background-color: #363636; box-sizing: border-box;padding: 16px; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 20px;"><img src=".../Fs-logo.png" style="height: 56px; width: 56px" /><h1 style="color: white; font-size: 16px">fullsuite.ph</h1></div><p style="margin: 20px; text-align: justify;">Hi, '+ req.body.f_name +'!, we are happy to have you here at Fullsuite! But first things first, you need to change your password to secure your account. The system has already generated a temporary password to access you account.</p><div style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 20px; text-align: center; margin: 80px 20px;"><p>Your temporary password:</p><h2 style="font-weight: semibold; font-size: 18px; color: #0097b2;">'+ tempPassword +'</h2><button style="margin-top: 40px; background-color: #0097b2; outline: none; border: none; padding: 7px 15px; color: white; border-radius: 5px;">Go to portal</button></div>'
               });
            } catch(e) {
                console.log("----------------" + e + "----------------")
            }
        }
    })


})

// app.post("/createNewLeaveCredit", (req, res)=> {
//     const q2 = "INSERT INTO `leave_credits` (`emp_id`, `leave_balance`) VALUES ((SELECT `emp_id` FROM `emp` ORDER BY emp_id DESC LIMIT 1), 0)"

//     db.query(q2, (err, data2) => {
//      if (err) console.log(err);
//      return res.json(data2);
//     })
// })

app.post("/fileLeave", (req, res)=> {

    const uid = req.session.user[0].emp_id

    const q = "INSERT INTO leaves (`requester_id`, `leave_type`, `leave_reason`, `leave_from`, `leave_to`, `leave_status`, `approver_id`, `use_pto_points`) VALUES (?)" 
    const values = [
        uid, //1
        req.body.leave_type,
        req.body.leave_reason,
        req.body.leave_from,
        req.body.leave_to,
        0, //pending
        req.body.approver_id,//JHex
        req.body.use_pto_points,
    ]

    db.query(q, [values], (err, data) => {
        if(err) {
            res.send(err)
        }
        else {
            res.send("success")
        }
        // if (err) return console.log(err);
        // return res.json(data);
    })

    const q1 = "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance - " + req.body.use_pto_points + " WHERE l.emp_id = ?"

    db.query(q1, [uid], (err, data) => {
        if (err) return console.log(err); 
        return console.log(data);
    })

})

app.post("/editMyProfile", (req, res) => {
    const uid = req.session.user[0].emp_id
 
    const q = "UPDATE emp SET personal_email = '" + req.body.personal_email + "', contact_num = '" + req.body.contact_num + "', emergency_contact_name = '" + req.body.emergency_contact_name 
    + "', emergency_contact_num = '" + req.body.emergency_contact_num + "', civil_status = '" + req.body.civil_status + "' WHERE emp_id = " + uid

    db.query(q, (err, data) => {
        if(err) {
            res.send(err)
        }
        else {
            res.send("success")
        }
        // if (err) return console.log(err); 
        // return res.json(data);
    })
    
 })

app.post("/subtractPTO", (req,res) => {
    const uid = req.session.user[0].emp_id

    const q = "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance - " + req.body.use_pto_points + " WHERE l.emp_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err) return res.json(err); 
        return res.json(data);
    })
})

app.post("/setPTO/:emp_id", (req,res) => {
    const uid = req.params.emp_id
    const q = "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = " + req.body.new_pto_balance + " WHERE l.emp_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err) return res.json(err); 
        return res.json(data);
    })
})

app.get("/getUserAvatar", (req, res) => {
    const uid = req.session.user[0].emp_id
    const q = "SELECT emp_pic FROM emp WHERE emp_id = 4"

    db.query(q,
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
})

app.get("/getCurrentEmployees", (req, res) => {
    const q = "SELECT * FROM emp"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getRegularEmployees", (req, res) => {
    const q = "SELECT * FROM emp WHERE emp_status = 'REGULAR'"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})
app.get("/getProbationaryEmployees", (req, res) => {
    const q = "SELECT * FROM emp WHERE emp_status = 'PROBATIONARY'"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getPartTimeEmployees", (req, res) => {
    const q = "SELECT * FROM emp WHERE emp_status = 'PARTTIME'"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/isWorkEmailUnique", (req, res) => {

    const q = "SELECT * FROM emp WHERE work_email = ?"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})


/** -------------------------- */

app.get("/getAllCompanies", (req, res) => {

    const q = "SELECT * FROM company ORDER BY company_name ASC"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getAllDivisions", (req, res) => {

    const q = "SELECT * FROM division ORDER BY div_name ASC" 

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})


app.get("/getAllDepartments", (req, res) => {

    const q = "SELECT * FROM department ORDER BY dept_name ASC"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getAllClients", (req, res) => {

    const q = "SELECT * FROM client ORDER BY client_name ASC"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getAllPositions", (req, res) => {

    const q = "SELECT * FROM position"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getAllPositionsInDivision", (req, res) => {

    const q = "SELECT * FROM position WHERE div_id = ? ORDER BY position_name ASC"

    db.query(q, req.body.div_id, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

// -------------------------EMPLOYEE DIRECTORY QUERIES------------------------- //

app.get("/getExecutiveDivision", (req, res) => {

    const q = "SELECT * FROM emp_designation INNER JOIN emp ON emp_designation.emp_id = emp.emp_id INNER JOIN company ON emp_designation.company_id = company.company_id INNER JOIN client ON emp_designation.client_id = CLIENT.client_id INNER JOIN position ON emp_designation.position_id = POSITION.position_id INNER JOIN dept ON position.dept_id = dept.dept_id INNER JOIN division ON dept.div_id = division.div_id WHERE division.div_id = 1"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})


// -------------------------EMPLOYEE DIRECTORY QUERIES------------------------- //

app.get("/getDivision", (req, res) => {
    const q = "SELECT * FROM division";

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getDepartment", (req, res) => {
    const q = "SELECT * FROM dept";

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getDirectory", (req, res) => {
    const q = "SELECT * FROM emp INNER JOIN emp_designation ON emp.emp_id = emp_designation.emp_id INNER JOIN position ON emp_designation.position_id = position.position_id INNER JOIN dept ON dept.dept_id = position.dept_id INNER JOIN division ON division.div_id=dept.div_id"

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.get("/getAllPositionsInDivision", (req, res) => {

    const q = "SELECT * FROM position WHERE div_id = ? ORDER BY position_name ASC"

    db.query(q, req.body.div_id, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
})


// ----------FORGOT PASSWORD---------- //

app.post("/forgot-password", (req, res) => {
    const email = req.body.email;

    const q = "SELECT * FROM emp WHERE work_email = ?";

    db.query(q, [email], (err, data) => {
        if(data.length == 0) {
            res.send("error")
        }

        else {
            const user_key = data[0].emp_key

            try {
                let transporter = nodemailer.createTransport({
                    host: "smtp.elasticemail.com",
                    port: 2525,
                    secure: false,
                    auth: {
                      user: 'marvin@fullsuite.ph',
                      pass: '15BC029719F114C8D23A0436E328A510D55E',
                    },
                    tls: {
                         ciphers: 'SSLv3'
                    }
               });
                transporter.sendMail({
                    from: 'marvin@fullsuite.ph', // sender address
                    to: email, // list of receivers
                    subject: 'Action required: Reset password    | Fullsuite', // Subject line
                    text: "Reset password", // plain text body
                    html: `This is the link to reset your password ${process.env.ORIGIN_URL}/reset-password/${user_key}`
               });
            } catch(e) {
                console.log("----------------" + e + "----------------")
            }

            res.send("success")
        }
    })
})

app.get("/reset-password/:user_key", (req, res) => {
    const user_key = req.params.user_key;

    const q = "SELECT emp_key FROM emp WHERE emp_key = ?";

    db.query(q, [user_key], (err, data) => {
        if(err) {
            console.log(e)
        }
        else {
            res.json(data)
        }
    })
})

app.post("/reset-password/:user_key", (req, res) => {
    const user_key = req.params.user_key;
    const newPassword = String(req.body.password);

    //----- HASHING ALGO -----//
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(newPassword, salt)

    const q1 = "UPDATE emp SET `password` = '"+hashed+"' WHERE emp_key = '"+user_key+"'";

    db.query(q1, [user_key], (err, data) => {
        if(err) {
            res.send("error")
        }
        else {
            function generateRandomnString(n) {
                let randomString = '';
                let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
        
                for(let i = 0; i < n; i++) {
                    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
                }
        
                return randomString;
            }
        
            const new_key = generateRandomnString(30)

            const q2 = "UPDATE emp SET `emp_key` = '"+new_key+"' WHERE emp_key = '"+user_key+"'";

            db.query(q2, (err, data) => {
                if(err) {
                    res.send(err)
                }
                else {
                    res.send("success")
                }
            })
        }
    })
})