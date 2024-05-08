var db = require("../config.js");
var nodemailer = require('nodemailer')

function AddSuperior(req, res) {
    const sid = req.body.superior_id;
    const uid = req.body.emp_id;

    const q = "UPDATE emp SET superior_id = ? WHERE emp_id = ?";

    db.query(q, [sid, uid], (err, data) => {
        if (err){
            res.send("error")
            console.log(err)
        } else {
            res.send("success")
            console.log(data)
        }
    })
}

function GetInferiorAndSuperior(req, res) {
    const cid = req.session.user[0].company_id
    //const q = "(SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, b.emp_id, b.f_name, b.m_name, b.s_name, b.superior_id FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id) UNION (SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, emp_id AS NULL, f_name AS NULL, m_name AS NULL, s_name AS NULL, superior_id AS NULL FROM emp AS a)"
    // const q = "(SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, b.emp_id, b.f_name, b.m_name, b.s_name, b.superior_id FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id ORDER BY a.f_name) UNION (SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, emp_id IS NULL, f_name IS NULL, m_name IS NULL, s_name IS NULL, superior_id IS NULL FROM emp AS a WHERE a.superior_id IS NULL ORDER BY a.f_name)";
    const q = "(SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, b.emp_id, b.f_name AS s_f_name, b.m_name AS s_m_name, b.s_name  AS s_s_name, b.superior_id FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id INNER JOIN emp_designation AS em ON em.emp_id = a.emp_id WHERE em.company_id = ? ORDER BY a.f_name ASC) UNION (SELECT a.emp_id, a.f_name, a.m_name, a.s_name, a.superior_id, a.emp_id IS NULL AS s_emp_id, f_name IS NULL AS s_f_name, m_name IS NULL AS s_m_name, s_name IS NULL AS s_s_name, superior_id IS NULL AS s_superior_id FROM emp AS a INNER JOIN emp_designation AS em ON em.emp_id = a.emp_id WHERE em.company_id = ? AND a.superior_id IS NULL ORDER BY s_f_name ASC)"


    db.query(q, [cid,cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetOwnSuperior(req, res){
    const uid = req.session.user[0].emp_id

    const q = "SELECT a.emp_id, a.emp_pic, a.superior_id, b.emp_id, b.f_name, b.s_name FROM emp AS a INNER JOIN emp AS b ON a.superior_id = b.emp_id WHERE a.emp_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetEmployee(req, res) {
    var cid = req.session.user[0].company_id

    const q = "SELECT emp_id, f_name, s_name, superior_id FROM emp WHERE company_id = ?"

    db.query(q, [cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function EscalateLeaves(req, res) {
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
                                    user: "marvin@fullsuite.ph",
                                    pass: "uggm nyyd ymnb szrx",
                                  },
                                });
                    
                                transporter.sendMail({
                                  from: "marvin@fullsuite.ph", // sender address
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

module.exports = { 
    AddSuperior,
    GetEmployee,
    GetInferiorAndSuperior,
    GetOwnSuperior,
    EscalateLeaves,
}