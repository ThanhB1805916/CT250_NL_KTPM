const express = require("express");
const router = express.Router();
const config = require("../../config");

const { AuthenticationDAO } = require("../../daos/daosContainer");

const {
  JwtService,
  AuthenticationController,
  AuthenticationValidator,
} = require("../../controllers/controllersContainer");

const dao = new AuthenticationDAO();
const validator = new AuthenticationValidator();
const jwt = new JwtService(config.secretKey);

const controller = new AuthenticationController(validator, jwt, dao);

// Bắc buộc đăng nhập
router
  .route("/getUser")
  .get(
    controller.authenticate,
    controller.authorize(""),
    controller.getLoginUser
  );

router.route("/login").post(controller.login);

module.exports = router;
