const ls = require('./index');

// console.log(ls.addUser("1234"));
// ls.addPoints(1234, "12");

ls.getPoints("12345").then(data => {
    console.log(data);
});
