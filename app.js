const express = require('express');
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

//Load Routes
const notes = require('./routes/notes');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

//Connect to Mongoose
var dbUrl = 'mongodb://user:user@ds129776.mlab.com:29776/nodejs-test';
mongoose.connect(dbUrl)
    .then(() => { console.log('Mongo DB connected through MLab') })
    .catch((err) => { console.log(err) });

//How middleware works
/*app.use(function(req,res,next) {
    //console.log(Date.now());
    req.name = 'Mayank Mishra';
    next();
});*/

//Handlebars Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Body-parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//methodOverride middleware
app.use(methodOverride('_method'));

//using public folder for static files
app.use(express.static(__dirname + '/public'));

// Express session midleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Index route
app.get('/', (req, res) => {
    const titleName = 'Welcome';
    res.render("index", {
        title: titleName
    });
});

//About route
app.get('/about', (req, res) => {
    res.render("about");
});

//Use Routes
app.use('/notes', notes);
app.use('/users', users);

const port = process.env.port || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});