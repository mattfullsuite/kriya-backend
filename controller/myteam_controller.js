var db = require("../config.js");
var moment = require("moment");

function GetDepartmentLeaves(req, res) {
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM `leave_credits` AS l INNER JOIN `emp` AS e ON l.emp_id = e.emp_id WHERE e.emp_id = ?"
8
    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
}

function GetDepartmentLeavesToday(req, res){
    const uid = req.session.user[0].emp_id;
    const today = moment().format("YYYY/MM/DD");
  
    const q =
      "SELECT * FROM leaves INNER JOIN emp ON requester_id = emp_id WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to";
  
    db.query(q, [uid, today], (err, data) => {
      if (err) {
        return res.json(err);
      }
  
      return res.json(data);
    });
  }

// app.get("/numofdeptleavestoday", (req, res) => {
//     const uid = req.session.user[0].emp_id;
//     const today = moment().format("YYYY/MM/DD");
  
//     const q =
//       "SELECT * FROM leaves WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to";
  
//     db.query(q, [uid, today], (err, data) => {
//       if (err) {
//         return res.json(err);
//       }
  
//       return res.json(data);
//     });
//   });

function NumberOfLeavesForPastFiveMonths(req, res){

    const startOfMonth = moment().subtract(6, 'months').endOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().subtract(6, 'months').endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}
  
function NumberOfLeavesForPastFourMonths(req, res){

    const startOfMonth = moment().subtract(5, 'months').endOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().subtract(5, 'months').endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForPastThreeMonths(req, res){

    const startOfMonth = moment().subtract(4, 'months').endOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().subtract(4, 'months').endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForPastTwoMonths(req, res){

    const startOfMonth = moment().subtract(2, 'months').endOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().subtract(2, 'months').endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForPastMonth(req, res){

    const startOfMonth = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForCurrentMonth(req, res){

    //.subtract(1, 'months')

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForCurrentWeek(req, res){

    //.subtract(1, 'months')

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForPastWeek(req, res){

    //.subtract(1, 'months')

    const startOfWeek = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForPastTwoWeeks(req, res){

    //.subtract(1, 'months')

    const startOfWeek = moment().subtract(2, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(2, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function NumberOfLeavesForPastThreeWeeks(req, res){

    //.subtract(1, 'months')

    const startOfWeek = moment().subtract(3, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(3, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id WHERE (leave_from > ?) AND (leave_to < ?) ORDER BY leave_from"

    db.query(q, [startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function ShowAllDepartmentLeavesExceptPending(req, res) {
    const uid = req.session.user[0].emp_id;
  
    const q =
      "SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status != 0 AND approver_id = ? ORDER BY date_filed DESC";
  
    db.query(q, [uid], (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json(data);
    });
  };

function ShowAllDepartmentLeavesOfTeam(req, res){
    //const uid = req.session.user[0].emp_id;
    const did = req.session.user[0].dept_id;

    const q =
      //"(SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status = 0 AND approver_id = ?) JOIN (SELECT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id=e.emp_id WHERE leave_status != 0 AND approver_id = ?) ORDER BY date_filed";
      "(SELECT e.emp_id, e.f_name, e.s_name, e.emp_pic, lc.leave_balance, (SELECT COUNT(*) FROM leaves WHERE leave_status = 0 AND requester_id = e.emp_id) AS pending, (SELECT COUNT(*) FROM leaves WHERE leave_status = 1 AND requester_id = e.emp_id) AS approved, (SELECT COUNT(*) FROM leaves WHERE leave_status = 2 AND requester_id = e.emp_id) AS declined FROM leaves AS l INNER JOIN emp AS e ON e.emp_id = l.requester_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id WHERE d.dept_id = ? GROUP BY l.requester_id, lc.leave_balance, p.position_name, pending, declined, approved, e.emp_id, e.f_name, e.s_name, e.emp_pic) UNION (SELECT e.emp_id, e.f_name, e.s_name, e.emp_pic, lc.leave_balance, 0 AS pending, 0 AS approved, 0 AS declined FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id INNER JOIN position AS p ON p.position_id = em.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id WHERE e.emp_id NOT IN (SELECT requester_id FROM leaves) AND d.dept_id = ? GROUP BY lc.leave_balance, p.position_name, pending, declined, approved, e.emp_id, e.f_name, e.s_name, e.emp_pic)"
      //"SELECT DISTINCT * FROM leaves AS l INNER JOIN emp AS e ON l.requester_id = e.emp_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id WHERE d.dept_id = ?"
    db.query(q, [did, did], (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json(data);
    });
}

function CheckIfDownline(req, res){
    const uid = req.session.user[0].emp_id;

    const q = "SELECT * FROM emp WHERE superior_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err) {
          return res.json(err);
        }
        return res.json(data);
    });
}




module.exports = {
    GetDepartmentLeaves,
    GetDepartmentLeavesToday,
    NumberOfLeavesForPastFiveMonths,
    NumberOfLeavesForPastFourMonths,
    NumberOfLeavesForPastThreeMonths,
    NumberOfLeavesForPastTwoMonths,
    NumberOfLeavesForPastMonth,
    NumberOfLeavesForCurrentMonth,
    NumberOfLeavesForCurrentWeek,
    NumberOfLeavesForPastWeek,
    NumberOfLeavesForPastTwoWeeks,
    NumberOfLeavesForPastThreeWeeks,
    ShowAllDepartmentLeavesExceptPending,
    ShowAllDepartmentLeavesOfTeam,
    CheckIfDownline,
};