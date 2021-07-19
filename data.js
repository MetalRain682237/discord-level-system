function getuserdata(message, userid, sqlite3, client) {
    let db = new sqlite3.Database('./commands/data/STG.db', sqlite3.OPEN_READWRITE);
    return new Promise(resolve => {
        let getdata = `SELECT * FROM users WHERE userid = ?`;
        db.get(getdata, [userid], (err, row) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(null);
            }
            if (row === undefined) {
                sendbc(("User data added for " + message.author.tag + " <@" + userid + ">"), client);

                adddog();
                async function adddog() {
                    let dog = await getnewdog();
                    let dogstr = JSON.stringify(dog);
                    let userobj = {
                        userid: message.author.id,
                        username: message.author.tag
                    }
                    let userstr = JSON.stringify(userobj);
                    let userdata = db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)');
                    userdata.run((message.author.id), (message.author.tag), userstr, "none", 25, dogstr, "none", "{\"timers\":\"none\",\"timeractions\":\"none\"}");
                    userdata.finalize();
                    db.close();
                    resolve(null);
                }
            } else {
                let user = {
                    userdata: JSON.parse(row.userdata),
                    dogdata: JSON.parse(row.dogdata),
                    timers: JSON.parse(row.timers)
                }

                user.dogdata.money = parseInt(row.money, 10);

                db.close();
                resolve(user);
            }
        });
    });
}

function getserversdata(message, guildid, sqlite3, client) {
    let db = new sqlite3.Database('./commands/data/STG.db', sqlite3.OPEN_READWRITE);
    return new Promise(resolve => {
        if (guildid === null) {
            let ssd = {
                prefix: "//",
                channelid: "none"
            }
            db.close();
            return resolve(ssd);
        }
        let getdata = `SELECT * FROM servers WHERE guildid = ?`;
        db.get(getdata, [guildid], (err, row) => {
            if (err) {
                console.log(err);
                db.close();
                return resolve(null);
            }
            if (row === undefined) {
                sendbc(("Guild data added for " + message.guild.name + "\nOwner: <@" + message.guild.ownerID + ">"), client);
                let userdata = db.prepare('INSERT INTO servers VALUES(?,?,?,?,?)');
                userdata.run(message.guild.id, message.guild.name, message.guild.ownerID, "//", "none");
                userdata.finalize();
                db.close();
                return resolve(null);
            } else {
                let ssd = {
                    prefix: row.prefix,
                    channelid: row.channelid
                }
                db.close();
                return resolve(ssd);
            }
        });
    });
}

function getserverdata(sqlite3) {
    let db = new sqlite3.Database('./commands/data/STG.db', sqlite3.OPEN_READWRITE);
    return new Promise(resolve => {
        let getdata = `SELECT * FROM serverdata WHERE testdata = ?`;
        db.get(getdata, [1234], (err, row) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(null);
            }
            if (row === undefined) {
                db.close();
                resolve(null);
            } else {
                let dogserverdata = JSON.parse(row.dogserverdata); //parse the dog server data

                let sd = {
                    datatime: row.datatime,
                    botstatus: row.botstatus,
                    person: row.person,
                    dogserverdata: {
                        lbnumbers: dogserverdata.lbnumbers,
                        saleprice: dogserverdata.saleprice,
                        saletime: dogserverdata.saletime,
                        salemsgid: dogserverdata.salemsgid,
                        ebprice: dogserverdata.ebprice,
                        ebtime: dogserverdata.ebtime,
                        ebmsgid: dogserverdata.ebmsgid,
                        boxprice: dogserverdata.boxprice,
                        boxtime: dogserverdata.boxtime,
                        boxmsgid: dogserverdata.boxmsgid
                    }
                }
                db.close();
                return resolve(sd);
            }
        });
    });
}

function savedata(column, value, sqlite3) {
    let db = new sqlite3.Database('./commands/data/STG.db', sqlite3.OPEN_READWRITE);
    db.on('error', (err) => {
        console.log(err);
    });

    if (column === undefined) {
        console.log("column undefined");
        return;
    }
    if (db === undefined) {
        console.log("db undefined");
        return;
    }

    column = column.split(",");

    
    for (let i = 0; i < column.length; i++) {
        if (column[i] == "dogdata") { //updating dogdata

            let dogdatastr = JSON.stringify(value[i].dogdata);

            if (typeof dogdatastr !== "string") {
                console.log("not a string");
                console.log(dogdatastr);
                return;
            }

            if (dogdatastr === undefined) {
                console.log("dogstr undefined");
                return;
            }

            db.run(`UPDATE users SET dogdata = ?, money = ? WHERE userid = ?`, [dogdatastr, value[i].dogdata.money, value[i].userdata.userid], function (err) {
                if (err) {
                    console.log(err);
                }
            });
        } else if (column[i] == "timers") { //updating timers
            let timerstr = JSON.stringify(value[i].timers);

            if (timerstr === undefined) {
                console.log("timerstr undefined");
            }

            db.run(`UPDATE users SET timers = ? WHERE userid = ?`, [timerstr, value[i].userdata.userid], function (err) {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            db.run(`UPDATE users SET ${column[i]} = ? WHERE userid = ?`, [value[i], value[i - 1].userdata.userid], function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }

        if (i == (column.length - 1)) {
            db.close();
        }
    }
}

module.exports.getuserdata = getuserdata;
module.exports.getserversdata = getserversdata;
module.exports.getserverdata = getserverdata;
module.exports.savedata = savedata;