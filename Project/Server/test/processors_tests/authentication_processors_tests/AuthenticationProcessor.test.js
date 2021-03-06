const {
  AuthenticationProcessor,
} = require("../../../app/processors/processorsContainer");
const {
  NotValidError,
  LoginNotSuccessError,
  JwtTokenError,
  NotExistError,
} = require("../../../app/errors/errorsContainer");

// Test xác thực người dùng

class AuthenticationProcessorFake extends AuthenticationProcessor {
  getHasPassword = (loginModel) => loginModel.password;
}

//#region Init

class ModDaoMock {
  static user = { mod_username: "valid", mod_password: "valid" };

  getModeratorByUsername = jest.fn(async (username) => {
    if (username !== ModDaoMock.user.mod_username) {
      throw new NotExistError();
    }

    return ModDaoMock.user;
  });
}

class AuthenticationValidatorMock {
  validateLoginModel = jest.fn((loginModel) => {
    return {
      hasAnyError: loginModel === undefined,
    };
  });

  validateToken = jest.fn((token) => {
    const tokenRegex = /^Bearer\s/i;
    return {
      hasAnyError: !tokenRegex.test(token),
    };
  });
}

class JwtMock {
  getToken = jest.fn((user) => {
    return user.username + " token đây";
  });

  getData = jest.fn((token) => {
    if (token === "Hết-hạn") throw new JwtTokenError();
    return { user: "Data đây " + token };
  });
}

class PwdMock {
  getHashPassword = jest.fn((p) => p.password);
}
//#endregion

let daoMock;
let validatorMock;
let jwtMock;
let pwdMock;

function getProcessor() {
  return new AuthenticationProcessorFake(
    validatorMock,
    jwtMock,
    daoMock,
    pwdMock
  );
}

function getProcessorNoParam() {
  return new AuthenticationProcessor();
}

describe("Proc Kiểm tra đăng nhập bằng jwt", () => {
  beforeEach(() => {
    daoMock = new ModDaoMock();
    validatorMock = new AuthenticationValidatorMock();
    jwtMock = new JwtMock();
    pwdMock = new PwdMock();
  });

  test("Không hợp lệ - EX", async () => {
    //Arrange
    const loginModel = undefined;
    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.login(loginModel);
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();

    expect(validatorMock.validateLoginModel).toBeCalledTimes(1);
    expect(validatorMock.validateLoginModel).toBeCalledWith(loginModel);
  });

  test("Không tồn tại người dùng - EX", async () => {
    //Arrange
    const loginModel = {};
    const processor = getProcessor();

    //Act
    const expRs = NotExistError;
    let actRs;
    try {
      await processor.login(loginModel);
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateLoginModel).toBeCalledTimes(1);
    expect(validatorMock.validateLoginModel).toBeCalledWith(loginModel);
  });

  test("Sai mật khẩu - EX", async () => {
    //Arrange
    const loginModel = { username: "valid", password: "notvalid" };
    const processor = getProcessor();

    //Act
    const expRs = LoginNotSuccessError;
    let actRs;
    try {
      await processor.login(loginModel);
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateLoginModel).toBeCalledTimes(1);
    expect(validatorMock.validateLoginModel).toBeCalledWith(loginModel);
  });

  test("Trả về token", async () => {
    //Arrange
    const { user } = ModDaoMock;
    const loginModel = {
      username: user.mod_username,
      password: user.mod_password,
    };
    const secretKey = "Key nè";

    const token = jwtMock.getToken(user);
    // Cái này mock nên gọi 1 lần thành 2 lần
    jwtMock.getToken.mockClear();

    const processor = getProcessor();
    processor.secretKey = secretKey;

    //Act
    const expRs = token;
    const actRs = await processor.login(loginModel);

    //Expect
    expect(actRs).toEqual(expRs);

    expect(validatorMock.validateLoginModel).toBeCalledTimes(1);
    expect(validatorMock.validateLoginModel).toBeCalledWith(loginModel);

    expect(jwtMock.getToken).toBeCalledTimes(1);
  });
});

describe("Proc Kiểm tra bearer jwt có hợp lệ", () => {
  beforeEach(() => {
    validatorMock = new AuthenticationValidatorMock();
    jwtMock = new JwtMock();
  });

  test("Token không hợp lệ - EX", async () => {
    //Arrange
    const token = "Bearer";
    const processor = getProcessor();

    //Act
    const expRs = NotValidError;
    let actRs;
    try {
      await processor.authenticate(token);
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateToken).toBeCalledTimes(1);
  });

  test("Token hết hạng - EX", async () => {
    //Arrange
    const token = "Bearer Hết-hạn";
    const processor = getProcessor();

    //Act
    const expRs = Error;
    let actRs;
    try {
      await processor.authenticate(token);
    } catch (error) {
      actRs = error;
    }

    //Expect
    expect(actRs instanceof expRs).toBeTruthy();
    expect(validatorMock.validateToken).toBeCalledTimes(1);
    expect(jwtMock.getData).toBeCalledTimes(1);
  });

  test("Lấy ra người dùng", async () => {
    //Arrange
    const token = "Bearer token";
    const processor = getProcessor();

    //Act
    const expRs = "Data đây token";
    const actRs = await processor.authenticate(token);

    //Expect
    expect(actRs).toEqual(expRs);
    expect(validatorMock.validateToken).toBeCalledTimes(1);
    expect(jwtMock.getData).toBeCalledTimes(1);
  });
});

describe("Proc Các hàm bổ sung", () => {
  test("Lấy ra role - emp", () => {
    //Arrange
    const roleIndex = 0;
    const processor = getProcessorNoParam();

    //Act
    const expRs = "emp";
    const actRs = processor.getRole(roleIndex);

    //Expect
    expect(actRs).toEqual(expRs);
  });

  test("Lấy ra role - admin", () => {
    //Arrange
    const roleIndex = 1;
    const processor = getProcessorNoParam();

    //Act
    const expRs = "admin";
    const actRs = processor.getRole(roleIndex);

    //Expect
    expect(actRs).toEqual(expRs);
  });
});
