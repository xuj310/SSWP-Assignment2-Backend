const BaseRoutes = require("./BaseRoutes");
const productControllers = require("../controllers/productController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const eventValidations = {
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
          upload.single("image"),
          eventValidations.validateLogin,
          eventValidations.validateCreateProduct,
        ],
        handler: productControllers.createProduct,
      },
      {
        method: "put",
        path: "/products",
        middlewares: [
          eventValidations.requireId,
          eventValidations.validateLogin,
          eventValidations.validateUpdateProduct,
        ],
        handler: productControllers.updateProduct,
      },
      {
        method: "delete",
        path: "/products",
        middlewares: [
          eventValidations.requireId,
          eventValidations.validateLogin,
        ],
        handler: productControllers.deleteProduct,
      },
    ]);
  }
}

module.exports = new productRoutes().getRouter();
