const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const validateDepartment = require('../middleware/validate/validateDepartment');
const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentsController');

router.get('/',       getAllDepartments);
router.get('/:id',    validateId, getDepartmentById);
router.post('/',      authorize('admin', 'editor'), validateDepartment, createDepartment);
router.put('/:id',    authorize('admin', 'editor'), validateId, validateDepartment, updateDepartment);
router.delete('/:id', authorize('admin'), validateId, deleteDepartment);

module.exports = router;
