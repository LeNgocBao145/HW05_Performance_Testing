const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
        process.exit(1);
    }
});

db.serialize(() => {
    // Delete all users that look like our test users (except the default test@eshop.com)
    db.run("DELETE FROM users WHERE email LIKE 'test%@eshop.com' AND email != 'test@eshop.com'", function(err) {
        if (err) {
            console.error('Error during teardown:', err);
        } else {
            console.log(`Successfully deleted ${this.changes} test users, returning DB to initial state.`);
        }
        db.close();
    });
});
