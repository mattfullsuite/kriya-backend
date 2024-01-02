var dotenv = require("dotenv")
var mysql = require( "mysql")

dotenv.config({ path: './protected.env' })
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
})

module.exports = db
