const sqlite3 = require('sqlite3').verbose(); //sqlite3 is required for this package
const { createDatabase, addNewUser, getUserData, saveData } = require('./data');


exports.testFunction = function () { //just a test function
    return console.log("Everything seems to be working");
}

/**
 * @description Adds a user to the database
 * @param {string} userID
 * @returns {boolean}
 */

exports.addUser = function (userID) { //add a user to the database
    if ((!userID) || ((typeof userID != "string") && (typeof userID != "number"))) {
        return console.error(`UserID must be a string or number!`);
    } else {
        if (typeof userID == "number") {
            userID = userID.toString();
        }
        addNewUser(userID, sqlite3).then(response => {
            return response;
        });
    }
}

/**
 * @description Adds points the to specified user
 * @param {string} userID
 * @param {number} points
 * @returns {boolean}
 */

exports.addPoints = function (userID, points) { //adds points to a user
    if ((!userID) || ((typeof userID != "string") && (typeof userID != "number"))) {
        console.error(`UserID must be a string or number!`);
        return false;
    } else if ((!points) || (isNaN(points))) {
        console.error(`Points must be a number!`);
        return false;
    } else {
        if (typeof points == "string") {
            points = parseFloat(points);
        }
        if (typeof userID == "number") {
            userID = userID.toString();
        }

        getUserData(userID, sqlite3).then(response => {
            if (typeof response == "boolean") {
                console.error(`Failed to get user ${userID}, user not in database.`);
                return false;
            } else {
                response.userdata.points += points;
                saveData([response], sqlite3).then(saveResponse => {
                    return saveResponse;
                });
            }
        });
    }
}

/**
 * @description Returns the specified user's points
 * @param {string} userID
 * @returns {Promise<number>} Returns -1 if there is an error getting the user's points
 */

exports.getPoints = function (userID) { //gets the users current points
    return new Promise(resolve => {
        if ((!userID) || ((typeof userID != "string") && (typeof userID != "number"))) {
            console.error(`UserID must be a string or number!`);
            return resolve(-1);
        }
        if (typeof userID == "number") {
            userID = userID.toString();
        }

        getUserData(userID, sqlite3).then(userResponse => {
            if (typeof userResponse == "boolean") {
                console.error(`Failed to get user ${userID}, user not in database.`);
                return resolve(-1);
            } else {
                return resolve(userResponse.userdata.points);
            }
        });
    });
}

startup();

function startup() { //this function is run right away
    createDatabase(sqlite3);
}