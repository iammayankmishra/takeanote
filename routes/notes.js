const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

//Load Note Model
require('../models/Note');
const Note = mongoose.model('notes');

//Add note form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render("notes/add");
});

//Note Index page
router.get('/', ensureAuthenticated, (req, res) => {
    Note.find({user: req.user.id})
        .sort('desc')
        .then((notes) => {
            res.render("notes/index", {
                notes: notes
            });
        });
});

//Edit note form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Note.findOne({
        _id: req.params.id
    })
    .then((note) => {
        if (note.user.id != req.user.id) {
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/notes');
        } else {
            res.render("notes/edit", {
                note: note
            });
        }
        
    });
});

//Process form
router.post('/', ensureAuthenticated, (req,res) => {
    let errors = [];

    if(!req.body.title){
        errors.push({text: 'Please add a title'});
    }

    if(!req.body.details){
        errors.push({text: 'Please add some details'});
    }

    if(errors.length > 0){
        res.render('notes/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }
    else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };

        new Note(newUser)
            .save()
            .then((note) => {
                console.log("Done");
                res.redirect('/notes');
            })
            .catch((err) => { console.log(err) });
    }
});

//Edit form process
router.put('/:id', ensureAuthenticated, (req,res) => {
    Note.findOne({
        _id: req.params.id
    })
    .then((note) => {
        //new values
        note.title = req.body.title;
        note.details = req.body.details;

        note.save()
            .then((note) => {
                res.redirect('/notes');
            });
    })
});

//Delete Note
router.delete('/edit/:id', ensureAuthenticated, (req,res) => {
    Note.remove({
        _id: req.params.id
    })
    .then(() => {
        res.redirect('/notes');
    });
});

module.exports = router;