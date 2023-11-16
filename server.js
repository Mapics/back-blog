const express = require('express')
const mariadb = require('mariadb')

require('dotenv').config();

const app = express()
var cors = require('cors')

app.use(express.json())
app.use(cors())

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_DTB,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
})


app.get("/users/:id", async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM users WHERE user_id = ?', [req.params.id])
        res.status(200).json(rows);
    } catch(err) {
        res.status(404).json(err);
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.get("/users", async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM users');
        res.status(200).json(rows);
    } catch(err) {
        res.status(404).json(err);
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.get("/articles", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM articles');
        res.status(200).json(rows);
    } catch(err) {
        res.status(404).json(err);
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.get("/articles/:id", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM articles WHERE article_id = ?', [req.params.id]);
        res.status(200).json(rows);
    } catch(err) {
        res.status(404).json(err);
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.get("/articles/user/:id", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM articles WHERE user_id = ?', [req.params.id]);
        res.status(200).json(rows);
    } catch(err) {
        res.status(404).json(err);
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.post("/login", async(req, res) => {
   let conn;
   try {
        conn = await pool.getConnection();
        const { email, password } = req.body;
        const rows = await conn.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        console.log("email: " + email); 
        console.log("password: " + password);
        console.log(rows);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Erreur lors de la connexion :", err);
        res.status(500).json({ error: "Erreur lors de la connexion." });
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.post("/signup", async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { email, password, username, userfirstname } = req.body;
        const result = await conn.query(
            'INSERT INTO users (email, password, username, userfirstname) VALUES (?, ?, ?, ?)',
            [email, password, username, userfirstname]
        );
        const insertedId = result.insertId;
        const newUser = await conn.query('SELECT * FROM users WHERE user_id = ?', [insertedId]);
        console.log("new user signup")
        res.status(201).json(newUser[0]);
    } catch (err) {
        console.error("Erreur lors de l'inscription :", err);
        res.status(500).json({ error: "Erreur lors de l'inscription.", details: err.message });
    } finally {
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
})

app.listen(8000, () => {
    console.log("Serveur a l'ecoute");
})