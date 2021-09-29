export default class ZaloPaymentService {
  constructor(apiCaller) {
    this.apiCaller = apiCaller;
  }

  // Tạo đơn hàng theo danh sách sản phẩm
  createOrder = async (cart) => {
    const successUrl = "http://localhost:3000/success/zalo";
    const cancelUrl = "http://localhost:3000";
    console.log(cart)
    const { url } = await this.apiCaller.post(
      `zalo/createOrder?successUrl=${successUrl}&cancelUrl=${cancelUrl}`,
      cart
    );

    return url;
  };
}
