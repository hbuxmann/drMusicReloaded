module.exports = function(sequelize, dataTypes) {
    
    let alias = "Lending_entity_code"; 
    
    let cols = {  //cada columna es un objeto literal
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        lending_entity_id: {
            type: dataTypes.INTEGER
        }, 
        product_identifier: {
            type: dataTypes.INTEGER
        },
        commerce_id: {
            type: dataTypes.INTEGER
        },
        IdProduct: {
            type: dataTypes.INTEGER
        },
        IdUser: {
            type: dataTypes.INTEGER
        }
    }
    
    let config = {
        tableName: "lending_entity_code",
        timestamps: false
    }
    let Lending_entity_code = sequelize.define(alias, cols, config);


    
    Lending_entity_code.associate = function(models) {
        Lending_entity_code.belongsTo(models.Lending_entity, {
            as: "Lending_entity",
            foreignKey: "lending_entity_id"
        })
    }
    

    return Lending_entity_code;

}
