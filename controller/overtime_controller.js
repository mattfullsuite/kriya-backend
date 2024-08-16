var db = require("../config.js");

var Slack = require("@slack/bolt")
var dotenv = require("dotenv")

var moment = require("moment")

const ot_app = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET_OT,
    token: process.env.SLACK_BOT_TOKEN_OT,
})

const universal_app = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET_UNIVERSAL,
  token: process.env.SLACK_BOT_TOKEN_UNIVERSAL,
})


async function FileOvertime(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO overtime (`requester_id`, `overtime_type`, `overtime_date`, `overtime_reason`, `hours_requested`, `overtime_status`) VALUES (?)"

    const values = [
        uid,
        req.body.overtime_type,
        req.body.overtime_date,
        req.body.overtime_reason, 
        req.body.hours_rendered,
        0,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send("success")
        }
    })

    //Automation

    const fn = req.session.user[0].f_name;
    const sn = req.session.user[0].s_name;

    const sfn = req.session.user[0].superior_f_name;
    const ssn = req.session.user[0].superior_s_name;

    const emp_email = req.session.user[0].work_email.substring(0, req.session.user[0].work_email.indexOf("@"))
    const superior_email = req.session.user[0].superior_work_email.substring(0, req.session.user[0].superior_work_email.indexOf("@"))

    const blocks = [
        (req.body.hours_rendered > 1) ?
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": `Hi! <@${emp_email}> rendered ${req.body.hours_rendered} hours of overtime on ${moment(req.body.overtime_date).format("MMM DD YYYY")}. Sent a request to <@${superior_email}> for approval. Thank you!`
              }
          }
          :
          {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Hi! <@${emp_email}> rendered ${req.body.hours_rendered} hour of overtime on ${moment(req.body.overtime_date).format("MMM DD YYYY")}. Sent a request to <@${superior_email}> for approval. Thank you!`
            }
          }
        
        ]

    await ot_app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN_OT,
        channel: process.env.SLACK_CHANNEL_OT,
        text: "Overtime Request Filed",
        blocks,
    })

    //AUTOMATION FOR SUPERIOR

    const blocks2 = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Overtime Request:*\n <@${emp_email}> | ${fn} ${sn}`
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*When:*\n ${moment(req.body.overtime_date).format("MMMM DD YYYY")}`
                }
                ,
                {
                  "type": "mrkdwn",
                  "text": `*Hours Rendered:*\n ${req.body.hours_rendered} hour(/s) `
                }
                ,
                {
                    "type": "mrkdwn",
                    "text": `*Reason:*\n ${req.body.overtime_reason}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Date Filed:*\n\ ${moment().format("MMM DD YYYY")}`
                }
            ]
        },
        {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": `*Approver:*\n <@${superior_email}> (${sfn} ${ssn})`
          }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": "Check Request"
                    },
                    "style": "primary",
                    "url": `https://app.kriyahr.com/hr/team-management/team-pto-and-attendance}`
                },
                
            ]
        }
    ]

    // You probably want to use a database to store any user information ;)
    let userId = '';

    try {
      // Call the users.list method using the WebClient
      const result = await universal_app.client.users.list();

      saveUsers(result.members);
    }
    catch (error) {
      console.error(error);
    }

    // Put users into the JavaScript object
    function saveUsers(usersArray) {
      usersArray.forEach(function(user){
        if(user.profile.email === req.session.user[0].superior_work_email)
        // Key user info on their unique user ID
          userId = user["id"];

          console.log(user)
        
        // Store the entire user object (you may not need all of the info)
          //usersStore[userId] = user;
      });
      console.log("User ID: ", userId)
    }


    try {
      const result = await universal_app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN_UNIVERSAL,
      channel: userId,
      //channel: 'U05JF329F18', //percy
      //channel: 'U05Q1FLRFD5', matt
      text: `You received an overtime request from <@${emp_email}>.`,
      blocks: blocks2,
    })
      console.log(result);
    }
      catch (error) {
        console.log(error)
    }

}

