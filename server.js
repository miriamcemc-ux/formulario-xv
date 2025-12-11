import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(express.json());
app.use(express.static(".")); // sirve formulario.html

let db;

// Crear o abrir base de datos
(async () => {
    db = await open({
        filename: "respuestas.db",
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS asistencia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            respuesta TEXT,
            fecha TEXT
        );
    `);
})();

// Guardar respuestas enviadas desde el formulario
app.post("/guardar", async (req, res) => {
    const { respuesta } = req.body;

    await db.run(
        "INSERT INTO asistencia (respuesta, fecha) VALUES (?, datetime('now'))",
        [respuesta]
    );

    res.send("Respuesta guardada ✔");
});

// Ver respuestas guardadas en tabla HTML
app.get("/respuestas", async (req, res) => {
    try {
        const filas = await db.all("SELECT id, respuesta, fecha FROM asistencia ORDER BY id DESC");
        
        let html = `<!doctype html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Respuestas</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { border-collapse: collapse; width: 100%; max-width: 800px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background:#f4f4f4; }
            </style>
        </head>
        <body>
            <h2>Respuestas registradas</h2>
            <table>
                <thead><tr><th>ID</th><th>Respuesta</th><th>Fecha</th></tr></thead>
                <tbody>`;

        for (const row of filas) {
            html += `<tr><td>${row.id}</td><td>${row.respuesta}</td><td>${row.fecha}</td></tr>`;
        }

        html += `</tbody></table>
        </body>
        </html>`;

        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener respuestas");
    }
});

// Descargar CSV
app.get("/export", async (req, res) => {
    try {
        const filas = await db.all("SELECT id, respuesta, fecha FROM asistencia ORDER BY id ASC");

        let csv = "id,respuesta,fecha\n";
        for (const f of filas) {
            csv += `${f.id},"${f.respuesta}",${f.fecha}\n`;
        }

        res.setHeader("Content-Type", "text/csv;charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=respuestas.csv");
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error exportando CSV");
    }
});

// Página para ver respuestas
app.get("/admin", async (req, res) => {
    const filas = await db.all("SELECT * FROM asistencia ORDER BY id DESC");

    let html = `
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Respuestas</title>
            <style>
                body { 
                    font-family: Arial; 
                    background: #f4f4f4; 
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    margin-top: 20px;
                }
                th, td {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background: #0f1a2b;
                    color: white;
                }
            </style>
        </head>
        <body>
            <h1>Respuestas registradas</h1>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Respuesta</th>
                    <th>Fecha</th>
                </tr>
    `;

    filas.forEach(f => {
        html += `
            <tr>
                <td>${f.id}</td>
                <td>${f.respuesta}</td>
                <td>${f.fecha}</td>
            </tr>
        `;
    });

    html += `
            </table>
        </body>
        </html>
    `;

    res.send(html);
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
