var db = require("../config.js");
var isEmpty = require('lodash.isempty');
var moment = require('moment');
var nodemailer = require('nodemailer')

function FileLeave(req, res){

    const uid = req.session.user[0].emp_id;

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

    if (!isEmpty(req.body.leave_type) && !isEmpty(req.body.leave_from) && !isEmpty(req.body.leave_to) && !isEmpty(req.body.approver_id)){

        db.query(q, [values], (err, data) => {
            if(err) {
                res.send("error")
                console.log(err)
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

        const q2 = "SELECT work_email FROM emp WHERE emp_id = ?";

        db.query(q2, [req.body.approver_id], (err, data) => {
            if (err) return console.log(err); 

            else {
                try {
                    let transporter = nodemailer.createTransport({
                      service: "Gmail",
                      host: "smtp.gmail.com",
                      port: 465,
                      secure: true,
                      auth: {
                        user: "marvin@fullsuite.ph",
                        pass: "uggm nyyd ymnb szrx",
                      },
                    });
        
                    transporter.sendMail({
                      from: "marvin@fullsuite.ph", // sender address
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
            
                                          <p style="color: #0097B2">
                                            ${req.body.leave_type}
                                          </p>
        
                                          <br><br>
        
                                          <p style="font-weight: 100;">
                                            Leave reason: 
                                            </p>
          
                                            <p style="color: #0097B2">
                                            ${req.body.leave_reason}
                                            </p>
        
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
            }
        })


    } else {
        res.send("error")
    }

}

function ApproveLeave(req, res) {
    const leave_id = req.params.leave_id;
    const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

    db.query(q, [1, leave_id], (err,data) => {
        if (err){
            console.log(err)
        } else {
            // res.json("Leave #" + leave_id + "has been updated successfully.");

            q2 = "SELECT leave_type, leave_reason, requester_id FROM leaves WHERE leave_id = ?";

            db.query(q2, leave_id, (err, data2) => {
                if(err) {
                    console.log(err);
                } else {
                    q3 = "SELECT work_email FROM emp WHERE emp_id = ?";

                    db.query(q3, [data2[0].requester_id], (err, data3) => {
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
                                    user: "marvin@fullsuite.ph",
                                    pass: "uggm nyyd ymnb szrx",
                                  },
                                });
                    
                                transporter.sendMail({
                                  from: "marvin@fullsuite.ph", // sender address
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
                                }); } catch(e) {
                                    console.log(e);
                                }
                        }
                    })
                }
            })
        }
    })
}

function RejectLeave(req, res) {
    const leave_id = req.params.leave_id;
    const q = "UPDATE leaves SET leave_status = ? WHERE leave_id = ?";

    db.query(q, 
        [2, leave_id], 
        (err,data) => {
        if (err){
            console.log(err)
        } else {
            //res.json("Leave #" + leave_id + "has been updated successfully.")

            q2 = "SELECT leave_type, leave_reason, requester_id FROM leaves WHERE leave_id = ?";

            db.query(q2, leave_id, (err, data2) => {
                if(err) {
                    console.log(err);
                } else {
                    q3 = "SELECT work_email FROM emp WHERE emp_id = ?";

                    db.query(q3, [data2[0].requester_id], (err, data3) => {
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
                                    user: "marvin@fullsuite.ph",
                                    pass: "uggm nyyd ymnb szrx",
                                  },
                                });
                    
                                transporter.sendMail({
                                  from: "marvin@fullsuite.ph", // sender address
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
                                }); } catch(e) {
                                    console.log(e);
                                }
                        }
                    })
                }
            })
        }
    })
}

function ReturnTemporaryPTO(req, res) {
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
}


function AllApprovers(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM emp JOIN dept ON emp_id = manager_id JOIN division ON dept.div_id = division.div_id WHERE emp.emp_role = 3 AND emp.emp_id != ? ORDER BY emp.f_name"

    db.query(q,[uid],
        (err,data)=> {
        if(err) { return res.json(err) }
        return res.json(data)
    })
}

function AllHolidays(req, res) {

    const q = "SELECT * FROM holiday";

    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllMyPendingLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 0 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function BlockMyPendingLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT leave_from, leave_to FROM leaves WHERE leave_status = 0 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function BlockMyApprovedLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT leave_from, leave_to FROM leaves WHERE leave_status = 1 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
}

function AllMyApprovedLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM leaves WHERE leave_status = 1 AND requester_id = ?"

    db.query(q,uid, (err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
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

}