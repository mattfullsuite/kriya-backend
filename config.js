var dotenv = require("dotenv")
var mysql = require( "mysql")

dotenv.config({ path: './protected.env' })


var db;

if (process.env.JAWSDB_URL){
    db = mysql.createConnection(process.env.JAWSDB_URL)
    console.log("Successfully connected to " + process.env.JAWSDB_URL)
} else {
    console.log("Successfully connected to " + process.env.DATABASE_HOST)
    db = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
})}

module.exports = db
