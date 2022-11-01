const mongoose = require("mongoose");

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://localhost:27017/greenlight');  
}

const userSchema = new mongoose.Schema ({
    username: String, 
    password: String,
    points: Number,
    rec: Number, 
    off: Boolean
})

const User = mongoose.model("user", userSchema);

module.exports = User;
