const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const { Author, BlogPost } = require('./models');



router.get('/',(req,res) => {
    Author
        .find()
        .then(authors => {
            res.status(200).json(authors.map(author => { //Here we are MANUALLY serializing() instead of the way we did it with blogPosts.serialize(). Just another way of doing it.
                return{
                    id: author._id,
                    name: `${author.firstName} ${author.lastName}`,
                    userName: author.userName
                };
            }))
        })//end of then
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went wrong with the server, sorry.'})
        })
})//end of GET all

router.get('/:id', (req,res) => {
    Author.findById(req.params.id)
    .then(author => {
        const serializedAuthor = {id: author._id, name: `${author.firstName} ${author.lastName}`, userName: author.userName}
        res.status(200).json(serializedAuthor);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went wrong, sorry!'});
    })
});//end of GET /:id

router.post('/', (req,res) => { //A _v: key might show up after you create a document with mongoose. This is the version key but this can be removed by adding versionKey: false  to your schema. But for now, just leave it.
    const requiredFields = ['firstName', 'lastName', 'userName'];
    if(!requiredFields.every(field => Object.keys(req.body).includes(field))){
        res.status(400);
        throw new Error("whoops, looks like you're missing an author field.");
    }
    else {
        console.log("COOL MAN, YOUR ALL GOOD", req.body);
        const { firstName, lastName, userName } = req.body;
        Author.create({firstName, lastName, userName})
        .then(author => {
            res.status(201).json({id: author._id, name: `${author.firstName} ${author.lastName}`, userName: author.userName});
        }) 
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        })       
    }

})//end of POST

router.put('/:id', (req,res) => {
    if(req.params.id !== req.body.id) {
        return res.status(400).json({
            error: "please check the ID in either the url or the req body."
        }).end();
    }

    const updatedAuthor = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
    updateableFields.forEach(field => {
        if(field in req.body){ //if the "field" is found in the req.body object, then we add those fields to updatedAuthor and give them the values that the request body object provided has.
            return updatedAuthor[field] = req.body[field];
        }
    });
    console.log(updatedAuthor);

    //check if userName is taken                                    Syntax: {field: {$ne: value} }  <--this basically means "NotEqual" 
    Author.findOne({ userName: updatedAuthor.userName || "" , _id: { $ne: req.params.id }}) //passing a search query object that says find the updated.userName we are trying to use combined with an _id that is NOT our id. If an author document is found then that means the userName exits already.
    .then(auth=> {
        if(auth) { //if an author is found with our userName and NOT our id, then we throw error since it's already taken.
            const message = `Username "${updatedAuthor.userName}" already taken, sorry. Please choose another.`;
            console.error(message);
            return res.status(400).send(message).end();
        }
    });

    Author.findByIdAndUpdate(req.params.id, {$set: updatedAuthor}, {new: true})
    .then(updatedAuthor => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong on our end, sorry'}));
    
})//end of PUT/:id

router.delete('/:id', (req,res) => {
    BlogPost
        .remove({ author: req.params.id })
        .then(()=> {
            Author
                .findByIdAndRemove(req.params.id)
                .then(()=> {
                    console.log(`Deleted author with id of ${req.params.id} and all blogpost made by the author.`);
                    res.status(204).json({ message: 'success' }).end();
                })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
          });
})





module.exports = router;