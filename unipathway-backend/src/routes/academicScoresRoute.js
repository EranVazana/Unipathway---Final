const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const enforceSelfForUsers = require('../middleware/enforceSelfForUsers');
const { validateId } = require('../middleware/validate/common');
const { validateAcademicScores, validateAcademicScoresUpdate } = require('../middleware/validate/validateAcademicScores');
const AcademicScores = require('../../models/AcademicScores');
const {
  getAllAcademicScores,
  getAcademicScoresById,
  createAcademicScores,
  updateAcademicScores,
  deleteAcademicScores
} = require('../controllers/academicScoresController');

// Resolves the owning userId of an academic-scores entry by its :id (or null if not found)
const ownerById = async (req) => {
  const entry = await AcademicScores.findById(req.parsedId);
  return entry ? entry.userId : null;
};

router.get('/',       authorize('admin', 'user'), getAllAcademicScores);
router.get('/:id',    authorize('admin', 'user'), validateId, getAcademicScoresById);
router.post('/',      authorize('admin', 'user'), enforceSelfForUsers(req => req.body.userId), validateAcademicScores, createAcademicScores);
router.put('/:id',    authorize('admin', 'user'), validateId, enforceSelfForUsers(ownerById), validateAcademicScoresUpdate, updateAcademicScores);
router.delete('/:id', authorize('admin', 'user'), validateId, enforceSelfForUsers(ownerById), deleteAcademicScores);

module.exports = router;