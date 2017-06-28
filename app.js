// require the needed files and depedancies
// config file that holds the couch credentials
// nodemailer for facilitating the sending of emails
var config = require("./config/config");
var nodemailer = require('nodemailer');

'use strict';
// // create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email.emailid,
        pass: config.email.password
    }
});

// set up Nano for events logs
var connection = require('nano')({
    "url": config.couchdb.serverUrl,
    "requestDefaults" : {
        "auth": {
             "user": config.couchdb.username,
             "pass": config.couchdb.password,
             "sendImmediately": true
         }
    }
});
var db = connection.use(config.couchdb.dbname); // tell nano to use the db by providing the dbname

// set up repo for events logs
var NanoRepository = require('nano-repository');
var repository = new NanoRepository(db);