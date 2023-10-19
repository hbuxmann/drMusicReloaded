const fs = require("fs");
const { validationResult } = require('express-validator');
const path = require("path");
const bcryptjs = require("bcryptjs");
const usersFilePath = path.join(__dirname, "../data/usuarios.json");
const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
const User = require("../models/Users");
const UserDb = require("../models/UsersDb");
const BlacklistLogs = require("../database/models/BlacklistLogs");
const generarCadenaAleatoria = require("../public/js/idRefGenerator");
const axios = require("axios");
const urlSC = 'https://api-dev.sctecnologia.com.ar/ObtenerEvaluacion';
const dbLending_entity_code = require('../functions/dbLending_entity_code');
const dbLending_entity = require('../functions/dbLending_entity');



// acceso a BD
let db = require("../database/models");
const { stringify } = require("querystring");
const { STRING } = require("sequelize");
const Op = db.Sequelize.Op;

const controlUsers = {
  register: function (req, res) {
    let promUser = db.User.findAll();
    let promUserCat = db.UserCategory.findAll();
    let promUserSta = db.UserStatus.findAll();

    Promise.all([promUser, promUserCat, promUserSta])
      .then(([allUsers, allUserCats, allUserSta]) => {
        return res.render(path.resolve(__dirname, "..", "views", "register"), {
          allUsers,
          allUserCats,
          allUserSta,
        });
      })
      .catch((error) => {
          console.log('error-->'+error);
          // res.send(error);
        } );

    // res.render("register"); //por que mierda está 2 veces el render??
  },
  store: function (req, res) {    //Primero me traigo los resultados de la validación del formulario
    var timeInMss = Date.now()

    const resultValidation = validationResult(req);

    console.log(resultValidation);

    if (resultValidation.isEmpty()) {
      //sino hay errores, seguimos adelante
      let encryptedPass = bcryptjs.hashSync(req.body.password, 10);
      // let userToCreate = {};
      let img = "default-img.png";
      if (req.file !== undefined) {
        img = req.file.filename;
      }

      db.User.create({
        first_name: req.body.name,
        last_name: req.body.lastName,
        email: req.body.email,
        password: encryptedPass,
        phone_number: null,
        address: null,
        creation_date: timeInMss,
        last_login: null,
        id_user_category: 1,
        id_user_status: 1,
        avatar: img,
      })
        .then(() => {
          return res.redirect("/users/login");
        })
        .catch((error) => res.send(error));

    } else {
      //Hay errores, entonces volvemos al formulario
      return res.render('register', { errors: resultValidation.mapped(), oldData: req.body });
    }
  },
  login: function (req, res) {
    res.render("login");
  },
  loginProcess: function (req, res) {
    // let userToLogin = User.findByField("email", req.body.email);
    let userToLogin = User.findByFieldMin("email", req.body.email) //datos minimos necesarios
    console.log("userToLogin.rol->" + userToLogin.rol);

    if (userToLogin) {
      let isOkThePassword = bcryptjs.compareSync(
        req.body.password,
        userToLogin.password
      );

      if (isOkThePassword) {
        delete userToLogin.password;
        // console.log('userToLogin: ' + JSON.stringify(userToLogin));
        req.session.userLogged = userToLogin; //si todo esta bien, antes de redirigir a profile, quiero guardar el usuario en session

        if (req.body.recordarme != undefined) {
          // si el usuario tildó el checkbox 'recordarme' guarda en la cookie el valor del usuario
          res.cookie("recordarme", userToLogin, { maxAge: 60000 });
        }
        return res.redirect("/users/profile");
      }
    }
    return res.render("login", {
      errors: {
        email: {
          msg: "Las credenciales son inválidas",
        }
      },
    });
  },  
  loginProcessDb: function (req, res) {
    let userToLogin =  Promise.resolve(UserDb.findByEMail(req.body.email));

    userToLogin.then((value)=> {
      userJson = JSON.parse(JSON.stringify(value));


      if (userJson.length > 0) {
        let isOkThePassword = bcryptjs.compareSync(
          req.body.password,
          userJson[0].password
        );

        if (isOkThePassword) {

          let userLoggedAux = { 
            firstName:  userJson[0].first_name,
            email:      userJson[0].email,
            rol:        userJson[0].category.name,
            estado:     userJson[0].status.type,
            avatar:     userJson[0].avatar
          };
          req.session.userLogged = userLoggedAux; 
  
          if (req.body.recordarme != undefined) {
            // si el usuario tildó el checkbox 'recordarme' guarda en la cookie el valor del usuario
            res.cookie("recordarme", userLoggedAux, { maxAge: 60000 });
          }
          // res.render("userProfile");
          return res.redirect("/users/profile");
        }


      }; 
      return res.render("login", {
        errors: {
          email: {
            msg: "Las credenciales son inválidas, revisa tu usuario y/o contraseña!",
            // old: req.body
          }          
        },
        old : req.body.email,
      });


    });

    
    // res.send('userToLogin');
    //

  },
  profile: function (req, res) {
    let months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Agos", "Sep", "Oct", "Nov", "Dic"];
    let userToLogin =  Promise.resolve(UserDb.findByEMail(req.session.userLogged.email));
    userToLogin.then((user)=> {
    let now = new Date();
    user[0].fecha_creacion      = user[0].creation_date.getDay() + '-'+ months[user[0].creation_date.getMonth()] + '-'+ user[0].creation_date.getFullYear();  
    user[0].fecha_ultimo_login  = now.getDay() + '-'+ months[now.getMonth()] + '-'+ now.getFullYear();   
      res.render('userProfile', { userInfo : user});
    })
    
    // return res.render("userProfile", {
    //   user: req.session.userLogged,
    // });
  },
  edit: function (req, res) {

    db.User.findByPk(req.params.id)
     .then(function(user){
       res.render("userEdit", { user:user } );
      })
  },
  update: function(req, res) {
    db.User.update(
      { 
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number,
        address: req.body.address,
        alt_phone_numnber: req.body.alt_phone_numnber
      },
      {
        where: { id_user: req.params.id}
        }
    )
      .then(function(){
        res.send("usuario modificado")
    })
  },
  logout: function (req, res) {
    req.session.destroy(); // Este método borra cualquier cosa que esté en session
    return res.redirect("/");
  },

  // API
  userList: function (req, res) {
    // lista de usuarios
    let userList = db.User.findAll({
      include: [{association: "category"},{association: "status"}]
    });

    // ultimo usuario creado
    let lastUserCreated = db.User.findAll({   
      include:  [{association: "category"},{association: "status"}],  
      order :   db.Sequelize.literal('User.creation_date DESC'),
      limit: 1
      
    });

    Promise.all([userList, lastUserCreated])
    .then(function([usrs, lastUserCreated]){
      let aux_users = usrs.map(function(u){
        u.dataValues.detailUrl = 'http://localhost:3000/users/api/userdetail/'+u.dataValues.id_user;
        delete u.dataValues.password;
        return u;
      });
      lastUserCreated[0].dataValues.detailUrl = 'http://localhost:3000/users/api/userdetail/'+lastUserCreated[0].dataValues.id_user;
      delete lastUserCreated[0].dataValues.password;
      //
      return res.status(200)
      .json({
          users:              aux_users,
          lastUserCreated:    lastUserCreated,
          usersCount:         usrs.length,
          status:             200
      })

    })
    .catch(function (err) {
      return res.status(200).json({
        error:      err,
        status:     500

      });
    });
  },
  userDetail: function (req, res) {
    //
    db.User.findByPk(req.params.id,{
      include: [{association: "category"},{association: "status"}]
    })
    .then(function(user){
      return res.status(200).json({
        data: user,
        status: 200

      });
     })
    .catch(function (err) {
      return res.status(200).json({
        error: err,
        status: 500

      });
    });
  },
  // *****************************************************************************
  // BLACKLIST SANTANDER *********************************************************
  // *****************************************************************************
  blackList: function (req, res) {
    let errMsg;
    let codeErrMsg;
    //const globalLending_entity_code = req.app.locals.globalLending_entity_code;

    const loginInterface = { 
      Login: 'CLAVEVITAL',
      Clave: "santander1"
    };
    let recordBlackListLog = {
        request:      JSON.stringify(req.body),
        dateRequest:  new Date(),
        response:     '',
        dateResponse: new Date(),
        idRef:        '',
        status:       0,
        lender:       '',
        nationalid:   '', 
        requestsc:    '', 
        responsesc:   '', 
        rejected:     Boolean

    };
    // payload to Santander
    let payloadSC = { 
      LoginInterface: loginInterface,
      IdComercio: Number,
      IdProducto: Number,
      IdUsuario: Number,
      IdTipoDocumento: 1,
      Documento: req.body.nationalId,
      IdSexo: (req.body.gender == 'MALE' ? 2 : 3),
      ApellidoYNombre: req.body.fullName,
      TelefonoCelular: req.body.phoneNumber,
      IdNacionalidad: req.body.nationality,
      IdRef: generarCadenaAleatoria()
    };
    let disbursementTypes;
    let items;
    let disbursementTypesAux = [];
    let itemsAux = [];
    

    let payload = { 
      idRef:            String,
      isBlackList:      Boolean, 
      approvedAmount:   Number, 
      minimumApproved:  Number,
      pendingId:        Number,
      clientId:         Number,
      messageCampaign:  String, 
      items:            [],
      pricing:          String
    };     

    const apiKey = 'Hc5KW8gjv53rZqmxP0jIS3UJZqoVN2rW1M2g2ZWT';
    //const apiKey = 'sarasa';
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
        //'Cache-Control: no-cache' 
      },
    };

    // definir el organismo para identificar el idPlan que corresponde
    let idPlan = 0;
    //
    if (req.body.idPlan !== undefined) {
      idPlan = req.body.idPlan;
    } else if (req.body.employerFiscalId !== undefined){
      idPlan = req.body.employerFiscalId.substring(req.body.employerFiscalId.indexOf('-')+1,req.body.employerFiscalId.length);
    }
    const credentials = validateCredentials({ 
      entity: req.body.lender, 
      idplan: idPlan
    });
    console.log('credenciales: ' + JSON.stringify(credentials));
    //
    recordBlackListLog.nationalid   = req.body.nationalId;
    recordBlackListLog.lender       = req.body.lender; 
    //
    if (credentials.error) {
      recordBlackListLog.status       = 400;
      recordBlackListLog.dateResponse = new Date();
      recordBlackListLog.response     = JSON.stringify({error: credentials.errorMsg});   
      recordBlackListLog.rejected     = null;
      
      storeBlackListLog(recordBlackListLog);
      return res.status(400).json({error: credentials.errorMsg}); 
    } else {
      payloadSC.IdComercio  = credentials.IdCommerce;
      payloadSC.IdProducto  = credentials.IdProduct;
      payloadSC.IdUsuario   = credentials.IdUser;
    }

    //
    //console.log(payloadSC); 
    recordBlackListLog.requestsc    = JSON.stringify(payloadSC, null, 2);
    //
    //console.log("globalLending_entity_code: "+global.globalLending_entity_code);  
    /*
    console.log("lending_entity_code: "+JSON.stringify(global.lending_entity_code));  
    console.log("lending_entity: "+JSON.stringify(global.lending_entity));  
    */
    //    
    axios.post(urlSC, payloadSC, axiosConfig)
    .then(response => {
      payload.idRef             = payloadSC.IdRef;
      payload.isBlackList       = (response.data.ResultadoInterface.Resultado == 1 ? false : true);
      payload.approvedAmount    = response.data.MontoAprobado;
      payload.minimumApproved   = response.data.MontoAprobadoMinimo;
      payload.pendingId         = response.data.IdSolicitudPendiente;
      payload.clientId          = response.data.IdCliente;
      payload.messageCampaign   = response.data.MensajeCompania;
      payload.pricing           = response.data.Pricing;
      //
      items = response.data.Articulo;
      if (items != null) {
        items.forEach(item=>{
          /*
          console.log("Id: "+item.Id);
          console.log("Descripcion: "+item.Descripcion);
          console.log("TipoFormaDesembolso: "+JSON.stringify(item.TipoFormaDesembolso[0]));
          */
          disbursementTypes = item.TipoFormaDesembolso;
          disbursementTypes.forEach(dt=>{
            console.log("Id: "+dt.Id);
            console.log("Descripcion: "+ dt.Descripcion);
            console.log("Tipo: "+dt.Tipo);
            disbursementTypesAux.push({
              id:             dt.Id,
              description:    dt.Descripcion,
              type:           dt.Tipo
            });
          });
          itemsAux.push({
            id:                 item.Id,
            description:        item.Descripcion,
            disbursementTypes:  disbursementTypesAux
          });                               
        });
        console.log("Colecciones: "+JSON.stringify(itemsAux)); 
        payload.items             = itemsAux;
      } else {
        payload.items = null;
      }
      //console.log("Items: "+JSON.stringify(items));
      //disbursementTypes = response.data.Articulo[0].TipoFormaDesembolso;
      //console.log("disbursementTypes: "+JSON.stringify(disbursementTypes));
      
      /*
      console.log('Respuesta del servidor:', response.data);
      console.log('Status: '+response.status);
      */
      //recordBlackListLog.response     = JSON.stringify(response.data);
      recordBlackListLog.response     = JSON.stringify(payload);
      recordBlackListLog.dateResponse = new Date();
      recordBlackListLog.idRef        = payloadSC.IdRef;
      recordBlackListLog.status       = response.status;
      recordBlackListLog.responsesc   = JSON.stringify(response.data); 
      recordBlackListLog.rejected     = (response.data.ResultadoInterface.Resultado == 1 ? 0 : 1);
      storeBlackListLog(recordBlackListLog);
      //return res.status(200).json(response.data);  
      return res.status(200).json(payload);   
    })
    .catch(error => {
      if (error.response) {
        // La solicitud fue hecha y el servidor respondió con un código de estado diferente de 2xx
        console.error('Código de estado HTTP de error:', error.response.status);
        console.error('Datos de la respuesta de error:', error.response.data);
        errMsg = error.response.data;
        codeErrMsg = error.response.status;
  
        if (error.response.status === 403) {
          console.error('Error 403: Acceso prohibido.');
          // Manejar específicamente el error 403 aquí
        } else if (error.response.status === 504) {
          console.error('Error 504: Gateway Timeout.');
          // Manejar específicamente el error 504 aquí
        } else {
          // Manejar otros códigos de estado si es necesario
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió ninguna respuesta
        console.error('No se recibió respuesta del servidor.');
        errMsg = "No response received from the server";
        codeErrMsg = 500;
      } else {
        // Algo ocurrió en la configuración de la solicitud que provocó el error
        console.error('Error durante la configuración de la solicitud:', error.message);
        errMsg = "There was an error during configuration tasks, please contact to Help Desk";
        codeErrMsg = 500;
      }
      
      recordBlackListLog.response     = JSON.stringify(errMsg);      
      recordBlackListLog.dateResponse = new Date();
      recordBlackListLog.idRef        = payloadSC.IdRef;
      recordBlackListLog.status       = codeErrMsg;
      recordBlackListLog.responsesc   = error.message;
      recordBlackListLog.rejected     = null;
      storeBlackListLog(recordBlackListLog);
      console.error('Error en la solicitud:', error.message);
    
      return res.status(codeErrMsg).json(errMsg);
    });


  }


};

