const contactService = require('./contact.service');

const createContact = async (req, res, next) => {
  try {
    const contact = await contactService.createContact(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: contact });
  } catch (err) { next(err); }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getContacts(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: contacts });
  } catch (err) { next(err); }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactService.getContactById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: contact });
  } catch (err) { next(err); }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: contact });
  } catch (err) { next(err); }
};

const deleteContact = async (req, res, next) => {
  try {
    await contactService.deleteContact(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact
};
