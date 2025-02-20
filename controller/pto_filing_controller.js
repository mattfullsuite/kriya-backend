var db = require("../config.js");
var isEmpty = require("lodash.isempty");
var moment = require("moment");
var nodemailer = require("nodemailer");

var Slack = require("@slack/bolt")
var dotenv = require("dotenv")

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const api_app = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET_PTO,
    token: process.env.SLACK_BOT_TOKEN_PTO,
})

const universal_app = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET_UNIVERSAL,
  token: process.env.SLACK_BOT_TOKEN_UNIVERSAL,
})

async function FileLeave(req, res){

    const uid = req.session.user[0].emp_id;
    const sid = req.session.user[0].superior_id;

    const emp_num = req.session.user[0].emp_num;

    const fn = req.session.user[0].f_name;
    const sn = req.session.user[0].s_name;

    const sen = req.session.user[0].superior_emp_num;
    const sfn = req.session.user[0].superior_f_name;
    const ssn = req.session.user[0].superior_s_name;

    const emp_email = req.session.user[0].work_email.substring(0, req.session.user[0].work_email.indexOf("@"))
    const superior_email = req.session.user[0].superior_work_email.substring(0, req.session.user[0].superior_work_email.indexOf("@"))
   

    const blocks2 = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*Leave Request:*\n <@${emp_email}> | ${fn} ${sn} (${emp_num}) - ${req.body.leave_type} Request`
                }
            },
            {
                "type": "section",
                "fields": [
                    (req.body.leave_from === req.body.leave_to) ?
                    {
                        "type": "mrkdwn",
                        "text": `*When:*\n ${moment(req.body.leave_from).format("MMMM DD YYYY")}`
                    }
                    :
                    {
                      "type": "mrkdwn",
                      "text": `*When:*\n ${moment(req.body.leave_from).format("MMMM DD YYYY")} to ${moment(req.body.leave_to).format("MMMM DD YYYY")}`
                    }
                    ,
                    (req.body.use_pto_points > 0) ? 
                    {
                      "type": "mrkdwn",
                      "text": `*Type:*\n Paid Leave (${req.body.use_pto_points} PTO used) | ${req.body.leave_type}`
                    }
                    :
                    {
                      "type": "mrkdwn",
                      "text": `*Type:*\n Unpaid Leave | ${req.body.leave_type}`
                    }
                    ,
                    {
                        "type": "mrkdwn",
                        "text": `*Reason:*\n ${req.body.leave_reason}`
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

    const blocks = [
        (JSON.stringify(req.body.leave_type).includes("Half Day")) ?
        {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": `Hi! <@${emp_email}> is on half day leave on ${moment(req.body.leave_from).format("MMM DD YYYY")}. Sent a request to <@${superior_email}> for approval. Thank you!`
          }
        }
        :
        (req.body.leave_from === req.body.leave_to) ?
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": `Hi! <@${emp_email}> will be out of office on ${moment(req.body.leave_from).format("MMM DD YYYY")}. Sent a request to <@${superior_email}> for approval. Thank you!`
              }
          }
          :
          {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Hi! <@${emp_email}> will be out of office on ${moment(req.body.leave_from).format("MMM DD YYYY")} to ${moment(req.body.leave_to).format("MMM DD YYYY")}. Sent a request to <@${superior_email}> for approval. Thank you!`
            }
          }
          ,
        ]
    

    const q = "INSERT INTO leaves (`requester_id`, `leave_type`, `leave_reason`, `leave_from`, `leave_to`, `leave_status`, `approver_id`, `use_pto_points`) VALUES (?)" 
    const values = [
        uid, //1
        req.body.leave_type,
        req.body.leave_reason,
        req.body.leave_from,
        req.body.leave_to,
        0, //pending
        //req.body.approver_id,//JHex
        sid,
        req.body.use_pto_points,
    ]


    await api_app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN_PTO,
        channel: process.env.SLACK_CHANNEL_PTO,
        text: "Leave Filed",
        blocks,
    })

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
      text: `You received a leave request from <@${emp_email}>.`,
      blocks: blocks2,
    })
      console.log(result);
    }
      catch (error) {
        console.log(error)
    }



    if (!isEmpty(req.body.leave_type) && !isEmpty(req.body.leave_from) && !isEmpty(req.body.leave_to)){

        db.query(q, [values], (err, data) => {
            if(err) {
                res.send("error")
                console.log(err)
            }
            else {
                res.send("success")
            }
        })

    const q1 =
      "UPDATE emp AS e JOIN leave_credits l ON e.emp_id = l.emp_id SET leave_balance = leave_balance - " +
      req.body.use_pto_points +
      " WHERE l.emp_id = ?";

    db.query(q1, [uid], (err, data) => {
      if (err) return console.log(err);
      return console.log(data);
    });

    const q2 = "SELECT work_email FROM emp WHERE emp_id = ?";

        db.query(q2, [sid], (err, data) => {
            if (err) return console.log(err); 

            else {
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
                      to: data[0].work_email, // list of receivers
                      subject: `Leave Request | ${req.session.user[0].f_name + " " + req.session.user[0].s_name}`, // Subject line
                      text: "Leave Request", // plain text body
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
                                      <h2 style="font-size: 28px;font-weight: 900;">Leave Request</h2>
                                          
                                          <p style="font-weight: 100;">
                                            Leave type: 
                                          </p>
            
                        <p style="color: #0097b2">${req.body.leave_type}</p>
            
                        <br /><br />
            
                        <p style="font-weight: 100">Leave reason:</p>
            
                        <p style="color: #0097b2">${req.body.leave_reason}</p>
            
                        <p style="margin-top: 100px;">For more information, go to:</p><a href="https://app.kriyahr.com">https://app.kriyahr.com</a>
            
                        <h2 style="font-size: 28px; font-weight: 900">
                          the <span style="color: #0097b2">f</span>ull<span
                            style="color: #0097b2"
                            >s</span
                          >uite HRIS team.
                        </h2>
                      </td>
                    </tr>
                  </table>
            
                  <!--Footer Row-->
                  <table
                    role="presentation"
                    bgcolor="#EAF0F6"
                    width="100%"
                    style="margin-top: 50px"
                  >
                    <tr>
                      <td align="center" style="padding: 30px 30px; vertical-align: top">
                        <p style="font-size: 11px; font-weight: 100">
                          166-C Military Cutoff Road, Baguio City, Benguet Purok 2,
                          Poblacion, Lianga, Surigao del Sur
                        </p>
                      </td>
                    </tr>
                  </table>
            
                  <table role="presentation" width="100%">
                    <tr>
                      <img
                        alt="logo"
                        src="https://fullsuite.ph/wp-content/uploads/2023/09/3-1-1.png"
                        height="200px"
                        width="100%"
                        align="middle"
                      />
                    </tr>
                  </table>
                </div>
              </body>
            </html>
            `,
          });
        } catch (e) {
          console.log(e);
        }
      }
    });
  } else {
    res.send("error");
  }
}

async function ApproveLeave(req, res) {
  const leave_id = req.params.leave_id;
  const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

  let emp_email = ""

  await db.query(q, [1, leave_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      q2 =
        "SELECT leave_type, leave_reason, requester_id FROM leaves WHERE leave_id = ?";

      db.query(q2, leave_id, (err, data2) => {
        if (err) {
          console.log(err);
        } else {
          q3 = "SELECT work_email FROM emp WHERE emp_id = ?";

          db.query(q3, [data2[0].requester_id], (err, data3) => {
            if (err) {
              console.log(err);
            } else {

              emp_email = data3[0].work_email;

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
                  to: data3[0].work_email, // list of receivers
                  subject: `Leave approved | ${data2[0].leave_type}`, // Subject line
                  text: "Leave Request", // plain text body
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
                                                  <h2 style="font-size: 28px;font-weight: 900;">Leave Approved | ${data2[0].leave_type}</h2>
                                                      
                                                      <p style="font-weight: 100;">
                                                        Your leave was approved. A gentle reminder to be responsible in filing a leave.
                                                      </p>
                    
                                                      <br><br>
                    
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
                console.log(e);
              }
              res.json("Leave #" + leave_id + "has been updated successfully.");
            }
          });
        }
      });
    }
  });

  const blocks = [
      {
          "type": "section",
          "text": {
              "type": "mrkdwn",
              "text": `Your leave request (L#${req.params.leave_id}) has been approved.`
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
    text: `Your leave request has been approved.`,
    blocks: blocks,
  })
    console.log(result);
  }
    catch (error) {
      console.log(error)
  }
}

async function RejectLeave(req, res) {
  const leave_id = req.params.leave_id;
  const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

  let emp_email = ""

  await db.query(q, [2, leave_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      q2 =
        "SELECT leave_type, leave_reason, requester_id FROM leaves WHERE leave_id = ?";

      db.query(q2, leave_id, (err, data2) => {
        if (err) {
          console.log(err);
        } else {
          q3 = "SELECT work_email FROM emp WHERE emp_id = ?";

          db.query(q3, [data2[0].requester_id], (err, data3) => {
            if (err) {
              console.log(err);
            } else {

              emp_email = data3[0].work_email;

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
                  to: data3[0].work_email, // list of receivers
                  subject: `Leave declined | ${data2[0].leave_type}`, // Subject line
                  text: "Leave Declined", // plain text body
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
                                                  <h2 style="font-size: 28px;font-weight: 900;">Leave Declined | ${data2[0].leave_type}</h2>
                                                      
                                                      <p style="font-weight: 100;">
                                                        Your leave was declined. A gentle reminder to be responsible in filing a leave.
                                                      </p>
                    
                                                      <br><br>
                    
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
                console.log(e);
              }

              res.json("Leave #" + leave_id + "has been updated successfully.");
            }
          });
        }
      });
    }
  });

  const blocks = [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `Your leave request [LR#${req.params.leave_id}] has been rejected.`
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
    text: `Your leave request has been rejected.`,
    blocks: blocks,
  })
    console.log(result);
  }
  catch (error) {
    console.log(error)
  }
}

