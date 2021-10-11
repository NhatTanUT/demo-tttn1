const Discount = require('../models/discount.model')
async function checkDiscount(code) {
  try {
    //   const {code} = req.body

    const foundDiscount = await Discount.findOne({ code: code }).lean();

    const currentDate = new Date();
    if (!(currentDate >= new Date(foundDiscount.startDate)))
      throw new Error("Too early to submit discount");
    if (!(currentDate <= new Date(foundDiscount.expireDate)))
      throw new Error("Expire discount");

    if (!foundDiscount) throw new Error("Cant found discount code");
    
    return foundDiscount
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = checkDiscount;
