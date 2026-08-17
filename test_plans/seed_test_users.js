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
    const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
    db.run("BEGIN TRANSACTION");
    for (let i = 1; i <= 200; i++) {
        // Ignored UNIQUE constraint error if running multiple times
        stmt.run(`Test User ${i}`, `test${i}@eshop.com`, 'Test1234!');
    }
    db.run("COMMIT", () => {
        console.log(`Seeded 200 test users successfully (test1@eshop.com to test200@eshop.com).`);
        stmt.finalize();
        db.close();
    });
});
