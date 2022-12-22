//Middleware that protect the routes
const jwt = require('jsonwebtoken');
const { model } = require('mongoose');
const User = require('../models/user');

const protectedRoute = (req, res, next) => {
    //When the protectedRoute function is invoked via the request handler the client checks for the cookie 'jwt'
    //if 'jwt' is present then the value is assigned to the const token
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'forumsecret', (err, decodeToken) => {
            if(err) {
                console.log(err.message);
                //If error in token the client is redirected to the '/login' endpoint
                res.redirect('/login');
            }else{
                console.log(decodeToken);
                next();
            }
        })
    }else{
        //if token is not present the client is redirected to the '/login' endpoint 
        res.redirect('/login');
    }
}

module.exports = { protectedRoute };