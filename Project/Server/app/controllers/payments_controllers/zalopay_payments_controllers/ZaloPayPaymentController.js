const PaymentsController = require("../PaymentsController");

module.exports = class ZaloPayPaymentController extends PaymentsController {
  constructor(processor, config) {
    super(processor, config);
  }

  // Tạo đơn hàng
  createOrder = async (req, res) => {
    const { successUrl, cancelUrl } = req.query;

    this.processor.checkValidateUrl(successUrl);
    this.processor.checkValidateUrl(cancelUrl);

    const serverCheckoutUrl = `${req.protocol}://${req.headers.host}/api/payments/zalo/checkoutOrder`;
    const { body: cart } = req;
    const url = await this.processor.createOrder(cart, {
      successUrl,
      cancelUrl,
      baseUrl: serverCheckoutUrl,
    });

    return this.created(res, { url });
  };
};
