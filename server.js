const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ⚡ Variables de entorno
const CALENDAR_ID = process.env.CALENDAR_ID;

// 🔑 Configuración con Service Account
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth: jwtClient });

// 📌 Crear evento
app.post('/add-event', async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, fecha, hora, servicio, nota } = req.body;

    const startDateTime = new Date(`${fecha}T${hora}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `${nombre} - ${servicio}`,
      description: `Tel: ${telefono}\nEmail: ${email}\nNota: ${nota}`,
      location: direccion,
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() }
    };

    const response = await calendar.events.insert({ calendarId: CALENDAR_ID, resource: event });
    res.status(200).json({ message: 'Evento creado en Google Calendar ✅', data: response.data });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'No se pudo crear el evento' });
  }
});

// 📌 Listar eventos
app.get('/events', async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      maxResults: 20,
      orderBy: 'startTime',
      singleEvents: true
    });
    res.status(200).json(response.data.items);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'No se pudo obtener los eventos' });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend en puerto ${PORT}`));
