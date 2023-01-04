const express = require('express');
const mongoose = require('mongoose');
const Forum = require('./models/forum');
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { protectedRoute } = require('./middleware/routeProtectMiddleware');


//Connect to MongoDB
const URI = 'mongodb+srv://worrell:test1234@forums.mmkzh0f.mongodb.net/forums?retryWrites=true&w=majority';
mongoose.connect(URI)
.then((result) => { console.log('The Server has Connected to MongoDB') })
.catch((err) => console.log(err));

// Express App
const app = express();

//Middleware for req.body
app.use(express.json());

//Middleware for cookie & cookie methods
app.use(cookieParser());

//Register View Engine/ejs
app.set('view engine', 'ejs');

// Listen For Requests
app.listen(8000, 'localhost', () =>{
    console.log('Server is Running')
});

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };
    //Errors for Sign Up
    if(err.code === 11000){
        errors.email = 'That email already exists'
    }

    if (err.message.includes('Minimum password length is 6 characters')) {
        errors.password = 'that password is too short';
    }

    if (err.message.includes('Please enter a valid email')) {
        errors.email = 'that email is not valid';
    }

    //Errors for login
    if (err.message.includes('Incorrect Password')) {
        errors.password = 'Incorrect Password';
    }
    return errors;
}

//handle errors
const handleLoginErrors = () => {
    let errors = { email: '', password: '' };
    return errors;
}

//Variable used to set expiration time of jwt cookie
//const jwtTime = 1 * 24 * 60 * 60;

//Function to create JWT
const createToken = (id) => {
    //Stores jwt in the function createToken
    return jwt.sign({ id }, 'forumsecret');
}

// Get Requests
app.get('/', protectedRoute, (req, res)=>{
    Forum.find().sort({ createdAt: -1 }).then((result)=>{
    res.render('index.ejs', { title: 'All News Forums', forum: result});
    console.log(result);
    }).catch((err)=>{
        console.log(err)
    })
});

app.get('/addNewForum', protectedRoute, (req, res)=> {
    res.render('addNewForum.ejs', { title: 'Add Forum', });
    console.log('The User is Trying To Add A New Forum');
});

app.get('/about', protectedRoute, (req, res)=> {
    res.render('about.ejs', { title: 'About Page' });
    console.log('The User is on the About Page');
});

app.get('/edit', protectedRoute, (req, res)=> {
    res.render('editPage.ejs', { title: 'Edit Page'});

    });


// Request For a Specific Document in The Database
app.get('/forum/:id', protectedRoute, (req, res)=> {
    const id = req.params.id;
    Forum.findById(id).then((result)=>{
        res.render('forumDetails.ejs', { title: 'Details Page', details: result });
        console.log('The User is on the Details Page');
    }).catch((err)=>{
        console.log(err);
    });
});

/* Express's built-in Middleware That Takes Data from the Request Object of the URL and Parses it into the Request Body.
   Used instead of the 'body-parser' package.
   Typically Used to Get Access to Data from an Online Form.
*/
app.use(express.urlencoded({ extended: true }));

//Post Request
app.post('/newsforumpost', protectedRoute, (req,res)=>{
    const forum = new Forum(req.body)
    console.log(req.body)
    forum.save().then((result)=>{
        res.redirect('/')
    }).catch((err) => {
        //console.log(err)
    })
});

// Delete A Specific Forum
app.delete('/deleteforum/:id', protectedRoute, (req, res)=>{
    const id = req.params.id
    console.log('The User has Deleted a Forum');
    Forum.findByIdAndDelete(id).then((result)=>{
        res.json({ redirect: '/' });
    }).catch((err)=>{
        console.log(err)
    });
});

//ROUTES & CONTROLLERS
//Directs User to the Sign Up Page
app.get('/signup', (req, res)=>{
    res.render('signup_form.ejs');
    console.log('User is on The Signup Page');
})

//Directs User to the Login Page
app.get('/login', (req, res)=>{
    res.render('login_form.ejs');
    console.log('User is on The Login Page');
})

//Post Requests
//Function to Signup
app.post('/signup', async(req, res)=>{
    //Receives Data from the form
    const { email, password } = req.body;

    try{
        //Creates Document and Adds it to Collection
        const user = await User.create({
            email,
            password
        });
        //Creation of JWT
        //jwt assigned to the const token
        const token = createToken(user._id);

        //Creates cookie on Server, Stores the jwt in the cookie and Stores the cookie on the Server in the response object
        res.cookie('jwt', token, { httpOnly: true});

        //Sends the response object to the browser, however other functions can do this as well
        res.status(200).json({user: user._id});
    }catch(err){
        console.log('The err.code is', err.message);
        const errors = handleErrors(err);
        console.log(errors.email);
        //Sends response Object to the client
        //Sends the errors Object created in handleErrors to the client
        //The response Object is accesible via the fetch api of javascript
        res.status(400).json({errors});
    }
    
})

//Function to Login
app.post('/login', async(req, res) => {
    //Receives Data from the form
    const { email, password } = req.body;

    //Custome 'Login' Function
    async function login(email, password){
        //Checks Collection to see if the Strings Match
        //If email parameter of function matches any of the emails in the Databse then the User is stored in the const user
        const user = await User.findOne({ email: email });

        //Checks if User has Data
        if(user) {
            console.log('User Found!');
            //If password entered matches the hashed version of the password stored in the collection auth gets a value of true 
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                console.log('Password Matches');
                //Creation of JWT
                //jwt assigned to the const token
                const token = createToken(user._id);
                //Creates cookie on Server, Stores the jwt in the cookie and Stores the cookie on the Server in the response object
                res.cookie('jwt', token, { httpOnly: true});
                res.status(200).json({ user: user._id });
                //Sends the response object to the browser, however other functions can do this as well
                //res.send();
            }else{
                const errors = handleLoginErrors();
                errors.password = 'Incorrect Password';
                //Sends response Object to the client
                //Sends the errors Object created in handleLoginErrors to the client
                //The response Object is accesible via the fetch api of javascript
                res.status(400).json({errors});
            }
        }else{
            const errors = handleLoginErrors();
            errors.email = 'Email Not Registered';
            //Sends response Object to the client
            //Sends the errors Object created in handleLoginErrors to the client
            //The response Object is accesible via the fetch api of javascript
            res.status(400).json({errors});
        }
    }
    
    //Function is Invoked, email is from the req.body
    login(email, password);
})

app.get('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
})

//PROTECTED ROUTES
app.get('/protected', protectedRoute, (req, res) => {
    res.render('protected_route.ejs');
})