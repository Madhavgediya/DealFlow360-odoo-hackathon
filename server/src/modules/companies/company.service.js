const companyRepository = require('./company.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createCompany = async (data) => {
  if (data.code) {
    const existing = await companyRepository.getCompanyByCode(data.code);
    if (existing) throw createAppError('A company with this code already exists', 409, 'COMPANY_ALREADY_EXISTS');
  }
  return companyRepository.createCompany(data);
};

const getCompanies = async () => {
  return companyRepository.getCompanies();
};

const getCompanyById = async (id) => {
  const company = await companyRepository.getCompanyById(id);
  if (!company) throw createAppError('Company not found', 404, 'COMPANY_NOT_FOUND');
  return company;
};

const updateCompany = async (id, data) => {
  const company = await companyRepository.getCompanyById(id);
  if (!company) throw createAppError('Company not found', 404, 'COMPANY_NOT_FOUND');

  if (data.code && data.code !== company.code) {
    const existing = await companyRepository.getCompanyByCode(data.code);
    if (existing && existing.id !== id) throw createAppError('A company with this code already exists', 409, 'COMPANY_ALREADY_EXISTS');
  }

  return companyRepository.updateCompany(id, data);
};

const updateCompanyStatus = async (id, status) => {
  const company = await companyRepository.getCompanyById(id);
  if (!company) throw createAppError('Company not found', 404, 'COMPANY_NOT_FOUND');
  return companyRepository.updateCompanyStatus(id, status);
};

module.exports = { createCompany, getCompanies, getCompanyById, updateCompany, updateCompanyStatus };
