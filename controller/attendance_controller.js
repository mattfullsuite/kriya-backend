var db = require("../config.js");
var moment = require("moment");

function InsertAttendanceIntoDatabase(req, res) {

    const data = req.body;
    //console.log(JSON.stringify(data))

    // const q = "INSERT INTO attendance (`employee_id`, `surname`, `department`, `date`, `time_in`, `time_out`, `hours_logged`, `total_break`, `hours_worked`, `status`, `undertime`) VALUES (?)"

    
    data.map((d) => {

        const q1 = "SELECT start FROM emp_shift WHERE emp_num = ?"

        db.query(q1, [d[0]], (err, data) => {

            console.log("DATA: ", data)
            if (err){
                console.log(err)
            } else {
            
                    //const tin = (d[2] !== "FS-NS") ? moment(d[4], "HH:mm:ss a") : moment(d[5], "HH:mm:ss a");
                    //const tout = (d[2] !== "FS-NS") ? moment(d[5], "HH:mm:ss a") : moment(d[4], "HH:mm:ss a").add(1, "days");

                    const tin = moment(d[4], "HH:mm:ss a")
                    //const tout = moment(d[5], "HH:mm:ss a")
                    const tout = moment(("0" + d[5]).slice(-5), "HH:mm:ss a")

                    const convertedOut = moment(d[5], 'HH:mm:ss').format('HH:mm')

                    console.log("tin: ", tin)
                    console.log("tout: ", tout)

                    // const hw = (!parseInt(d[4]) || !parseInt(d[5])) 
                    // ?
                    // ('0' + parseInt(moment.duration(tout.diff(tin)).asHours())).slice(-2) 
                    // + "h " 
                    // + ('0' + (parseInt(moment.duration(tout.diff(tin)).asMinutes()) % 60)).slice(-2)
                    // + "m"
                    // : null

                    const hw = (!parseInt(d[4]) || !parseInt(d[5])) 
                    ?
                    null
                    :
                    (tin < tout) 
                    ?
                    ('0' + parseInt(moment.duration(tout.diff(tin)).asHours())).slice(-2) 
                    + "h " 
                    + ('0' + (parseInt(moment.duration(tout.add(1, "days").diff(tin)).asMinutes()) % 60)).slice(-2)
                    + "m"
                    :
                    ('0' + parseInt(moment.duration(tout.add(1, "days").diff(tin)).asHours())).slice(-2) 
                    + "h " 
                    + ('0' + (parseInt(moment.duration(tout.diff(tin)).asMinutes()) % 60)).slice(-2)
                    + "m"


                    var st = (d[4] == null || d[4] == "" || d[5] == null || d[5] == "") ? "Data Incomplete" : (data == null || data == "") ? "No Shift Registered" : (moment(data[0].start, "HH:mm:ss a") > tin) ? "Early Start" : "Late Start"

                    var un = (d[4] == null || d[4] == "" || d[5] == null || d[5] == "") ? null : (parseInt(moment.duration(tout.diff(tin)).asHours()) >= 8) ? "Completed" : "Undertime"

                    // console.log("1: ", d[0]) //ID
                    // console.log("2: ", d[1]) // Name
                    // console.log("3: ", d[2]) // Cluster
                    // console.log("4: ", d[3]) // date
                    // console.log("5: ", d[4]) // time in
                    // console.log("6: ", d[5]) // time out
                    // console.log("7: ", d[6]) // hours logged
                    // console.log("8: ", d[7]) // total break
                    // console.log("9: ", d[8]) // hours worked
                    // console.log("10: ", d[9]) // status
                    // console.log("11: ", d[10]) // undertime

                    var values =
                    // (d[2] !== "FS-NS") ?
                    [
                        d[0], 
                        d[3], 
                        d[4],
                        convertedOut, 
                        hw,
                        st, 
                        un, 
                    ]
                    // :
                    // [
                    //     d[0], 
                    //     d[3], 
                    //     d[5],
                    //     d[4], 
                    //     hw,
                    //     st, 
                    //     un, 
                    // ]

                    const q2 = "INSERT INTO attendance (`employee_id`, `date`, `time_in`, `time_out`, `hours_worked`, `status`, `undertime`) VALUES (?)"
                    
                
                    db.query(q2, [values], (err, data) => {

                        if (err){
                            console.log(err)
                        } else {
                            console.log("Added.")
                        }
                    })

                

            }
        })
    })
    
    console.log("Successfully added everything in database!");
}

