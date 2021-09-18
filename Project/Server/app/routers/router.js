const authenticationRouter = require("./authentication_routers/authenticationRouter");
const notesRouter = require("./notes_routers/notesRouter");
const productsRouter = require("./products_routers/productsRouter");
const payPalRouter = require("./payments_routers/payPalPaymentRouters/payPalPaymentRouter");
const stripeRouter = require("./payments_routers/stripePaymenRouters/stripePaymentRouter");
const moderatorsRouter = require("./moderators_routers/moderatorsRouter");

// Mỗi controller sẽ có mỗi router
module.exports = (app) => {
  app.use("/api/authentication", authenticationRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/paypal", payPalRouter);
  app.use("/api/stripe", stripeRouter);
  app.use("/api/moderators", moderatorsRouter);
};
