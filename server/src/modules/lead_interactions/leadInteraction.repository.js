const db = require('../../config/database');

const FIELDS = `id, lead_id, user_id, interaction_type, direction, subject, notes, outcome, next_followup_at, created_at`;

const createInteraction = async (data) => {
  const { lead_id, user_id, interaction_type, direction, subject, notes, outcome, next_followup_at } = data;
  const query = `
    INSERT INTO lead_interactions (lead_id, user_id, interaction_type, direction, subject, notes, outcome, next_followup_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${FIELDS}
  `;
  const result = await db.query(query, [
    lead_id, user_id, interaction_type, direction || 'OUTBOUND',
    subject || null, notes || null, outcome || null, next_followup_at || null
  ]);
  return result.rows[0];
};

const getInteractionsByLead = async (lead_id) => {
  const result = await db.query(
    `SELECT ${FIELDS} FROM lead_interactions WHERE lead_id = $1 ORDER BY created_at DESC`,
    [lead_id]
  );
  return result.rows;
};

const getInteractionById = async (id, lead_id) => {
  const result = await db.query(
    `SELECT ${FIELDS} FROM lead_interactions WHERE id = $1 AND lead_id = $2`,
    [id, lead_id]
  );
  return result.rows[0];
};

const updateInteraction = async (id, lead_id, data) => {
  const allowedFields = ['interaction_type', 'direction', 'subject', 'notes', 'outcome', 'next_followup_at'];
  const fields = [];
  const values = [];
  let i = 1;

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(data[key]);
      i++;
    }
  }

  values.push(id, lead_id);
  const query = `UPDATE lead_interactions SET ${fields.join(', ')} WHERE id = $${i} AND lead_id = $${i + 1} RETURNING ${FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteInteraction = async (id, lead_id) => {
  const result = await db.query(
    `DELETE FROM lead_interactions WHERE id = $1 AND lead_id = $2 RETURNING id`,
    [id, lead_id]
  );
  return result.rows[0];
};

module.exports = { createInteraction, getInteractionsByLead, getInteractionById, updateInteraction, deleteInteraction };
