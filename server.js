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


app.listen(8000, () => {
    console.log("Serveur a l'ecoute");
})