import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(express.json());
app.use(express.static(".")); // Sirve index.html

let db;

// BASE DE DATOS
(async () => {
    db = await open({
        filename: "respuestas.db",
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS asistencia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            respuesta TEXT,
            fecha TEXT
        );
    `);
})();

// GUARDAR RESPUESTA
app.post("/guardar", async (req, res) => {
    const { nombre, respuesta } = req.body;

    await db.run(
        "INSERT INTO asistencia (nombre, respuesta, fecha) VALUES (?, ?, datetime('now'))",
        [nombre, respuesta]
    );

    res.send("OK");
});

// ADMIN
app.get("/admin", async (req, res) => {
    const datos = await db.all("SELECT * FROM asistencia ORDER BY fecha DESC");

    let html = `
        <h1>Respuestas registradas</h1>
        <table border="1" cellpadding="8" style="border-collapse: collapse;">
        <tr><th>ID</th><th>Nombre</th><th>Respuesta</th><th>Fecha</th></tr>
    `;

    datos.forEach(r => {
        html += `<tr>
            <td>${r.id}</td>
            <td>${r.nombre}</td>
            <td>${r.respuesta}</td>
            <td>${r.fecha}</td>
        </tr>`;
    });

    html += "</table>";

    res.send(html);
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));