function ChangeValuesInDatabase(req, res) {

    const q = "SELECT * FROM attendance"

    data.map((d) => {
        db.query(q, [d], (err, data) => {
            if (err){
                console.log(err)
            } else {
                console.log("Added.")
            }
        })
    })
    
    console.log("Successfully added everything in database!");
}

function GetLimitedAttendance(req, res) {
    const unum = req.session.user[0].emp_num
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 5";

    db.query(q, [unum], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetAttendance(req, res) {
    const unum = req.session.user[0].emp_num
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC";

    db.query(q, [unum], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetUndertimeAttendance(req, res){
    const unum = req.session.user[0].emp_num
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 5";

    db.query(q, [unum], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMyLeaves(req, res){
    const uid = req.session.user[0].emp_id
    const q = "SELECT leave_id, leave_from, leave_to, use_pto_points FROM leaves WHERE requester_id = ?";

    db.query(q, [uid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

//Get List Of Employees with Status

function GetEmployeesWithStatusForAttendance(req, res){
    const cid = req.session.user[0].company_id;
    //const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name`
    const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type`
    
    db.query(q, [cid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

//Paginated Version

function GetPaginatedEmployeesWithStatusForAttendance(req, res) {
    var cid = req.session.user[0].company_id;

    const { limit = 10, page = 1 } = req.query;

    //const q1 = `SELECT COUNT(*) AS count FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Regular'`
    //const q1 = `SELECT COUNT(*) AS count FROM (SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type) a`
    const q1 = `SELECT COUNT(*) AS count FROM (SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, COUNT(case when a.status = 'Completed' then 1 else null end) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type) a`

    db.query(q1, [cid], (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            //const q2 = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type LIMIT ? OFFSET ?`
            const q2 = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, COUNT(case when a.status = 'Completed' then 1 else null end) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type LIMIT ? OFFSET ?`

            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);


            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [cid, parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
  
}

//Search Attendance Status

function SearchAttendanceStatus(req, res) {
    var cid = req.session.user[0].company_id;

    const { searchTerm = "" } = req.query;

    const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, COUNT(case when a.status = 'Completed' then 1 else null end) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE CONCAT(e.emp_id, a.employee_id, e.f_name, e.s_name) LIKE ? AND ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type`

    const st = "%" + searchTerm + "%";

    db.query(q, [st, cid], (err, data) => {
        if (err){ 
            return res.json(err)
        } else { 
            return res.send(data)
        }
    })
}

//Get Attendance of a Certain Employee

function GetOneStatusForAttendance(req, res){
    const eid = req.body.employee_id
    //const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num LEFT JOIN emp_shift es ON es.emp_num = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id INNER JOIN position p ON p.position_id = ed.position_id WHERE e.emp_num = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name`
    const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id 
    LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE e.emp_num = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type`

    db.query(q, [eid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetAttendanceOfOne(req, res){
    const eid = req.body.employee_id
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    //const q = "SELECT * FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num WHERE a.employee_id = ? ORDER BY date DESC"
    const q = "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC"
    
    db.query(q, [eid], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Paginated Version

function GetPaginatedAttendanceOfOne(req, res) {

    const { employeeNumber = "", limit = 10, page = 1 } = req.query;

    let parsedEmployeeNumber = employeeNumber

    console.log(req.query)

    //const q1 = `SELECT COUNT(*) AS count FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Regular'`
    const q1 = `SELECT COUNT(*) AS count FROM attendance WHERE employee_id = ? ORDER BY date DESC`
    
    db.query(q1, [employeeNumber], (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            const q2 = `SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT ? OFFSET ?`
            
            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);


            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [parsedEmployeeNumber, parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
  
}

function DisableDatesOfOne(req, res){
    console.log("DISABLE ID: ", req.body.employee_id)
    const eid = req.body.employee_id
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    //const q = "SELECT * FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num WHERE a.employee_id = ? ORDER BY date DESC"
    const q = "SELECT date FROM attendance WHERE employee_id = ? ORDER BY date DESC"
    
    db.query(q, [eid], (err, data) => {
      if (err) return res.json(err);
      return res.send(data);
    });
}

//Change Attendance

function ChangeAttendanceOfOne(req, res){

    console.log(req.body)

    const q1 = "SELECT start FROM emp_shift WHERE emp_num = ?"

        db.query(q1, [req.body.emp_num], (err, data) => {

            console.log("DATA: ", data)
            if (err){
                console.log(err)
            } else {
                const tin = moment(req.body.time_in, "HH:mm:ss a");
                const tout = moment(req.body.time_out, "HH:mm:ss a");

                const hw = (tin !== null && tout !== null) ? ('0' + parseInt(moment.duration(tout.diff(tin)).asHours())).slice(-2) 
                + "h " 
                + ('0' + (parseInt(moment.duration(tout.diff(tin)).asMinutes()) % 60)).slice(-2)
                + "m"
                : null

                //var st = (tin == null || tin == "" || tout == null || tout == "") ? "Data Incomplete" : "Early Start"

                var st = (tin == null || tin == "" || tout == null || tout == "") ? "Data Incomplete" : (data == null || data == "") ? "No Shift Registered" : (moment(data[0].start, "HH:mm:ss a") > tin) ? "Early Start" : "Late Start"
                
                var un = (parseInt(moment.duration(tout.diff(tin)).asHours()) >= 8) ? "Completed" : "Undertime"

                // console.log("Time In: ", req.body.time_in)
                // console.log("Time Out: ", req.body.time_out)
                // console.log("Hours Worked: ", hw)
                // console.log("Start Status: ", st)
                // console.log("Completion Status: ", un)

                const q =
                "UPDATE attendance SET time_in = '" +
                req.body.time_in +
                "', time_out = '" +
                req.body.time_out +
                "', hours_worked = '" +
                hw +
                "', status = '" +
                st +
                "', undertime = '" +
                un +
                "' WHERE attendance_id = " +
                req.body.attendance_id;

                const vals = [{
                    time_in: tin, 
                    time_out: tout, 
                    hours_worked: hw, 
                    status: st, 
                    undertime: un}]

                db.query(q, (err, data) => {
                    if (err) return res.json(err);
                    return res.json(vals);
                });
            }
        }
    )
}

//Time Table Universal

function GetMyOwnIncompleteData(req, res){
    const eid = req.session.user[0].emp_num
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    //const q = "SELECT * FROM attendance a WHERE a.employee_id = ? AND a.status = 'Data Incomplete'"
    const q = `(SELECT date, "Data Incomplete" as holidayName FROM attendance a WHERE a.employee_id = ? AND a.status = 'Data Incomplete')
    UNION
    (SELECT date, "Late Start" as holidayName FROM attendance a WHERE a.employee_id = ? AND a.status = 'Late Start')
    UNION
    (SELECT date, "Undertime" as holidayName FROM attendance a WHERE a.employee_id = ? AND a.undertime = 'Undertime')`

    db.query(q, [eid, eid, eid], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetMyOwnLeaveOvertimeData(req, res){
    const eid = req.session.user[0].emp_id
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    //const q = "SELECT * FROM attendance a WHERE a.employee_id = ? AND a.status = 'Data Incomplete'"
    const q = `SELECT leave_from FROM leaves WHERE requester_id = ?
    UNION
    SELECT leave_to FROM leaves WHERE requester_id = ?
    UNION
    SELECT overtime_date FROM overtime WHERE requester_id = ?`

    db.query(q, [eid, eid, eid], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Get Attendance of a Certain Employee

function GetMyStatusForAttendance(req, res){
    const uid = req.session.user[0].emp_id
    //const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num LEFT JOIN emp_shift es ON es.emp_num = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id INNER JOIN position p ON p.position_id = ed.position_id WHERE e.emp_num = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name`
    //const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE e.emp_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type`
    const q = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, COUNT(case when a.status = 'Completed' then 1 else null end) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type`

    db.query(q, [uid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

//Paginated Version

function GetPaginatedAttendanceOfMine(req, res) {
    const unum = req.session.user[0].emp_num

    const { limit = 10, page = 1 } = req.query;

    console.log(req.query)

    const q1 = "SELECT COUNT(*) FROM attendance WHERE employee_id = ? ORDER BY date DESC"
    
    db.query(q1, [unum], (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            const q2 = `SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT ? OFFSET ?`
            
            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);


            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [unum, parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
  
}

function GetLeavesOfOne(req, res){
    const eid = req.body.employee_id
    //const q = `SELECT * FROM cheer_likes cl INNER JOIN emp e ON e.emp_id = cl.liker_id INNER JOIN emp_designation em ON em.emp_id = e.emp_id INNER JOIN position p ON em.position_id = p.position_id WHERE cheer_post_id = ?`
    const q = "SELECT leave_from, leave_type, emp_num FROM leaves l INNER JOIN emp e ON e.emp_id = l.requester_id WHERE e.emp_num = ?"

    db.query(q, [eid], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//Add New Date

function AddNewDate(req, res){
    console.log(req.body)

    const eid = req.body.employee_id
    
    const q1 = "SELECT start FROM emp_shift WHERE emp_num = ?"

        db.query(q1, [eid], (err, data) => {

            console.log("DATA: ", data)
            if (err){
                console.log(err)
            } else {
                const tin = moment(req.body.time_in, "HH:mm:ss a");
                const tout = moment(req.body.time_out, "HH:mm:ss a");

                const hw = (tin !== null && tout !== null) ? ('0' + parseInt(moment.duration(tout.diff(tin)).asHours())).slice(-2) 
                + "h " 
                + ('0' + (parseInt(moment.duration(tout.diff(tin)).asMinutes()) % 60)).slice(-2)
                + "m"
                : null

                //var st = (tin == null || tin == "" || tout == null || tout == "") ? "Data Incomplete" : "Early Start"

                var st = (tin == null || tin == "" || tout == null || tout == "") ? "Data Incomplete" : (data == null || data == "") ? "No Shift Registered" : (moment(data[0].start, "HH:mm:ss a") > tin) ? "Early Start" : "Late Start"
                
                var un = (parseInt(moment.duration(tout.diff(tin)).asHours()) >= 8) ? "Completed" : "Undertime"


                const q = "INSERT INTO attendance (`employee_id`, `date`, `time_in`, `time_out`, `hours_worked`, `status`, `undertime`) VALUES (?)"

                const values = [eid, moment(req.body.date).format("YYYY-MM-DD"), req.body.time_in, req.body.time_out, hw, st, un]

                db.query(q, [values], (err, data) => {
                    if (err) return res.json(err);
                    return res.send({id: data.insertId, employee_id: eid, date: req.body.date, hours_worked: hw, time_in: req.body.time_in, time_out: req.body.time_out, status: st, undertime: un});
                });
            }
        }
    )
}


module.exports = {
    InsertAttendanceIntoDatabase,
    GetLimitedAttendance,
    GetUndertimeAttendance,
    GetAttendance,
    GetMyLeaves,
    GetEmployeesWithStatusForAttendance,
    GetAttendanceOfOne,
    GetOneStatusForAttendance,
    ChangeAttendanceOfOne,

    //Universal Calendar
    GetMyOwnIncompleteData,
    GetMyOwnLeaveOvertimeData,
    GetMyStatusForAttendance,
    GetLeavesOfOne,
    AddNewDate,
    DisableDatesOfOne,

    GetPaginatedEmployeesWithStatusForAttendance,
    GetPaginatedAttendanceOfOne,

    //My Attendance
    GetPaginatedAttendanceOfMine,
    SearchAttendanceStatus
};

