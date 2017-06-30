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
    secure: config.email.secure, // secure:true for port 465, secure:false for port 587
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
                //console.log(list);

                // loop each document with type added
                list.forEach(function (row) {
                    //console.log(row._id);

                    // for different emails notification 
                    // * check for the type of the event and send notification to specific emails *
                    // * sending email from info@youremail.com
                    if (row.type === 'patients' && row.notified === false) {
                        // send email to nRem email address
                        //console.log("narrative: " + row._id);

                        // find and get the added object from it's database by using its id
                        repository_main.findById(row.objectId, (err, doc) => {
                            if (err) {
                                console.log("Error getting Doc: " + err); // if error show error
                            }else{
                                // console.log("The doc looks good: " + JSON.stringify(doc));

                                var dateAdded = new Date(doc.dateAdded);

                                // setup email data with unicode symbols
                                let mailOptions = {
                                    from: '"Derick" <ngichngimwa@gmail.com>', // sender address
                                    to: 'delinkdeveloper@gmail.com', // list of receivers
                                    subject: 'New Patient Added - ' + doc.firstname + ' ' + doc.firstname, // Subject line
                                    
                                    // html body starts..
                                    html: '<b>Hello,</b> ' +
                                    '<p>A new patient record has been added as below: </p>' + 
                                    '<p>First Name: <strong>' + doc.firstname + '</strong></p>' +
                                    '<p>Gender: <strong>' + doc.sex + '</strong></p>' + 
                                    '<br><p>The new patient was added by: <strong>' + doc.createdBy + '</strong>' + ' on ' + dateAdded + '</p>' +
                                    '<p>You may view more information about this patient\'s record by following https://test.gabriel.health-e-net.org/narrative/' + doc._id + '</p>' +
                                    '<br><p>Sincerely, </p>' + 
                                    '<p>Health-E-Net Mailer</P>'

                                    // ./html body ends.
                                };

                                // send mail with defined transport object
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    console.log('Message %s sent: %s', info.messageId, info.response);

                                    // update the notified filed to true
                                    var updatedDoc = {
                                        _id: row._id,
                                        _rev: row._rev,
                                        event: row.event,
                                        notified: true,
                                        objectId: row.objectId,
                                        type: row.type,
                                        userName: row.userName
                                    }

                                    repository.save(updatedDoc, (err, res) => {
                                        if (!err) {
                                            console.log("doc updated: " + JSON.stringify(res));
                                        }
                                    });
                                });
                            }
                        });

                    }else if(row.type === 'sharelinks' && row.notified === false){
                        // send email to nRem, mediator
                        //console.log("sharelinks: " + row._id);

                        // find and get the added object from it's database by using its id
                        repository_main.findById(row.objectId, (err, doc) => {
                            if (err) {
                                console.log("Error getting Doc: " + err); // if error show error
                            }else{
                                // console.log("The doc looks good: " + JSON.stringify(doc));

                                var dateAdded = new Date(doc.dateAdded);

                                repository_main.findById(doc.patientId, (error, patient) => {
                                    if (error) {
                                        console.log("Could not get a Patient: " + error);
                                    }else{
                                        // console.log("Patient: " + JSON.stringify(patient));
                                        // setup email data with unicode symbols
                                        let mailOptions = {
                                            from: '"Derick" <ngichngimwa@gmail.com>', // sender address
                                            to: 'delinkdeveloper@gmail.com', // list of receivers
                                            subject: 'New Sharelink generated', // Subject line
                                            
                                            // html body starts..
                                            html: '<b>Hello,</b> ' +
                                            '<p>You are receiving this email because a new ShareLink was generated on </p>' + dateAdded +
                                            '<p>Patient information: </p>' +
                                            '<p>First Name: <strong>' + patient.firstname + '</strong></p>' +
                                            '<p>Gender: <strong>' + patient.sex + '</strong></p>' + 
                                            '<p>You may preview the sharelink by following https://test.gabriel.health-e-net.org/shared/' + doc._id + '</p>' +
                                            '<br><p>Sincerely, </p>' + 
                                            '<p>Health-E-Net Mailer</P>'
                                            // ./html body ends.
                                        };

                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return console.log(error);
                                            }
                                            console.log('Message %s sent: %s', info.messageId, info.response);

                                            // update the notified filed to true
                                            var updatedDoc = {
                                                _id: row._id,
                                                _rev: row._rev,
                                                event: row.event,
                                                notified: true,
                                                objectId: row.objectId,
                                                type: row.type,
                                                userName: row.userName
                                            }

                                            repository.save(updatedDoc, (err, res) => {
                                                if (!err) {
                                                    console.log("Doc updated: " + JSON.stringify(res));
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }else if(row.type === 'report' && row.notified === false){
                        // send email to nRem, mediator, specialist
                        //console.log("sharelinks: " + row._id);

                        // find and get the added object from it's database by using its id
                        repository_main.findById(row.objectId, (err, doc) => {
                            if (err) {
                                console.log("Error getting Doc: " + err); // if error show error
                            }else{
                                // console.log("The doc looks good: " + JSON.stringify(doc));

                                var dateAdded = new Date(doc.dateAdded);

                                repository_main.findById(doc.patientId, (error, patient) => {
                                    if (error) {
                                        console.log("Could not get a Patient: " + error);
                                    }else{
                                        // console.log("Patient: " + JSON.stringify(patient));
                                        // setup email data with unicode symbols

                                        var diff = (new Date() - new Date(patient.dateOfBirth)) // find the difference of age
                                        var age = Math.floor(diff/31557600000); // Divide by 1000*60*60*24*365.25

                                        console.log(">>"+age);
                                        // console.log(">> " +dob);

                                        let mailOptions = {
                                            from: '"Derick" <ngichngimwa@gmail.com>', // sender address
                                            to: 'delinkdeveloper@gmail.com', // list of receivers
                                            subject: 'A specilaist report has been uploaded', // Subject line
                                            
                                            // html body starts..
                                            html: '<b>Hello,</b> ' +
                                            '<p>You are receiving this email because a new specialist report has been published on a case you mediate. </p>' + dateAdded +
                                            '<p>Case information: </p>' +
                                            '<p>First Name: <strong>' + patient.firstname + '</strong></p>' +
                                            '<p>Gender: <strong>' + patient.sex + '</strong></p>' + 
                                            '<p>Age: <strong>' + age + ' years</strong></p>' + 
                                            '<p>You may also review the specialist report directly by following the link below https://test.gabriel.health-e-net.org/shared/' + doc._id + '</p>' +
                                            '<br><p>Sincerely, </p>' + 
                                            '<p>Health-E-Net Mailer</P>'
                                            // ./html body ends.
                                        };

                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return console.log(error);
                                            }
                                            console.log('Message %s sent: %s', info.messageId, info.response);

                                            // update the notified filed to true
                                            var updatedDoc = {
                                                _id: row._id,
                                                _rev: row._rev,
                                                event: row.event,
                                                notified: true,
                                                objectId: row.objectId,
                                                type: row.type,
                                                userName: row.userName
                                            }

                                            repository.save(updatedDoc, (err, res) => {
                                                if (!err) {
                                                    console.log("Doc updated: " + JSON.stringify(res));
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

            }else{
                // if findByEvent has errors console.log the error
                console.log(error);
            }
        }); 
    }
});