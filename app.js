// require the needed files and depedancies
// config file that holds the couch credentials
// nodemailer for facilitating the sending of emails
var config = require("./config/config");
var nodemailer = require('nodemailer');

'use strict';
// // create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
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
var db = connection.use(config.couchdb.dbname);             // tell nano to use the db of events
var db_main = connection.use(config.couchdb.dbname_main);   // tell nano to use the db of all douments

// set up repo for events logs
var NanoRepository = require('nano-repository');
var repository = new NanoRepository(db);            // interntiate a nano repository of the events db
var repository_main = new NanoRepository(db_main);  // interntiate a nano repository of the documents db

// provide the views to the repository for use
repository.updateViews('./views/views.json', function(error,result) {
    // views are now ready to use
    if(error){
        console.log(error);
    }else{
        // log out the results
        console.log(result);

         repository.findByEvent('added', function(error, list) {
            // list contains all documents where doc.name == ''
            if (!error) {
                // if there is no error
                console.log(list);

                // loop each document with type added
                list.forEach(function (row) {
                    //console.log(row._id);

                    // for different emails notification 
                    // * check for the type of the event and send notification to specific emails *
                    // * sending email from info@health-e-net.org
                    if (row.type === 'patients' && row.notified === false) {
                        // send email to nRem email address
                        //console.log("narrative: " + row._id);

                        // find and get the added object from it's database by using its id
                        repository_main.findById(row.objectId, (err, doc) => {
                            if (err) {
                                console.log("Error getting Doc: " + err); // if error show error
                            }else{
                                console.log("The doc looks good: " + JSON.stringify(doc));

                            }
                        });

                    }else if(row.type === 'sharelinks' && row.notified === false){
                        // send email to nRem, mediator
                        //console.log("sharelinks: " + row._id);

                    }
                });

            }else{
                // if findByEvent has errors console.log the error
                console.log(error);
            }
        }); 
    }
});