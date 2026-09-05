const productService = require('./product.service');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: products });
  } catch (err) { next(err); }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: product });
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: product });
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
