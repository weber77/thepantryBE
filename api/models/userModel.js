const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    dateCreated: { type: Date, default: Date.now() },
    password: { type: String, required: true },
    name: { type: String },
    pantry: [
        
    ],
    favouriteRecipes: [
    ],
    madeRecipes: [
        { type: String }
    ]
});
 //separate pantry, favouriteRecipes, & madeRecipes into separate schema 

module.exports = mongoose.model("user", userSchema);