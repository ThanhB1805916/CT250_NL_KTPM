const express = require("express");
const router = express.Router();

const { errorCatch } = require("../routerErrorHandler");

const { NotesController } = require("../../controllers/controllersContainer");

let controller = new NotesController();

router.route("/").get(errorCatch(controller.getList)).post(controller.post);

router
  .route("/:id")
  .get(controller.getById)
  .put(controller.put)
  .delete(controller.delete);

module.exports = router;