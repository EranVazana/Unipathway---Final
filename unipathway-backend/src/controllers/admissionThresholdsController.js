const AdmissionThreshold = require('../../models/AdmissionThreshold');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

async function getAllThresholds(req, res) {
  try {
    const thresholds = await AdmissionThreshold.findAll({
      departmentId: req.query.departmentId ? parseInt(req.query.departmentId) : undefined,
      year:         req.query.year         ? parseInt(req.query.year)         : undefined
    });
    res.status(200).json(success(thresholds));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getThresholdById(req, res) {
  try {
    const threshold = await AdmissionThreshold.findById(req.parsedId);
    if (!threshold) return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${req.parsedId} not found.`, { resource: 'admissionThreshold', id: req.parsedId }));
    res.status(200).json(success(threshold));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function createThreshold(req, res) {
  try {
    const { departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem } = req.body;
    const thresholdId = await AdmissionThreshold.create({ departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem });
    res.status(201).json(success({ thresholdId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateThreshold(req, res) {
  try {
    const threshold = await AdmissionThreshold.findById(req.parsedId);
    if (!threshold) return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${req.parsedId} not found.`, { resource: 'admissionThreshold', id: req.parsedId }));
    const { departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem } = req.body;
    await threshold.update({ departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem });
    res.status(200).json(success({ thresholdId: threshold.thresholdId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function deleteThreshold(req, res) {
  try {
    const threshold = await AdmissionThreshold.findById(req.parsedId);
    if (!threshold) return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${req.parsedId} not found.`, { resource: 'admissionThreshold', id: req.parsedId }));
    await threshold.delete();
    res.status(200).json(success({ thresholdId: req.parsedId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getAllThresholds, getThresholdById, createThreshold, updateThreshold, deleteThreshold };
