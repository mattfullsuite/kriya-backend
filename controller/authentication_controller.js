var db = require("../config.js");
const bcrypt = require("bcryptjs");
//var ip = require('ip');
//var geoip = require('geoip-lite');
const express = require("express");
var Slack = require("@slack/bolt")
//const requestIp = require('request-ip')

const universal_app = new Slack.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET_UNIVERSAL,
  token: process.env.SLACK_BOT_TOKEN_UNIVERSAL,
})

function HomeHandler(req, res) {
  res.json("Hi hmmm ano kaya dito?");

  res.end();
}

function LoginHandler(req, res) {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
}

function Logout(req, res) {
  if (req.session.user) {
    res.clearCookie("userId");
    res.clearCookie("HRISUserCookie");
    req.session.destroy();
    res.send({ loggedIn: false });
  }
}

async function processLogin(req, res) {
  const work_email = req.body.work_email;
  const password = req.body.password;
  // const latitude = req.body.latitude;
  // const longitude = req.body.longitude;
  // const country = req.body.country;
  // const ipAddress = req.body.ipAddress;
  // const city = req.body.city;
  // const postal = req.body.postal;

  //console.log(latitude + " , " + longitude + " , " + country + " , " + ipAddress)
  //let ipa = req.headers['x-original-forwarded-for']
  // var clientIp = requestIp.getClientIp(req)

  // var geo = geoip.lookup(clientIp);

  // console.log("IP4: " + clientIp)

  // You probably want to use a database to store any user information ;)
  let userProfilePic = '';

  // try {
  //   // Call the users.list method using the WebClient
  //   const result = await universal_app.client.users.list();

  //   saveUsers(result.members);
  // }
  // catch (error) {
  //   console.error(error);
  // }

  // // Put users into the JavaScript object
  // function saveUsers(usersArray) {
  //   usersArray.forEach(function(user){
  //     if(user.profile.email === work_email)
  //     // Key user info on their unique user ID
  //       userProfilePic = user.profile["image_192"];

  //       //console.log(user)
      
  //     // Store the entire user object (you may not need all of the info)
  //       //usersStore[userId] = user;
  //   });
  //   //console.log(usersArray)
  //   console.log("User Profile Pic: ", userProfilePic)
  // }

  db.query(
    //"SELECT * FROM emp WHERE work_email = ? AND date_separated IS NULL",
    //"SELECT * FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN company AS c ON c.company_id = em.company_id WHERE e.work_email = ? AND e.emp_role != 0 AND date_separated IS NULL",

    //"SELECT e.*, em.*, p.*, d.*, c.*, e2.emp_id AS hasDownline FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN company AS c ON c.company_id = em.company_id LEFT JOIN emp e2 ON e.emp_id = e2.superior_id WHERE e.work_email = ? AND e.emp_role != 0 AND e.date_separated IS NULL"
    "SELECT e.*, em.*, p.*, d.*, c.*, e2.emp_id AS hasDownline, e3.f_name AS superior_f_name, e3.s_name AS superior_s_name, e3.emp_num AS superior_emp_num, e3.work_email AS superior_work_email FROM emp AS e LEFT JOIN emp_designation AS em ON e.emp_id = em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id LEFT JOIN dept AS d ON d.dept_id = p.dept_id LEFT JOIN company AS c ON c.company_id = em.company_id LEFT JOIN emp e2 ON e.emp_id = e2.superior_id LEFT JOIN emp e3 ON e.superior_id = e3.emp_id LEFT JOIN hr_access ha ON e.emp_id = ha.hr_id WHERE e.work_email = ? AND e.emp_role != 0 AND (e.date_separated IS NULL OR CURDATE() < e.date_separated)",
    [work_email],
    (err, result) => {
      if (err) {
        res.send(err);
      } else if (result.length > 0) {
        console.log(result[0].password);
        const hash = result[0].password;

        bcrypt.compare(password, hash, (err, match) => {
          if (err) console.log(err);
          else {
            if (match) {
              req.session.user = result;
              console.log(req.session.user);
              res.send(result[0]);

              // const a = "UPDATE emp SET emp_pic = ? WHERE work_email = ?";
              
              // const a =
              //   "INSERT INTO auth_logs (`log_type`, `log_desc`,`emp_id`) VALUES (?)";

              // const values = [
              //   "SUCCESS",
              //   result[0].f_name +
              //     " " +
              //     result[0].s_name +
              //     " has successfully logged in to the system.",
              //   result[0].emp_id,
              //   // (ipAddress != null) ? ipAddress : ip.address(),
              //   // longitude,
              //   // latitude,
              //   // country,
              //   // city,
              //   // postal,
              // ];

              // //console.log(ip.address())
              // //console.log(geo)

              // db.query(a, [userProfilePic, work_email], (err, data) => {
              //   if (err) console.log(err);
              //   console.log(
              //     req.session.user[0].emp_id +
              //       " has successfully logged in the system."
              //   );
              // });
            } else {
              res.send("error");

              //const a = "INSERT INTO auth_logs (`log_type`,`log_desc`,`ip_address`, `latitude`, `longitude`, `country_code`, `city`, `postal`) VALUES (?)";
              // const a =
              //   "INSERT INTO auth_logs (`log_type`,`log_desc`) VALUES (?)";

              // const values = [
              //   "FAIL",
              //   "Failed attempt to log in using " + work_email,
              //   // (ipAddress != null) ? ipAddress : ip.address(),
              //   // longitude,
              //   // latitude,
              //   // country,
              //   // city,
              //   // postal,
              // ];

              // db.query(a, [values], (err, data) => {
              //   if (err) console.log(err);
              //   //console.log("There is an unauthorized log in for " + work_email + " on " + (ipAddress != null) ? ipAddress : ip.address());
              // });
            }
          }
        });
      } else {
        res.send("error");
      }
    }
  );
}

module.exports = {
  HomeHandler,
  LoginHandler,
  Logout,
  processLogin,
};
