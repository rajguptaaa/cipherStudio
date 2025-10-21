import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        default: null
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["folder", "file"],
        required: true
    },
    azureBlobName: {
        type: String,
        validate: {
            validator: function(v) {
                if (this.type === "file") {
                    return v != null;
                }
                return true;
            },
            message: "azureBlobName is required for files"
        }
    },
    language: {
        type: String,
    },
    sizeInBytes: {
        type: Number,
        validate: {
            validator: function(v) {
                if (this.type === "file") {
                    return v != null;
                }
                return true;
            },
            message: "sizeInBytes is required for files"
        }
    }
}, {
    timestamps: true 
});


fileSchema.index({ projectId: 1, parentId: 1 });
fileSchema.index({ azureBlobName: 1 });

const File = mongoose.model("File", fileSchema);
export default File;
