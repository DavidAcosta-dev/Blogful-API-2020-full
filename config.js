"use strict";

exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/blog-app";
//exporting a variable named "DATABASE_URL" that equals either the env variable (with same name) that is the url address/location of the current database that the environment varible has on file.
//or if that is not availavble or the environment varible doesn't have a database assigned, we say DATABASE_URL is the local database we have on our machine called "restaurants-app".
//so in short:    variable DATABASEURL = environmentVariableBaseURL OR localMachineDataBase(BackupPlan)

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-blog-app";
//This is saying that our database designated for testing wil be the environmentVariableTestDbURL OR localMachineTestDb(BackupPlan). 
//We have a testDb because we don't want our real database to be manipulated permanently when we run tests that execute the crud ops

exports.PORT = process.env.PORT || 8080;
//This is saying pretty much the same thing as the above exports.
//We are making a variable named "PORT" and assigning the value of the environmentVariable called "PORT" as well. 
//The environmental variables are located on the machine that is hosting the serverapp so that could be local or remote like a heroku dyno.
//If that env. variable isn't found, then just use port 8080.


//*We are Exporting these values to be used in server.js */