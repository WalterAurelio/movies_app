const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      dbName: 'MiAppMovies'
    })
  } catch (error) {
    console.error(`Error en la conexión a la base de datos. ${error.message}`);
  }
}

module.exports = connectDatabase;