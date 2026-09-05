const companyRepository = require('./company.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const bcrypt = require('bcryptjs');

const createCompany = async (data) => {
  if (data.code) {
    const existing = await companyRepository.getCompanyByCode(data.code);
    if (existing) throw createAppError('A company with this code already exists', 409, 'COMPANY_ALREADY_EXISTS');
  }

  // Ensure admin email is provided or fallback
  const adminEmail = data.admin_email || `admin@${data.code || 'company'}.local`.toLowerCase();
  const rawPassword = data.admin_password || 'Admin@123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  const adminData = {
    email: adminEmail,
    password_hash: passwordHash,
    firstName: data.admin_first_name || 'Admin',
    lastName: data.admin_last_name || 'User',
    name: data.admin_name || 'Company Admin'
  };

  const company = await companyRepository.createCompanyWithAdmin(data, adminData);
  // Do not return password hash
  return { ...company, admin_raw_password: data.admin_password ? undefined : rawPassword };
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
