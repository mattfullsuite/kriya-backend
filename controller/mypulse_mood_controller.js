var db = require("../config.js");
var moment = require("moment");

function InsertMoodEntry(req, res) {
    var uid = req.session.user[0].emp_id;
    var me = req.body.chosenMood;

    console.log(JSON.stringify(req.body.chosenMood))
    const values = [me, uid]

    const q = "INSERT INTO pulse_mood (`mood_entry`, `emp_id`) VALUES (?)"

    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err)
        } else {
            const q = "SELECT * FROM pulse_mood WHERE mood_entry_id = ?";

            db.query(q, [data.insertId], (err, data) => {
                if(err) {
                    console.log(err)}
                else {
                    res.json(data);
                }
            })
        }
    })
}

function GetMostRecentMood(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? ORDER BY date_of_entry DESC"

    db.query(q, [uid, moment()], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMoodsForDay(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND date_of_entry = ?"

    db.query(q, [uid, moment()], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMoodsForWeek(req, res){

    //.subtract(1, 'months')
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) ORDER BY date_of_entry"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetMoodsLastWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) ORDER BY date_of_entry"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetMoodsRecentMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) ORDER BY date_of_entry"

    db.query(q, [uid, startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForLastWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForLastMonth(req, res){
    var uid = req.session.user[0].emp_id

    const start = moment().subtract(1, 'months').startOf('week').format('YYYY-MM-DD hh:mm');
    const end   = moment().subtract(1, 'months').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, start, end], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetMyMoods(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ?"

    db.query(q, [uid], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetMostRecentMoodsLimited(req, res) {
    var uid = req.session.user[0].emp_id

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? ORDER BY date_of_entry DESC LIMIT 5"

    db.query(q, [uid, moment()], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetLowMoodForWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry < 3"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetNeutralMoodForWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry = 3"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetHighMoodForWeek(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('week').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry > 3"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetLowMoodForMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry < 3"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetNeutralMoodForMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry = 3"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetHighMoodForMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfWeek = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfWeek   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry > 3"

    db.query(q, [uid, startOfWeek, endOfWeek], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetLowMoodForYear(req, res){
    var uid = req.session.user[0].emp_id

    const start = moment().startOf('year').format('YYYY-MM-DD hh:mm');
    const end   = moment().endOf('year').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry < 3"

    db.query(q, [uid, start, end], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetNeutralMoodForYear(req, res){
    var uid = req.session.user[0].emp_id

    const start = moment().startOf('year').format('YYYY-MM-DD hh:mm');
    const end   = moment().endOf('year').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry = 3"

    db.query(q, [uid, start, end], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetHighMoodForYear(req, res){
    var uid = req.session.user[0].emp_id

    const start = moment().startOf('year').format('YYYY-MM-DD hh:mm');
    const end   = moment().endOf('year').format('YYYY-MM-DD hh:mm');

    const q = "SELECT * FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?) AND mood_entry > 3"

    db.query(q, [uid, start, end], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForMonth(req, res){
    var uid = req.session.user[0].emp_id

    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, startOfMonth, endOfMonth], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetAverageMoodForYear(req, res){
    var uid = req.session.user[0].emp_id

    const start = moment().startOf('year').format('YYYY-MM-DD hh:mm');
    const end   = moment().endOf('year').format('YYYY-MM-DD hh:mm');

    const q = "SELECT AVG(mood_entry) AS mood_average FROM pulse_mood WHERE emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)"

    db.query(q, [uid, start, end], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetDifferentMoodsForWeek(req, res){
    var u = req.session.user[0].emp_id

    const s1 = moment().startOf('week').format('YYYY-MM-DD hh:mm');
    const e1   = moment().endOf('week').format('YYYY-MM-DD hh:mm');
    const s2 = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const e2   = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');
    const s3 = moment().subtract(2, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const e3   = moment().subtract(2, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');
    const s4 = moment().subtract(3, 'weeks').startOf('week').format('YYYY-MM-DD hh:mm');
    const e4   = moment().subtract(3, 'weeks').endOf('week').format('YYYY-MM-DD hh:mm');

    const q = `SELECT pm.emp_id,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w1_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w1_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w1_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w2_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w2_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w2_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w3_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w3_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w3_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w4_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w4_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as w4_high
                FROM pulse_mood as pm WHERE emp_id = ? GROUP BY emp_id`

    db.query(q, [u,s1,e1,u,s1,e1,u,s1,e1,
                u,s2,e2,u,s2,e2,u,s2,e2,
                u,s3,e3,u,s3,e3,u,s3,e3,
                u,s4,e4,u,s4,e4,u,s4,e4,
                u], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetDifferentMoodsForMonth(req, res){
    var u = req.session.user[0].emp_id

    const s1 = moment().startOf('month').format('YYYY-MM-DD hh:mm');
    const e1   = moment().endOf('month').format('YYYY-MM-DD hh:mm');
    const s2 = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD hh:mm');
    const e2   = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD hh:mm');
    const s3 = moment().subtract(2, 'months').startOf('month').format('YYYY-MM-DD hh:mm');
    const e3   = moment().subtract(2, 'months').endOf('month').format('YYYY-MM-DD hh:mm');
    const s4 = moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD hh:mm');
    const e4   = moment().subtract(3, 'months').endOf('month').format('YYYY-MM-DD hh:mm');

    const q = `SELECT pm.emp_id,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m1_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m1_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m1_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m2_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m2_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m2_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m3_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m3_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m3_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m4_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m4_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as m4_high
                FROM pulse_mood as pm WHERE emp_id = ? GROUP BY emp_id`

    db.query(q, [u,s1,e1,u,s1,e1,u,s1,e1,
                u,s2,e2,u,s2,e2,u,s2,e2,
                u,s3,e3,u,s3,e3,u,s3,e3,
                u,s4,e4,u,s4,e4,u,s4,e4,
                u], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

function GetDifferentMoodsForYear(req, res){
    var u = req.session.user[0].emp_id

    const s1 = moment().startOf('year').format('YYYY-MM-DD hh:mm');
    const e1   = moment().endOf('year').format('YYYY-MM-DD hh:mm');
    const s2 = moment().subtract(1, 'years').startOf('year').format('YYYY-MM-DD hh:mm');
    const e2   = moment().subtract(1, 'years').endOf('year').format('YYYY-MM-DD hh:mm');
    const s3 = moment().subtract(2, 'years').startOf('year').format('YYYY-MM-DD hh:mm');
    const e3   = moment().subtract(2, 'years').endOf('year').format('YYYY-MM-DD hh:mm');

    const q = `SELECT pm.emp_id,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y1_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y1_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y1_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y2_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y2_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y2_high,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry < 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y3_low,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry = 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y3_neutral,
                    (SELECT COUNT(*) FROM pulse_mood WHERE mood_entry > 3 and emp_id = ? AND (date_of_entry > ?) AND (date_of_entry < ?)) as y3_high
                FROM pulse_mood as pm WHERE emp_id = ? GROUP BY emp_id`

    db.query(q, [u,s1,e1,u,s1,e1,u,s1,e1,
                u,s2,e2,u,s2,e2,u,s2,e2,
                u,s3,e3,u,s3,e3,u,s3,e3,
                u], (err,data)=> {
        if(err) console.log("err " + err)
        return res.json(data)
    }) 
}

module.exports = {
    GetMostRecentMood,
    GetMoodsForDay,
    GetMoodsForWeek,
    GetMoodsLastWeek,
    GetMoodsRecentMonth,
    InsertMoodEntry,
    GetAverageMoodForWeek,
    GetAverageMoodForMonth,
    GetMostRecentMoodsLimited,
    GetAverageMoodForLastWeek,
    GetAverageMoodForLastMonth,
    GetLowMoodForWeek,
    GetNeutralMoodForWeek,
    GetHighMoodForWeek,
    GetLowMoodForMonth,
    GetNeutralMoodForMonth,
    GetHighMoodForMonth,
    GetLowMoodForYear,
    GetNeutralMoodForYear,
    GetHighMoodForYear,
    GetAverageMoodForYear,
    GetDifferentMoodsForWeek,
    GetDifferentMoodsForMonth,
    GetDifferentMoodsForYear,
    GetMyMoods
};