function createDatabase(sqlite3) { //creates the database if it does not exist
    let db = new sqlite3.Database('./ls.db', sqlite3.OPEN_READWRITE);

    db.run(`CREATE TABLE IF NOT EXISTS users(userid TEXT NOT NULL, userdata TEXT NOT NULL)`);
    db.close();
}

function getUserData(userid, sqlite3) {
    let db = new sqlite3.Database('./ls.db', sqlite3.OPEN_READWRITE);
    return new Promise(resolve => {
        let getdata = `SELECT * FROM users WHERE userid = ?`;
        db.get(getdata, [userid], (err, row) => {
            if (err) {
                console.error(err);
                db.close();
                return resolve(false);
            }
            if (row === undefined) {
                return resolve(false);
            } else {
                let user = {
                    userdata: JSON.parse(row.userdata),
                }
                db.close();
                return resolve(user);
            }
        });
    });
}


function addNewUser(userid, sqlite3) {
    let db = new sqlite3.Database('./ls.db', sqlite3.OPEN_READWRITE);
    return new Promise(resolve => {
        let getdata = `SELECT * FROM users WHERE userid = ?`;
        db.get(getdata, [userid], (err, row) => {
            if (err) {
                console.error(err);
                db.close();
                resolve(false);
            }
            if (row === undefined) {

                let userJSON = {
                    userid: userid,
                    points: 0
                }

                let userString = JSON.stringify(userJSON);

                let userdata = db.prepare('INSERT INTO users VALUES(?,?)');
                userdata.run(userid, userString);
                userdata.finalize();
                db.close();
                return resolve(true);
            } else {
                console.error(`User ${userid} has already been added to the database!`);
                db.close();
                return resolve(false);
            }
        });
    });
}

function saveData(users, sqlite3) {
    let db = new sqlite3.Database('./ls.db', sqlite3.OPEN_READWRITE);
    return new Promise(resolve => {
        db.on('error', (err) => {
            console.error(err);
            db.close();
            return resolve(false);
        });

        for (let i = 0; i < users.length; i++) { //loop through all the users

            let userString = JSON.stringify(users[i].userdata);

            if (userString === undefined) {
                console.error(`Unable save data for user ${users[i].userdata.userid}\nError code: 0`);
                db.close();
                return resolve(false);
            }

            if (typeof userString !== "string") {
                console.error(`Unable save data for user ${users[i].userdata.userid}\nError code: 1`);
                db.close();
                return resolve(false);
            }


            db.run(`UPDATE users SET userdata = ? WHERE userid = ?`, [userString, users[i].userdata.userid], function (err) {
                if (err) {
                    console.error(err);
                    db.close();
                    return resolve(false);
                }
            });
            if (i == (users.length - 1)) {
                db.close();
                return resolve(true);
            }
        }
    });
}

module.exports.createDatabase = createDatabase;
module.exports.getUserData = getUserData;
module.exports.addNewUser = addNewUser;
module.exports.saveData = saveData;