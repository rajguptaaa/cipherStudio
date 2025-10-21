import express from "express";
import { register, login } from "../controllers/authController.js";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Project routes
router.post("/projects", createProject);
router.get("/projects/:userId", getUserProjects);
router.get("/projects/:id", getProjectById);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);


export default router;