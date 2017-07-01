# nodeemails

Nodejs-Emails: An app that gets data from the database Couchdb and sends an email to the provided address

## Requirements

To get started you need nodejs and npm installed in your local machine. to install node follow: 
[Nodejs](https://nodejs.org/en). npm (node package manager) is installed once the node have been installed

> You need a config file, a json file that holds the database credetials and the email credetials. 
For a config file, create a folder `config` on the root project and create a file `cpnfig.json` in the folder

example:
```json
{
  "couchdb": {
    "serverUrl": "https://couch.example.com",
    "dbname": "databaseName",
    "username": "dbUsername",
    "password": "dbPassword"
  },
  "email": {
    "host": "smtp.gmail.com",
    "port": 465,
    "secure": true,
  	"emailid": "example@gmail.com",
  	"password": "password",
  	"from": "example@gmail.com",
    "to": "receiver@gmail.com"
  }
}
```
## Grab the code

Clone this repo into new project folder.
```bash
git clone https://github.com/Delink-D/nodeemails.git
cd nodeemails
```

## Install npm packages

Install the npm packages described in the `package.json` and verify that it works:

```bash
npm install
```

## Development server

Run `node app.js` for a server. <br>
You may wish to user other server starts line `nodemon` which you have to install.
<br>
once the server runs the sending of emails should be executed.

## Recommended reading

About Nodemailer and how to use [Nodemailer](https://nodemailer.com/about) <br>
About nodejs [nodejs](https://nodejs.org/en/docs) <br>
Getting started with Pouchdb [pouchdb](https://pouchdb.com/getting-started.html) <br>
Nano documentation [couchdb-nano](https://github.com/apache/couchdb-nano)