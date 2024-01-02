module.exports = function ptoAccrual() {
    const db = require("../../database/db.js")

    const q1 = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET emp_status = 'REGULAR', leave_balance = leave_balance + 5 " +
     "WHERE emp_status = 'PROBATIONARY' AND date_regularization = CURDATE()"
    
    db.query(q1,(err,data)=> {
        if(err) {
            console.log("Not working")
            return console.log(err)
        }
        console.log("Probationary PTO accrual done.")
    })

    const q2 = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 0.83 " +
     "WHERE emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(q2,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Regular PTO accrual done.")
    })

    const q3 = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 1.25 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'REGULAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(q3,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Tenured PTO accrual done.")
    })

    const q4 = "UPDATE emp e JOIN leave_credits l ON e.emp_id = l.emp_id " +
    "SET leave_balance = leave_balance + 0.625 " +
    "WHERE date_hired < DATE_SUB(NOW(),INTERVAL 1 YEAR) AND emp_status = 'WORKING_SCHOLAR' AND LAST_DAY(CURDATE()) = CURDATE()"
    
    db.query(q4,(err,data)=> {
        if(err) {
            return console.log(err)
        }
        console.log("Working Scholar accrual done.")
    })
}
