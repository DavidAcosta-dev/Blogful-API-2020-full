"use strict";

const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const blogfulRouter = require('./blogfulRouter');

const { PORT, DATABASE_URL } = require("./config");

const app = express();

//log the http layer
app.use(morgan('common'));
app.use(jsonParser);

app.use('/blog-posts', blogfulRouter); //catches and routes all incoming http messages targeting /blog-posts address to the blogfulRouter


// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in runServer()
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) { //pass in database address and port address
  
  return new Promise((resolve, reject) => {   //return an Es6 promise so that we can chain async promises, pass in resolve and reject 
    
    mongoose.connect(databaseUrl, err => { //use mongoose.connect and pass in database address to connect to database and pass in err object. 

        if (err) {                    //If theres an error during database connection, use the reject object from the promise and pass it the err object.
          return reject(err);
        }

        server = app.listen(port, () => { //else server now equals app.listen() pass in the PORT and call the resolve method (similar to next() mthod from middleware) to continue.
            console.log(`Your app is listening on port ${port}`);
            resolve(); //we have to put this here since mongoose.connect() is wrapped in a promise and promises MUST return a resolve(kinda like a thumbs up that its all good but more importantly its an open chain where we can chain more promises to during our tests.) or a reject(terminate promise code and show an error) otherwise it will hang indefinitely.
          })
          .on("error", err => {     //this is another promise chained on similar to the .catch(err) but since we are inside a promise, we use .on("error",err=>...)
            mongoose.disconnect();  //to activate the reject(err) after we call the mongoose.disconnect()
            reject(err);            //notice how similar .on('event') is to the syntax we use for event listeners in jquery. just an interesing find.
          });//end of server= app.listen().on()

      }//end of
    );//mongoose.connect()

  });//---end of new Promise()


}//--------------------end of runServer()





// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {

  return mongoose.disconnect()
  .then(() => {

    return new Promise((resolve, reject) => {

      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve(); //if there is no error closing the server with server.close, just call resolve() which we can then chain other promises to in our tests
      });

    });//end of new Promise() inside of .then()

  });//end of .then() chained promise

}//end of closeServer()



// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
