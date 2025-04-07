// /controllers/ordersController.js
const Order = require('../models/order.model');

/**
 * Retrieves all booked dates (Sundays, Tuesdays, Thursdays) for a given product.
 * Only orders with a status of 'Accepted' are considered booked.
 * 
 * @param {String} productId - The ID of the product.
 * @returns {Promise<Date[]>} - An array of Date objects that are booked.
 */
async function getBookedDatesForProduct(productId) {
  // Fetch accepted orders for the product
  const orders = await Order.find({ product: productId, status: 'Accepted' });
  const bookedDates = [];

  orders.forEach(order => {
    let currentDate = new Date(order.rentalPeriod.startDate);
    // Loop through the rental period in 48-hour increments (i.e. 2 days)
    while (currentDate <= order.rentalPeriod.endDate) {
      // Only add dates that fall on allowed days: Sunday (0), Tuesday (2), Thursday (4)
      if ([0, 2, 4].includes(currentDate.getDay())) {
        // Push a copy of the currentDate
        bookedDates.push(new Date(currentDate));
      }
      // Increment by 2 days (48 hours)
      currentDate.setDate(currentDate.getDate() + 2);
    }
  });

  return bookedDates;
}

module.exports = { getBookedDatesForProduct };
