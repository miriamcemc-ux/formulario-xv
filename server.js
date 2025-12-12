// server.js
import express from 'express';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html y archivos estáticos

// Conexión a PostgreSQL usando la variable de entorno DATABASE_URL de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necesario en Render
});

// Crear tabla si no existe
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS respuestas (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      respuesta TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// Endpoint POST /guardar
app.post('/guardar', async (req, res) => {
  try {
    const { nombre, respuesta } = req.body;
    if (!nombre || !respuesta) return res.status(400).send('Faltan datos');

    await pool.query(
      'INSERT INTO respuestas (nombre, respuesta) VALUES ($1, $2)',
      [nombre, respuesta]
    );

    res.send('Respuesta registrada');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al guardar la respuesta');
  }
});

// Endpoint GET /respuestas (orden alfabético)
app.get('/respuestas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM respuestas ORDER BY nombre ASC');

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
          </tr>
    `;

    result.rows.forEach(r => {
      html += `<tr>
        <td>${r.nombre}</td>
        <td>${r.respuesta}</td>
        <td>${new Date(r.fecha).toLocaleString()}</td>
      </tr>`;
    });

    html += `</table></body></html>`;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener respuestas');
  }
});

// Iniciar servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
