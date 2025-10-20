const BaseRoutes = require("./BaseRoutes");
const userControllers = require("../controllers/userController");
const middlewares = {
  generateUserToken: require("../middleware/generateUserToken"),
  checkUserToken: require("../middleware/checkUserToken"),
};
const userValidations = {
  requireId: require("../validations/requireId"),
  validateLogin: require("../validations/validateLogin"),
  validateCreateUser: require("../validations/validateCreateUser"),
  validateUpdateUser: require("../validations/validateUpdateUser"),
  validateCredentials: require("../validations/validateCredentials"),
};

class userRoutes extends BaseRoutes {
  constructor() {
    super();
    this.setupRoutes([
      {
        method: "get",
        path: "/users",
        middlewares: [],
        handler: userControllers.getUsers,
      },
      {
        method: "post",
        path: "/users",
        middlewares: [
          userValidations.validateCreateUser,
          middlewares.generateUserToken,
        ],
        handler: userControllers.createUser,
      },
      {
        method: "post",
        path: "/users/login",
        middlewares: [
          userValidations.validateCredentials,
        ],
        handler: userControllers.loginUser,
      },
      {
        method: "put",
        path: "/users",
        middlewares: [
          userValidations.requireId,
          userValidations.validateLogin,
          userValidations.validateUpdateUser,
        ],
        handler: userControllers.updateUser,
      },
      {
        method: "delete",
        path: "/users",
        middlewares: [
          userValidations.requireId,
          middlewares.checkUserToken,
          userValidations.validateLogin,
        ],
        handler: userControllers.deleteUser,
      },
    ]);
  }
}

module.exports = new userRoutes().getRouter();
