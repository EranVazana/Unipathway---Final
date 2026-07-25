const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const validateAdmissionThreshold = require('../middleware/validate/validateThreshold');
const { getAllThresholds, getThresholdById, createThreshold, updateThreshold, deleteThreshold } = require('../controllers/admissionThresholdsController');

router.get('/',       getAllThresholds);
router.get('/:id',    validateId, getThresholdById);
router.post('/',      authorize('admin', 'editor'), validateAdmissionThreshold, createThreshold);
router.put('/:id',    authorize('admin', 'editor'), validateId, validateAdmissionThreshold, updateThreshold);
router.delete('/:id', authorize('admin'), validateId, deleteThreshold);

module.exports = router;
