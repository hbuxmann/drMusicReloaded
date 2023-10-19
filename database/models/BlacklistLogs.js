module.exports = function(sequelize, dataTypes) {
    
    let alias = "BlacklistLogs"; 
    
    let cols = {  //cada columna es un objeto literal
        idblackListLogs: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        request: {
            type: dataTypes.STRING(1024)
        },
        dateRequest: {
            type: dataTypes.DATE                     
        },
        response: {
            type: dataTypes.STRING(1024)
        },
        dateResponse: {
            type: dataTypes.DATE                     
        },
        idRef: {
            type: dataTypes.STRING                     
        },
        status: {
            type: dataTypes.INTEGER
        }, 
        lender: {
            type: dataTypes.STRING
        },
        nationalid: {
            type: dataTypes.STRING
        },
        requestsc: {
            type: dataTypes.STRING(1024)
        },
        responsesc: {
            type: dataTypes.STRING(1024)
        },
        rejected: {
            type: dataTypes.BOOLEAN
        }        
    }
    
    let config = {
        tableName: "blacklistlogs",
        timestamps: false
    }
    let BlacklistLogs = sequelize.define(alias, cols, config);


    /*
    ProdPrice.associate = function(models) {
        ProdPrice.belongsTo(models.Product, {
            as: "prod_price",
            foreignKey: "id_product"
        })
    }
    */

    return BlacklistLogs;

}
