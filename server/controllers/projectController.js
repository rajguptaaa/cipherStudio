import Project from "../models/Project.js";
import File from "../models/File.js";
import azureService from "../services/azureService.js";

export const saveProject = async (req, res) => {
    try {
        const { name, description, files } = req.body;
        const userId = req.user;
        
        const containerName = `project-${userId}-${Date.now()}`;
        
        try {
            await azureService.createContainer(containerName);
        } catch (azureError) {
            throw new Error(`Azure error: ${azureError.message}`);
        }
        
        const project = new Project({
            projectSlug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            userId,
            name,
            description,
            azureContainerName: containerName
        });
        await project.save();
        
        if (files && files.length > 0) {
            for (const file of files) {
                const blobName = `${file.name}`;
                await azureService.uploadFile(containerName, blobName, file.content || '');
                
                const newFile = new File({
                    projectId: project._id,
                    name: file.name,
                    type: 'file',
                    azureBlobName: blobName,
                    language: file.language || 'javascript',
                    sizeInBytes: Buffer.byteLength(file.content || '', 'utf8')
                });
                await newFile.save();
            }
        }
        
        res.status(201).json({ project, message: 'Project saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user }).populate('rootFolderId');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectFiles = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        
        if (!project || project.userId.toString() !== req.user) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const files = await File.find({ projectId });
        const filesWithContent = [];
        
        for (const file of files) {
            if (file.type === 'file' && file.azureBlobName) {
                try {
                    const content = await azureService.downloadFile(project.azureContainerName, file.azureBlobName);
                    filesWithContent.push({ ...file.toObject(), content: content || '' });
                } catch (downloadError) {
                    console.error(`Error downloading file ${file.name}:`, downloadError);
                    filesWithContent.push({ ...file.toObject(), content: '' });
                }
            } else {
                filesWithContent.push(file.toObject());
            }
        }
        
        res.json({ project, files: filesWithContent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json({ message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
