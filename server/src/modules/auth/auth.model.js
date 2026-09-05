// Simple constants representing the schema, we rely on the DB definition primarily.
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  RETAILER: 'RETAILER',
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE: 'FINANCE',
  OPERATIONS: 'OPERATIONS',
  CUSTOMER: 'CUSTOMER'
};

const STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

module.exports = {
  ROLES,
  STATUSES,
  TABLE_NAME: 'users'
};

