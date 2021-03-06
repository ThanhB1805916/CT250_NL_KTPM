const {
  StripePaymentProcessor,
} = require("../../../../app/processors/processorsContainer");
const {
  PaymentValidatorMock,
  PaymentDAOMock,
  CurrencyExchangeServiceMock,
  StorageServiceMock,
} = require("../paymentsProcessorHelper");
const {
  NotValidError,
  NotExistError,
} = require("../../../../app/errors/errorsContainer");

//#region  INIT

class StripeServiceMock {
  createOrder = jest.fn(() => {
    return "wtf";
  });

  saveOrder = jest.fn();
}

//#endregion

let validatorMock;
let serviceMock;
let daoMock;
let exServiceMock;
let strgServiceMock;

function getProcessor() {
  return new StripePaymentProcessor(
    validatorMock,
    daoMock,
    exServiceMock,
    serviceMock,
    strgServiceMock
  );
}

// Tạo một đơn hàng cần
// Danh sách đối tượng gồm số lượng sản phẩm  + mã sản phẩm
// Url của client khi thành công
// Url khi thất bại
describe("Proc Tạo đơn hàng", () => {
  beforeEach(() => {
    validatorMock = new PaymentValidatorMock();
    serviceMock = new StripeServiceMock();
    daoMock = new PaymentDAOMock();
    exServiceMock = new CurrencyExchangeServiceMock();
    strgServiceMock = new StorageServiceMock();
  });

  jest.useFakeTimers();

  test("Không hợp lệ - EX", async () => {
    //Arrange
    const cart = undefined;
    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.createOrder(cart);
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateCart).toBeCalledTimes(1);
  });

  test("Thiếu successUrl - EX", async () => {
    //Arrange
    const cart = { products: [] };
    const successUrl = "//";

    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.createOrder(cart, { successUrl });
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateCart).toBeCalledTimes(1);
    expect(validatorMock.validateUrl).toBeCalledTimes(1);
  });

  test("Thiếu cancelUrl - 400", async () => {
    //Arrange
    const cart = { products: [] };
    const successUrl = "";
    const cancelUrl = "//";

    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.createOrder(cart, { successUrl, cancelUrl });
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateCart).toBeCalledTimes(1);
    expect(validatorMock.validateUrl).toBeCalledTimes(2);
  });

  test("Tạo thành công trả về url", async () => {
    //Arrange
    const cart = { products: [{ prod_pice: 2000 }] };
    const successUrl = "yes";
    const cancelUrl = "wtf";
    const processor = getProcessor();

    //Act
    const expRs = "wtf";
    const actRs = await processor.createOrder(cart, successUrl, cancelUrl);

    //Expect
    expect(actRs).toEqual(expRs);
    expect(validatorMock.validateCart).toBeCalledTimes(1);
    expect(serviceMock.createOrder).toBeCalledTimes(1);
    expect(daoMock.getOrderProduct).toBeCalledTimes(1);
    expect(exServiceMock.convert).toBeCalledTimes(1);
  });

  test("Tạo thành công order hết hạng sau 1 ngày", async () => {
    //Arrange
    const cart = { products: [{ prod_pice: 2000 }] };
    const successUrl = "yes";
    const cancelUrl = "wtf";
    const processor = getProcessor();

    //Act
    const expRs = "wtf";
    const actRs = await processor.createOrder(cart, successUrl, cancelUrl);

    // Gia tốc bỏ qua 1 ngày
    jest.advanceTimersByTime(86400000);

    //Expect
    expect(actRs).toEqual(expRs);
    expect(validatorMock.validateCart).toBeCalledTimes(1);
    expect(serviceMock.createOrder).toBeCalledTimes(1);
    expect(daoMock.getOrderProduct).toBeCalledTimes(1);
    expect(exServiceMock.convert).toBeCalledTimes(1);
  });
});

describe("Proc Lưu đơn hàng đã thanh toán", () => {
  beforeEach(() => {
    validatorMock = new PaymentValidatorMock();
    serviceMock = new StripeServiceMock();
    daoMock = new PaymentDAOMock();
    strgServiceMock = new StorageServiceMock();
  });

  test("Id đơn hàng không hợp lệ - EX", async () => {
    //Arrange
    const id = undefined;
    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.checkoutOrder(id, {});
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateId).toBeCalledTimes(1);
  });

  test("Thiếu successUrl - EX", async () => {
    //Arrange
    const id = "id";
    const successUrl = "//";
    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.checkoutOrder(id, { successUrl });
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateId).toBeCalledTimes(1);
    expect(validatorMock.validateUrl).toBeCalledTimes(1);
  });

  test("Order không tồn tại - EX", async () => {
    //Arrange
    const id = "";
    const successUrl = " ";
    const processor = getProcessor();

    //Act
    const expRs = NotExistError;
    let actRs;
    try {
      await processor.checkoutOrder(id, { successUrl });
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateId).toBeCalledTimes(1);
    expect(validatorMock.validateUrl).toBeCalledTimes(1);
  });

  test("Thành công trả về successUrl/id", async () => {
    //Arrange
    const id = "1";
    const successUrl = " ";
    const processor = getProcessor();

    //Act
    const expRs = `${successUrl}/1`;
    const actRs = await processor.checkoutOrder(id, { successUrl });

    //Expect
    expect(actRs).toEqual(expRs);
    expect(validatorMock.validateId).toBeCalledTimes(1);
    expect(validatorMock.validateUrl).toBeCalledTimes(1);
    expect(daoMock.saveOrder).toBeCalledTimes(1);
  });
});
