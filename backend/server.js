require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDatabase = require('./config/dbConnect');
const authRoutes = require('./routes/api/auth.routes');
const verifyJWT = require('./middlewares/verifyJWT');
const credentials = require('./middlewares/credentials');

const verifyRoles = require('./middlewares/verifyRoles');
const { Autor, Editor, User } = require('./config/rolesList');

// Conectar base de datos
connectDatabase();

app.use(credentials);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use(verifyJWT);

app.get('/recurso', verifyRoles(User), (req, res) => {
  return res.json({ message: 'Hola' });
})

// Escuchar el puerto determinado
mongoose.connection.once('open', () => {
  console.log('Conexión a la base de datos exitosa.');
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}...`);
  });
});