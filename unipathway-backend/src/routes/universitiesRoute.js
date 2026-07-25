const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const validateUniversity = require('../middleware/validate/validateUniversity');
const { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity } = require('../controllers/universitiesController');

router.get('/',       getAllUniversities);
router.get('/:id',    validateId, getUniversityById);
router.post('/',      authorize('admin', 'editor'), validateUniversity, createUniversity);
router.put('/:id',    authorize('admin', 'editor'), validateId, validateUniversity, updateUniversity);
router.delete('/:id', authorize('admin'), validateId, deleteUniversity);

module.exports = router;