function GetAllPendingOvertimes(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM overtime o INNER JOIN emp e ON o.requester_id = e.emp_id WHERE e.superior_id = ? AND overtime_status = 0"

    const values = [ uid ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            res.send(data)
        }
    })
}

async function ApproveOvertime(req, res) {
    const overtime_id = req.params.overtime_id;
    const q = "UPDATE overtime SET overtime_status = 1 WHERE overtime_id = ?";

    db.query(q, 
        [overtime_id], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data)
            res.send(data)
        }
    })

    const aq = "SELECT * FROM overtime o INNER JOIN emp e ON o.requester_id = e.emp_id WHERE overtime_id = ?";

    let emp_email = ""

    await db.query(aq, 
        [overtime_id], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            emp_email = data[0].work_email
            console.log(data)
        }
    })

    console.log("RESULT", emp_email)


    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Your overtime request (OTR#${req.params.overtime_id}) has been approved.`
            }
        }
      ]
  
    // You probably want to use a database to store any user information ;)
    let userId = '';
  
    try {
      // Call the users.list method using the WebClient
      const result = await universal_app.client.users.list();
  
      saveUsers(result.members);
    }
    catch (error) {
      console.error(error);
    }
  
    // Put users into the JavaScript object
    function saveUsers(usersArray) {
      usersArray.forEach(function(user){
        if(user.profile.email === emp_email)
        // Key user info on their unique user ID
          userId = user["id"];
  
          //console.log(user)
        
        // Store the entire user object (you may not need all of the info)
          //usersStore[userId] = user;
      });
      console.log("User ID: ", userId)
    }
  
    try {
      const result = await universal_app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN_UNIVERSAL,
      channel: userId,
      text: `Your overtime request has been approved.`,
      blocks: blocks,
    })
      console.log(result);
    }
      catch (error) {
        console.log(error)
    }
}

async function RejectOvertime(req, res) {
    const overtime_id = req.params.overtime_id;
    const q = "UPDATE overtime SET overtime_status = 2 WHERE overtime_id = ?";

    db.query(q, 
        [overtime_id], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data)
            res.send(data)
        }
    })

    // Automation

    const aq = "SELECT * FROM overtime o INNER JOIN emp e ON o.requester_id = e.emp_id WHERE overtime_id = ?";

    let emp_email = ""

    await db.query(aq, 
        [overtime_id], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            emp_email = data[0].work_email
            console.log(data)
        }
    })

    console.log("RESULT", emp_email)


    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Your overtime request (OTR#${req.params.overtime_id}) has been approved.`
            }
        }
      ]
  
    // You probably want to use a database to store any user information ;)
    let userId = '';
  
    try {
      // Call the users.list method using the WebClient
      const result = await universal_app.client.users.list();
  
      saveUsers(result.members);
    }
    catch (error) {
      console.error(error);
    }
  
    // Put users into the JavaScript object
    function saveUsers(usersArray) {
      usersArray.forEach(function(user){
        if(user.profile.email === emp_email)
        // Key user info on their unique user ID
          userId = user["id"];
  
          //console.log(user)
        
        // Store the entire user object (you may not need all of the info)
          //usersStore[userId] = user;
      });
      console.log("User ID: ", userId)
    }
  
    try {
      const result = await universal_app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN_UNIVERSAL,
      channel: userId,
      text: `Your overtime request has been rejected.`,
      blocks: blocks,
    })
      console.log(result);
    }
      catch (error) {
        console.log(error)
    }
}

//SELECT * FROM overtime WHERE requester_id = 1

function GetMyOvertimes(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM overtime WHERE requester_id = ?";

    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data);
            res.send(data)
        }
    })
}

function GetOvertimesOfDownline(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM overtime o INNER JOIN emp e ON e.emp_id = o.requester_id WHERE e.superior_id = ?";

    db.query(q, 
        [uid], 
        (err,data) => {
        if (err){
            console.log(err);
            res.send("error")
        } else {
            console.log(data)
            res.send(data)
        }
    })
}


module.exports = { 
    FileOvertime,
    GetAllPendingOvertimes,
    ApproveOvertime,
    RejectOvertime,
    GetMyOvertimes,
    GetOvertimesOfDownline
}