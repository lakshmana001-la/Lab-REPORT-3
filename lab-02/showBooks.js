const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./books.db");

db.all("SELECT * FROM book;", [], (err, rows) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.table(rows);
  db.close();
});
