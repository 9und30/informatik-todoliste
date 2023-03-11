const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

// Erstellt eine Verbindung zur Datenbank
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Gibt alle Todos in der Datenbank zurück
app.get('/todos', (req, res) => {
  const sql = 'SELECT * FROM todos';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.send(rows);
  });
});

// Fügt einen neuen Todo zur Datenbank hinzu
app.post('/todos', (req, res) => {
  const { task } = req.body;
  const sql = 'INSERT INTO todos (task) VALUES (?)';
  db.run(sql, [task], function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.send({ id: this.lastID, task: task, status: 'todo' });
  });
});

// Aktualisiert den Status eines Todo-Eintrags in der Datenbank
app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const sql = 'UPDATE todos SET status = ? WHERE id = ?';
  db.run(sql, [status, id], function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);
    res.send(`Todo updated with ID: ${id}`);
  });
});

// Löscht alle Todos aus der Datenbank
app.delete('/todos', (req, res) => {
  const sql = 'DELETE FROM todos';
  db.run(sql, function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`All rows deleted: ${this.changes}`);
    res.send(`All todos deleted`);
  });
});

const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:3001';

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
