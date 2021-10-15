const Discount = require('../models/discount.model')
async function checkDiscount(req, res, next) {
  try {
    const {discount} = req.body

    if (!discount || discount === '') return next()

    const foundDiscount = await Discount.findOne({ code: discount }).lean();
    
    if (!foundDiscount) return res.status(500).json({msg: "Cant found discount code"});
    
    const currentDate = new Date();
    if (!(currentDate >= new Date(foundDiscount.startDate)))
      return res.status(500).json({msg: "Too early to submit discount"});
    if (!(currentDate <= new Date(foundDiscount.expireDate)))
      return res.status(500).json({msg: "Expire discount"});

    
    res.locals.discount = foundDiscount
    next()
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: error.message});
  }
}

module.exports = checkDiscount;