function storeBlackListLog (record) { 
  db.BlacklistLogs.create({
    request       : record.request, 
    dateRequest   : record.dateRequest,
    response      : record.response,
    dateResponse  : record.dateResponse, 
    idRef         : record.idRef, 
    status        : record.status, 
    lender        : record.lender, 
    nationalid    : record.nationalid, 
    requestsc     : record.requestsc, 
    responsesc    : record.responsesc, 
    rejected      : record.rejected
    
  })
  .then(() => {
    console.log("Grabado OK")
  })
  .catch((error) => console.log("Error: "+error));
};
//

function validateCredentials (cred) { 
  //
  let recordRes = { 
    IdCommerce:   Number, 
    IdProduct:    Number,
    IdUser:       Number, 
    errorMsg:     String, 
    error:        Boolean
  } 
  //
  const inputLender = global.lending_entity.find(entity => entity['lending_code'] === cred.entity);

  if (inputLender === undefined) {
    (async () => {
        try{
          global.lending_entity = await dbLending_entity();
        } catch (error){
          console.error('Error trying to recover lending_entity_code:', error);
        }
      })();
      recordRes.errorMsg  = 'Lender '+cred.entity+' not found, please contact to Help Desk';
      recordRes.error     = true;
      return recordRes;
  } else {
    //
    const inputOrgnanism = global.lending_entity_code.find(objeto => objeto['lending_entity_id'] === inputLender.id && objeto['product_identifier'] === cred.idplan);
    //
    if (inputOrgnanism === undefined) {
      (async () => {
        try{
          global.lending_entity_code = await dbLending_entity_code();
        } catch (error){
          console.error('Error trying to recover credentials:', error);
        }
      })();
      recordRes.errorMsg  = 'Credential not found, please contact to Help Desk';
      recordRes.error     = true;
      return recordRes;
    } else {
      recordRes.IdCommerce  = inputOrgnanism.commerce_id;
      recordRes.IdProduct   = inputOrgnanism.IdProduct;
      recordRes.IdUser      = inputOrgnanism.IdUser;
      recordRes.errorMsg    = 'No error';
      recordRes.error       =  false;
      return recordRes;
    }
  };
}


module.exports = controlUsers;
