const PaymentsProcessor = require("../PaymentsProcessor");

module.exports = class StripePaymentProcessor extends PaymentsProcessor {
  constructor(validator, dao, exchangeService, stripeSerivce, storageService) {
    super(validator, dao, exchangeService, storageService);
    this.stripeService = stripeSerivce;
  }

  // Tạo đơn hàng
  createOrder = async (cart, url = {}) => {
    // Kiểm tra giỏ hàng
    this.checkValidateCart(cart);

    const { successUrl, cancelUrl, baseUrl } = url;
    // Kiểm tra success url
    this.checkValidateUrl(successUrl);

    // Kiểm tra cancel url
    this.checkValidateUrl(cancelUrl);

    const order = await this.createOrderFromCartAsync(cart);

    // Chuyển sang USD
    const usdOrderProducts = await this.convertToUSD(order.orderProducts);

    // Về server xử lý trước
    const serverSuccessUrl = baseUrl + `/${order.id}?successUrl=${successUrl}`;
    const stripeUrl = await this.stripeService.createOrder(
      usdOrderProducts,
      serverSuccessUrl,
      cancelUrl
    );

    //Lưu tạm order
    order.payment = "stripe";
    await this.storeOrder(order);

    return stripeUrl;
  };

  // Chuyển giá tiền trong danh sách đặt hàng sang USD
  convertToUSD = async (orderProducts) => {
    const usdOrderProducts = [];

    for (let i = 0; i < orderProducts.length; i++) {
      const op = orderProducts[i];

      const usdPrice = await this.exchangeService
        .convert(op.prod_price)
        .to("USD");

      const usdOp = {
        ...op,
        prod_price: usdPrice,
      };

      usdOrderProducts.push(usdOp);
    }

    return usdOrderProducts;
  };

  // Lưu đơn hàng đã thanh toán
  checkoutOrder = async (id, { successUrl }) => {
    this.checkValidate(() => this.validator.validateId(id));
    this.checkValidateUrl(successUrl);

    const saveOrderId = await this.checkout(id);

    return `${successUrl}/${saveOrderId}`;
  };
};
