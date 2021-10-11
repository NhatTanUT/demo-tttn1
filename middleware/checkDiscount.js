const Discount = require('../models/discount.model')
async function checkDiscount(req, res, next) {
  try {
    const {discount} = req.body

    if (!discount || discount === '') return next()

    const foundDiscount = await Discount.findOne({ code: discount }).lean();

    const currentDate = new Date();
    if (!(currentDate >= new Date(foundDiscount.startDate)))
      throw new Error("Too early to submit discount");
    if (!(currentDate <= new Date(foundDiscount.expireDate)))
      throw new Error("Expire discount");

    if (!foundDiscount) throw new Error("Cant found discount code");
    
    res.locals.discount = foundDiscount
    next()
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = checkDiscount;
