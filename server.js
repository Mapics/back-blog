const express = require('express')
const mariadb = require('mariadb')
const bcrypt = require('bcrypt')

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

app.post("/articles/post", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        const { title, content, author } = req.body;

        const result = await conn.query(
            'INSERT INTO articles (title, content, author) VALUES (?, ?, ?)',
            [title, content, author]
        );

        // Récupère l'ID de l'article nouvellement créé
        const insertedId = result.insertId;

        // Récupère l'article créé en le sélectionnant par son ID
        const newArticle = await conn.query('SELECT * FROM articles WHERE article_id = ?', [insertedId]);

        res.status(201).json(newArticle[0]);  // Répond avec l'article nouvellement créé
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la création de l'article." });
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
   console.log('tentative de connexion')
   try {
        conn = await pool.getConnection();
        const { email, password } = req.body;
        const user = await conn.query('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            res.status(404).json({ error: "Utilisateur non trouvé." });
            return;
        }
        const hashedPassword = user[0].password;
        console.log(password, hashedPassword)
        const passwordMatch = await bcrypt.compare(password, hashedPassword) ;
        bcrypt.compare(password, hashedPassword, function(err, response){
            if (response) {
                console.log("Mot de passe correct");
            } else {
                console.log("Mot de passe incorrect" + err);
            }
        })
        // if (passwordMatch) {
        //     res.status(200).json({ message: "Connexion réussie." });
        // } else {
        //     res.status(401).json({ error: "Mot de passe incorrect." });
        // }
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la connexion." });
    } finally {
        console.log('echoué')
        if (conn) conn.release(); // Toujours libérer la connexion après usage
    }
});

app.post("/signup", async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { email, password, username, userfirstname } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await conn.query(
            'INSERT INTO users (email, password, username, userfirstname) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, username, userfirstname]
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