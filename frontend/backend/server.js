const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth'); // если есть

dotenv.config();

const app = express();
app.use(cors()); // разрешает запросы с фронта
app.use(express.json());

app.use('/api/auth', authRoutes); // маршрут авторизации

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
