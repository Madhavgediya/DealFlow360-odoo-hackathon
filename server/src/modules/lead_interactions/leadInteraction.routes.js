const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :leadId from parent
const ctrl = require('./leadInteraction.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./leadInteraction.validation');

router.post('/', validateCreate, ctrl.createInteraction);
router.get('/', ctrl.getInteractions);
router.get('/:interactionId', validateUUID('interactionId'), ctrl.getInteractionById);
router.put('/:interactionId', validateUUID('interactionId'), validateUpdate, ctrl.updateInteraction);
router.delete('/:interactionId', validateUUID('interactionId'), ctrl.deleteInteraction);

module.exports = router;
