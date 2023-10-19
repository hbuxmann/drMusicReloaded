module.exports = function(sequelize, dataTypes) {
    
    let alias = "Lending_entity"; 
    
    let cols = {  //cada columna es un objeto literal
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: dataTypes.STRING
        }, 
        lending_code: {
            type: dataTypes.STRING
        },
        code_identification_method: {
            type: dataTypes.STRING
        }    
    }
    
    let config = {
        tableName: "lending_entity",
        timestamps: false
    }
    let Lending_entity = sequelize.define(alias, cols, config);


    /*
    ProdPrice.associate = function(models) {
        ProdPrice.belongsTo(models.Product, {
            as: "prod_price",
            foreignKey: "id_product"
        })
    }
    */

    return Lending_entity;

}
