// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Array temporal para almacenar respuestas
let respuestas = [];

// Endpoint POST /guardar
app.post('/guardar', (req, res) => {
    const { nombre, respuesta } = req.body;
    if (!nombre || !respuesta) {
        return res.status(400).send('Faltan datos');
    }
    respuestas.push({ nombre, respuesta, fecha: new Date() });
    res.send('Respuesta registrada');
});

// Endpoint GET /respuestas
app.get('/respuestas', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Respuestas XV José</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #fefcf5; }
            h1 { color: #2c3e50; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border: 1px solid #aaa; text-align: left; }
            th { background: #5a7399; color: white; }
            tr:nth-child(even) { background: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>Confirmaciones de asistencia</h1>
        <table>
            <tr>
                <th>Nombre</th>
                <th>Asistencia</th>
                <th>Fecha</th>
            </tr>`;

    respuestas.forEach(r => {
        html += `<tr>
            <td>${r.nombre}</td>
            <td>${r.respuesta}</td>
            <td>${r.fecha.toLocaleString()}</td>
        </tr>`;
    });

    html += `
        </table>
    </body>
    </html>`;

    res.send(html);
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
