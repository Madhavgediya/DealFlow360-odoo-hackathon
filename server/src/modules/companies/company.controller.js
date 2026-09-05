const companyService = require('./company.service');

const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) { next(err); }
};

const getCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getCompanies();
    res.status(200).json({ success: true, data: companies });
  } catch (err) { next(err); }
};

const getCompanyById = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    res.status(200).json({ success: true, data: company });
  } catch (err) { next(err); }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    res.status(200).json({ success: true, data: company });
  } catch (err) { next(err); }
};

const updateCompanyStatus = async (req, res, next) => {
  try {
    const company = await companyService.updateCompanyStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: company });
  } catch (err) { next(err); }
};

module.exports = { createCompany, getCompanies, getCompanyById, updateCompany, updateCompanyStatus };
