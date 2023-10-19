const express = require("express");
const router = express.Router();
const path = require("path");
const usersController = require("../controllers/usersController");

//Middlewares
const multer = require("multer");
const guestMiddleware = require("../middlewares/guestMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const validations = require('../middlewares/validateRegisterMiddleware');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/users");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

//Formulario de Register

router.get("/register", usersController.register);
router.post("/register", upload.single("img"), validations, usersController.store);

//Formulario de Login

router.get("/login", guestMiddleware, usersController.login);

//Procesar el Login

// router.post("/login", usersController.loginProcess);
router.post("/login", usersController.loginProcessDb);

//Perfil de usuario

router.get("/profile", authMiddleware, usersController.profile);

//Editar usuario

router.get("/edit/:id", usersController.edit);
router.post("/update/:id", usersController.update);

//Logout

router.get("/logout/", usersController.logout);

//APIs
router.get("/api/userlist",           usersController.userList);
router.get("/api/userdetail/:id",     usersController.userDetail);
router.post("/api/blacklist",     usersController.blackList);

module.exports = router;
