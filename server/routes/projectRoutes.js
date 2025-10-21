import express from 'express';
import { saveProject, createProject, getUserProjects, getProjectById, getProjectFiles, updateProject, deleteProject } from '../controllers/projectController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/save', authMiddleware, saveProject);
router.post('/', authMiddleware, createProject);
router.get('/user', authMiddleware, getUserProjects);
router.get('/:projectId/files', authMiddleware, getProjectFiles);
router.get('/:id', authMiddleware, getProjectById);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;