async function EscalateLeaves(req, res) {
  const leave_id = req.params.leave_id;
  const superior_id = req.session.user[0].superior_id
  const q = "UPDATE leaves SET approver_id = ? WHERE leave_id = ?";

  db.query(q, [superior_id, leave_id], (err, data2) => {
      if (err){
          console.log(err)
      } else {
          console.log("1st step done: " + data2)
          console.log("Successfully escalated " + leave_id + " to " + superior_id)

          q3 = "SELECT work_email FROM emp WHERE emp_id = ?";

                  db.query(q3, [req.session.user[0].superior_id], (err, data3) => {
                      if(err) {
                          console.log(err);
                      } else {

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
                                to: data3[0].work_email, // list of receivers
                                subject: `Leave Request | Escalated by ${req.session.user[0].f_name} `, // Subject line
                                text: "Leave Request", // plain text body
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
                                                <h2 style="font-size: 28px;font-weight: 900;">Leave Request | Escalated by ${req.session.user[0].f_name}</h2>
                                                    
                                                    <p style="font-weight: 100;">
                                                      A leave was escalated to your name.
                                                    </p>
                  
                                                    <br><br>
                  
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
                              }); } catch(e) {
                                  console.log(e);
                              }
                              
                              res.json("Leave #" + leave_id + "has been escalated successfully.");
                      }
                  })
      }
  })

}

