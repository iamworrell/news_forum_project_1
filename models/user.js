const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

//Defines The Structure of The Document Stored in Collection
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [(val) => { isEmail }, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters'],   
    },
});

//Function executed after save function
//doc refers to the document/User model that is saved
userSchema.post('save', function (doc, next) {
    console.log('User created & saved', doc);
    next();
})


userSchema.pre('save', async function(next) {
    //generates salt(random string of characters) and assigns it to the variable salt
    const salt = await bcrypt.genSalt();

    //this.password is the password property of the user model that is about to be saved to the database
    //hashes both the password & salt, then stores them in the variable this.password
    //hashed version of this.password is stored in database
    this.password = await bcrypt.hash(this.password, salt);
    console.log('user about to be created & saved', this)
    next();
})

const User = mongoose.model('user', userSchema);

//Exports the variable User
module.exports = User;