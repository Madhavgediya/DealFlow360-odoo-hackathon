const orderService = require('./order.service');

const convertQuotationToOrder = async (req, res, next) => {
  try {
    const order = await orderService.convertQuotationToOrder(req.body.quotation_id, req.user.company_id);
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: orders });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.user.company_id, req.body.status);
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

module.exports = {
  convertQuotationToOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
