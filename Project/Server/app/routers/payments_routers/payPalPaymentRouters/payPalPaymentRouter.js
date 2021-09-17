const express = require("express");
const router = express.Router();
const config = require("../../../config");

// Router gắn endpoints vào controller

// Bắt lỗi server
const { errorCatch } = require("../../routerErrorHandler");

const {
  PayPalPaymentController,
  PayPalService,
} = require("../../../controllers/controllersContainer");

const { CustomersOrdersDAO } = require("../../../daos/daosContainer");

const dao = new CustomersOrdersDAO();

const payPalService = new PayPalService(config.paypal, dao);

const controller = new PayPalPaymentController(payPalService);

// Bắt buộc đăng nhập
router.route("/clientId").get(errorCatch(controller.getClientId));

router.route("/createOrder").post(errorCatch(controller.createOrder));

router.route("/captureOrder/:orderID").get(errorCatch(controller.captureOrder));

module.exports = router;