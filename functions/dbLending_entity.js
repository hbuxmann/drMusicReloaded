const db = require('../database/models');
const Op = db.Sequelize.Op;

async function dbLending_entity() {
  try {
    const data = await db.Lending_entity.findAll();  // Ejemplo con Sequelize
    return data;
  } catch (error) {
    console.error('Error recovering lending_entity_code:', error);
    throw error;
  }
}

module.exports = dbLending_entity;
