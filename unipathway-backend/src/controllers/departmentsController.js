const Department = require('../../models/Department');
const { broadcast } = require('../socket');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

async function getAllDepartments(req, res) {
  try {
    const departments = await Department.findAll({ major: req.query.major, universityId: req.query.universityId ? parseInt(req.query.universityId) : undefined });
    res.status(200).json(success(departments));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getDepartmentById(req, res) {
  try {
    const dept = await Department.findById(req.parsedId);
    if (!dept) return res.status(404).json(failure('NOT_FOUND', `Department with id ${req.parsedId} not found.`, { resource: 'department', id: req.parsedId }));
    res.status(200).json(success(dept));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function createDepartment(req, res) {
  try {
    const { universityId, majorName, degreeType, faculty, description } = req.body;
    const departmentId = await Department.create({ universityId, majorName, degreeType, faculty, description });
    res.status(201).json(success({ departmentId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateDepartment(req, res) {
  try {
    const dept = await Department.findById(req.parsedId);
    if (!dept) return res.status(404).json(failure('NOT_FOUND', `Department with id ${req.parsedId} not found.`, { resource: 'department', id: req.parsedId }));
    const { universityId, majorName, degreeType, faculty, description } = req.body;
    await dept.update({ universityId, majorName, degreeType, faculty, description });

    broadcast({
      id:        `dept-${dept.departmentId}-${Date.now()}`,
      type:      'department',
      action:    'updated',
      title:     'Department Updated',
      message:   `${dept.majorName} admission data has been updated.`,
      resourceId: dept.departmentId,
      timestamp:  new Date().toISOString(),
      read:       false,
    }, parseInt(req.headers['x-user-id']) || null);

    res.status(200).json(success({ departmentId: dept.departmentId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function deleteDepartment(req, res) {
  try {
    const dept = await Department.findById(req.parsedId);
    if (!dept) return res.status(404).json(failure('NOT_FOUND', `Department with id ${req.parsedId} not found.`, { resource: 'department', id: req.parsedId }));
    await dept.delete();
    res.status(200).json(success({ departmentId: req.parsedId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };