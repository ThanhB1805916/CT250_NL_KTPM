module.exports = class AuthenticationDAO_Ram {
  login = async (loginModel) => {
    return loginModel.username === "valid" && loginModel.password === "valid";
  };

  getUserToken = async (username) => {
    const user = { username, role: "emp" };

    if (username == "admin") {
      user.role = "admin";
    }

    return user;
  };
};
