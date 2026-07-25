const University = require('../../models/University');
const { broadcast } = require('../socket');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

async function getAllUniversities(req, res) {
  try {
    const universities = await University.findAll({ location: req.query.location });
    res.status(200).json(success(universities));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getUniversityById(req, res) {
  try {
    const university = await University.findById(req.parsedId);
    if (!university) return res.status(404).json(failure('NOT_FOUND', `University with id ${req.parsedId} not found.`, { resource: 'university', id: req.parsedId }));
    res.status(200).json(success(university));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function createUniversity(req, res) {
  try {
    const { name, type, location, logoUrl, websiteUrl, description } = req.body;
    const universityId = await University.create({ name, type, location, logoUrl, websiteUrl, description });
    res.status(201).json(success({ universityId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateUniversity(req, res) {
  try {
    const university = await University.findById(req.parsedId);
    if (!university) return res.status(404).json(failure('NOT_FOUND', `University with id ${req.parsedId} not found.`, { resource: 'university', id: req.parsedId }));
    const { name, type, location, logoUrl, websiteUrl, description } = req.body;
    await university.update({ name, type, location, logoUrl, websiteUrl, description });

    broadcast({
      id:        `uni-${university.universityId}-${Date.now()}`,
      type:      'university',
      action:    'updated',
      title:     'University Updated',
      message:   `${university.name} information has been updated.`,
      resourceId: university.universityId,
      timestamp:  new Date().toISOString(),
      read:       false,
    }, parseInt(req.headers['x-user-id']) || null);

    res.status(200).json(success({ universityId: university.universityId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function deleteUniversity(req, res) {
  try {
    const university = await University.findById(req.parsedId);
    if (!university) return res.status(404).json(failure('NOT_FOUND', `University with id ${req.parsedId} not found.`, { resource: 'university', id: req.parsedId }));
    await university.delete();
    res.status(200).json(success({ universityId: req.parsedId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity };