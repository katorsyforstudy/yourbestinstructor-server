// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, 'students.json');

// Инициализация файла
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, '[]', 'utf8');
  }
}

// Загрузка учеников
async function loadStudents() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Сохранение учеников
async function saveStudents(students) {
  await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2), 'utf8');
}

// POST /send (форма контактов)
app.post('/send', async (req, res) => {
  const { name, phone, message } = req.body;

  try {
    const students = await loadStudents();
    students.push({
      id: Date.now(),
      name,
      phone,
      message,
      type: 'contact',
      createdAt: new Date().toISOString(),
    });
    await saveStudents(students);
    res.status(200).json({ success: true, message: "Сообщение принято!" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /booking (бронирование)
app.post('/booking', async (req, res) => {
  const { name, phone, date, time } = req.body;

  try {
    const students = await loadStudents();
    students.push({
      id: Date.now(),
      name,
      phone,
      date,
      time,
      type: 'booking',
      createdAt: new Date().toISOString(),
    });
    await saveStudents(students);
    res.status(200).json({ success: true, message: "Занятие забронировано!" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /students (для админки)
app.get('/students', async (req, res) => {
  try {
    const students = await loadStudents();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Ошибка чтения данных" });
  }
});

// старт сервера
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await initDB();
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
