const Discount = require('../models/discount.model')
async function checkDiscount(req, res, next) {
  try {
    const {discount} = req.body

    if (!discount || discount === '') return next()

    const foundDiscount = await Discount.findOne({ code: discount }).lean();

    const currentDate = new Date();
    if (!(currentDate >= new Date(foundDiscount.startDate)))
      return res.status(500).json({msg: "Too early to submit discount"});
    if (!(currentDate <= new Date(foundDiscount.expireDate)))
      return res.status(500).json({msg: "Expire discount"});

    if (!foundDiscount) return res.status(500).json({msg: "Cant found discount code"});
    
    res.locals.discount = foundDiscount
    next()
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = checkDiscount;
