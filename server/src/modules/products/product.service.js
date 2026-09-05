const productRepository = require('./product.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createProduct = async (data, companyId) => {
  return productRepository.createProduct({ ...data, company_id: companyId });
};

const getProducts = async (companyId, filters) => {
  return productRepository.getProducts(companyId, filters);
};

const getProductById = async (id, companyId) => {
  const product = await productRepository.getProductByIdAndCompany(id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return product;
};

const updateProduct = async (id, companyId, data) => {
  const product = await productRepository.getProductByIdAndCompany(id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  
  return productRepository.updateProduct(id, companyId, data);
};

const deleteProduct = async (id, companyId) => {
  const product = await productRepository.getProductByIdAndCompany(id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  
  await productRepository.deleteProduct(id, companyId);
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
