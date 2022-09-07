const express = require('express');
const mongoose = require('mongoose');
const Forum = require('./models/forum');


//Connect to MongoDB
const URI = 'mongodb+srv://worrell:test1234@forums.mmkzh0f.mongodb.net/forums?retryWrites=true&w=majority';
mongoose.connect(URI)
.then((result) => { console.log('The Server has Connected to MongoDB') })
.catch((err) => console.log(err));

// Express App
const app = express();

// Listen For Requests
app.listen(8000, 'localhost', () =>{
    console.log('Server is Running')
});

//Register View Engine/ejs
app.set('view engine', 'ejs');

// Get Requests
app.get('/', (req, res)=>{
    Forum.find().sort({ createdAt: -1 }).then((result)=>{
    res.render('index.ejs', { title: 'All News Forums', forum: result});
    console.log(result);
    }).catch((err)=>{
        console.log(err)
    })
});

app.get('/addNewForum', (req, res)=> {
    res.render('addNewForum.ejs', { title: 'Add Forum', });
    console.log('The User is Trying To Add A New Forum');
});

app.get('/about', (req, res)=> {
    res.render('about.ejs', { title: 'About Page' });
    console.log('The User is on the About Page');
});

app.get('/edit', (req, res)=> {
    res.render('editPage.ejs', { title: 'Edit Page'});

    });


// Request For a Specific Document in The Database
app.get('/forum/:id', (req, res)=> {
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
app.post('/newsforumpost', (req,res)=>{
    const forum = new Forum(req.body)
    console.log(req.body)
    forum.save().then((result)=>{
        res.redirect('/')
    }).catch((err) => {
        //console.log(err)
    })
});

// Delete A Specific Forum
app.delete('/deleteforum/:id', (req, res)=>{
    const id = req.params.id
    console.log('The User has Deleted a Forum');
    Forum.findByIdAndDelete(id).then((result)=>{
        res.json({ redirect: '/' });
    }).catch((err)=>{
        console.log(err)
    });
});

