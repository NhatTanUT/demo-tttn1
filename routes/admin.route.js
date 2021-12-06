const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { auth_role } = require("../middleware/decentralization");
const upload = require("../middleware/upload");
const upload_rar = require("../middleware/upload_rar");

const createError = require("http-errors");

const AdminController = require("../controller/admin.controller");
const { Admin } = require("mongodb");

router.get("/", auth, auth_role(["admin"]), (req, res) => {
  res.render("admin");
});

const uploadMultiple = upload.fields([
  { name: "img", maxCount: 1 },
  { name: "previewImage", maxCount: 6 },
]);

router.post(
  "/register",
  AdminController.register,
  AdminController.sendMailRegister
);

router
  .route("/product")
  .post(uploadMultiple, AdminController.addProduct)
  .patch(uploadMultiple, AdminController.updateProduct, AdminController.sendMailWishList)
  .delete(AdminController.removeProduct);

router
  .route("/category")
  .post(AdminController.addCategory)
  .patch(AdminController.updateCategory)
  .delete(AdminController.removeCategory);

router
  .route("/user")
  .get(AdminController.getAllUser)
  .post(AdminController.addUser)
  .patch(AdminController.updateUser)
  .delete(AdminController.deleteUser);

router
  .route("/order")
  .get(AdminController.getAllOrder)
  .delete(AdminController.removeOrder);

router
  .route("/discount")
  .get(AdminController.getDiscount)
  .post(AdminController.addDiscount)
  .patch(AdminController.updateDiscount)
  .delete(AdminController.removeDiscount);

router.post("/sendMailWishlist", AdminController.sendMailWishList);
router.post("/sendPromotion", AdminController.sendPromotion);
router.get("/clientOnline", AdminController.getAllClientOnline);
router.post("/notify", AdminController.sendNotification);
router.post("/notify_banner", AdminController.sendNotificationBanner);
// route.post('/removeNotify', AdminController.removeNotify)

router.post("/uploadrar", upload_rar.single("file"), AdminController.uploadRar);

router.get("/revenue", AdminController.statisticRevenue);

router.get("/test1", (req, res, next) => {
  return next(createError.InternalServerError());
});

const joi = require("joi");
const emailSchema = joi.object().keys({
  email: joi.string().email().required(),
});

router.post("/test2", (req, res, next) => {
  const validatorResult = emailSchema.validate(req.body);

  console.log(validatorResult);
});

// Google Analytics
router.get("/analytics", AdminController.analytics);
router.get("/analytics/v2", AdminController.analyticsv2);
router.get("/lastBanner", AdminController.lastBanner)


module.exports = router;
