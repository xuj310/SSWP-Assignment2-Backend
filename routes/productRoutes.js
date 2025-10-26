const BaseRoutes = require("./BaseRoutes");
const productControllers = require("../controllers/productController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const middlewares = {
  checkUserAdmin: require("../middleware/checkUserAdmin"),
};

const productValidations = {
  requireId: require("../validations/requireId"),
  validateLogin: require("../validations/validateLogin"),
  validateCreateProduct: require("../validations/validateCreateProduct"),
  validateUpdateProduct: require("../validations/validateUpdateProduct"),
};

class productRoutes extends BaseRoutes {
  constructor() {
    super();
    this.setupRoutes([
      {
        method: "get",
        path: "/products",
        middlewares: [],
        handler: productControllers.getProducts,
      },
      {
        method: "post",
        path: "/products",
        middlewares: [
          productValidations.validateLogin,
          middlewares.checkUserAdmin,
          upload.single("image"),
          productValidations.validateCreateProduct,
        ],
        handler: productControllers.createProduct,
      },
      {
        method: "put",
        path: "/products",
        middlewares: [
          productValidations.requireId,
          productValidations.validateLogin,
          middlewares.checkUserAdmin,
          upload.single("image"),
          productValidations.validateUpdateProduct,
        ],
        handler: productControllers.updateProduct,
      },
      {
        method: "delete",
        path: "/products",
        middlewares: [
          productValidations.requireId,
          productValidations.validateLogin,
          middlewares.checkUserAdmin,
        ],
        handler: productControllers.deleteProduct,
      },
    ]);
  }
}

module.exports = new productRoutes().getRouter();
