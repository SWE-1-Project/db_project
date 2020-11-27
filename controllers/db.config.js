'use strict';
const mysql = require('mysql');
const dbConn = mysql.createConnection({  
    host     : 'us-cdbr-east-02.cleardb.com',  
    user     : 'b9acd580c1388b',  
    password : '62acf6e8',  
    database : 'heroku_3edca150b62d35d'
});

dbConn.connect(function(err) {  
    if (err) 
        throw err;  
    console.log("Database Connected!");
});
module.exports = dbConn;