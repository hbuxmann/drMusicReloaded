const db = require('../database/models');
const Op = db.Sequelize.Op;

async function dbLending_entity_code() {
  try {
    const data = await db.Lending_entity_code.findAll();  // Ejemplo con Sequelize
    return data;
  } catch (error) {
    console.error('Error recovering lending_entity_code:', error);
    throw error;
  }
}

module.exports = dbLending_entity_code;
