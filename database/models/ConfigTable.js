module.exports = function(sequelize, dataTypes) {
    
    let alias = "ConfigTable"; 
    
    let cols = {  //cada columna es un objeto literal
        idconfigTable: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        key: {
            type: dataTypes.STRING
        },
        value: {
            type: dataTypes.STRING
        }    
    }
    
    let config = {
        tableName: "configtable",
        timestamps: false
    }
    let ConfigTable = sequelize.define(alias, cols, config);


    return ConfigTable;

}