function ReturnTemporaryPTO(req, res) {
  const leave_id = req.params.leave_id;

  const q =
    "UPDATE leaves AS l JOIN leave_credits AS lc ON l.requester_id=lc.emp_id SET leave_balance = leave_balance + use_pto_points WHERE leave_id = ?";

  db.query(q, [leave_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json("Ptos have been returned for " + leave_id + "");
    }
  });
}

function AllApprovers(req, res) {
  const uid = req.session.user[0].emp_id;
  const cid = req.session.user[0].company_id;
  //const q = "SELECT * FROM emp AS e INNER JOIN dept AS d ON e.emp_id = d.manager_id INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN division AS di ON d.div_id = di.div_id WHERE e.emp_id != ? AND company_id = ? ORDER BY e.f_name"
  const q =
    "SELECT * FROM emp AS e INNER JOIN dept AS d ON e.emp_id = d.manager_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE e.emp_id != ? AND company_id = ? ORDER BY e.f_name";

  db.query(q, [uid, cid], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
}

function AllHolidays(req, res) {
  const cid = req.session.user[0].company_id;

  const q = "SELECT * FROM holiday WHERE company_id = ?";

  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function AllMyPendingLeaves(req, res) {
  const uid = req.session.user[0].emp_id;
  const q = "SELECT * FROM leaves WHERE leave_status = 0 AND requester_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function BlockMyPendingLeaves(req, res) {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT leave_from, leave_to FROM leaves WHERE leave_status = 0 AND requester_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function BlockMyApprovedLeaves(req, res) {
  const uid = req.session.user[0].emp_id;
  const q =
    "SELECT leave_from, leave_to FROM leaves WHERE leave_status = 1 AND requester_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function AllMyApprovedLeaves(req, res) {
  const uid = req.session.user[0].emp_id;
  const q = "SELECT * FROM leaves WHERE leave_status = 1 AND requester_id = ?";

  db.query(q, uid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  FileLeave,
  AllApprovers,
  AllHolidays,
  AllMyPendingLeaves,
  AllMyApprovedLeaves,
  ApproveLeave,
  RejectLeave,
  ReturnTemporaryPTO,
  BlockMyPendingLeaves,
  BlockMyApprovedLeaves,
  EscalateLeaves
  //GenerateReason,
};
