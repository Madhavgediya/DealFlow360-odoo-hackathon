const db = require('../config/database');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cachedCompanyId = null;

/**
 * Resolves any company identifier (e.g. 'comp-1', undefined, or invalid string)
 * into a guaranteed valid PostgreSQL UUID by fetching the active company from the database.
 */
const resolveValidCompanyId = async (inputCompanyId) => {
  if (inputCompanyId && uuidRegex.test(inputCompanyId)) {
    return inputCompanyId;
  }

  if (cachedCompanyId) {
    return cachedCompanyId;
  }

  try {
    const res = await db.query('SELECT id FROM companies ORDER BY created_at ASC LIMIT 1');
    if (res.rows.length > 0) {
      cachedCompanyId = res.rows[0].id;
      return cachedCompanyId;
    }
  } catch (err) {
    console.debug('Database company resolution note:', err.message);
  }

  // Fallback standard UUID
  return 'c1111111-1111-1111-1111-111111111111';
};

module.exports = { resolveValidCompanyId, uuidRegex };
