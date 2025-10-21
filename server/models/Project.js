import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectSlug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null 
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    rootFolderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "files"
    },
    azureContainerName: {
        type: String,
        required: true
    }
}, {
    timestamps: true 
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
