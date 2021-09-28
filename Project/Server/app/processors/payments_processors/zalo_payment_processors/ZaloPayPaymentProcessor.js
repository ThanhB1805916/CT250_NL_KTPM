const SessionPaymentProcessor = require("../SessionPaymentProcessor");
const { NotValidError } = require("../../../errors/errorsContainer");

module.exports = class ZaloPayPaymentProcessor extends SessionPaymentProcessor {
  constructor(validator, dao, currencyService, zaloPaySerivce) {
    super(validator, dao, currencyService);
    this.zaloPayService = zaloPaySerivce;
  }

  createOrder = async (cart, url) => {
    // Kiểm tra giỏ hàng
    this.checkValidateCart(cart);

    // Kiểm tra url
    this.checkValidateUrl(url);

    const order = await this.createOrderFromCartAsync(cart);

    const zaloPayUrl = await this.zaloPayService.createOrder(
      order.id,
      order.total,
      url
    );

    // Lưu tạm oder
    order.payment = "zalopay";
    this.storeOrder(order);

    return zaloPayUrl;
  };

  // Lưu đơn hàng đã thanh toán
  checkoutOrder = async (id, query) => {
    this.checkValidate(() => this.validator.validateId(id));

    const { successUrl, cancelUrl } = query.url || {};
    this.checkValidateUrl(successUrl);
    this.checkValidateUrl(cancelUrl);

    // Kiểm tra thông tin thanh toán không bị thay đổi
    const valid = this.zaloPayService.validRedirectQuery(query);
    if (!valid) {
      throw new NotValidError("ZaloPay url query string has been changed");
    }

    // Kiểm tra khách hàng đã thanh toán
    const { status } = query;
    const paid = Number(status) === 1;
    if (!paid) {
      return cancelUrl;
    }

    const saveOrderId = await this.checkout(id);

    return `${successUrl}/${saveOrderId}`;
  };
};
