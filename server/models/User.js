import mongoose from "mongoose";
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const userSchema = new mongoose.Schema({
    users_id: {
        type: Number,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String
    },
    lastLoggedIn: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

userSchema.plugin(AutoIncrement, {inc_field: 'users_id'});

const User = mongoose.model("User", userSchema);
export default User;