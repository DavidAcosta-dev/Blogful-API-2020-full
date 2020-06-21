//You will have to modify this to adapt to the mongoose syntax

const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");    // importing mongoose

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json(); //we aren't even using this. it's being used as middleware in the server.js

mongoose.Promise = global.Promise; //you can readjust mongoose to use an alternative "Promise Library" like blubird or native ES6 promise. This will determine how we construct promises.


const {BlogPost} = require('./models');



// router.get('/', (req,res) => {
//     res.json(BlogPost.get());
// });

//REplaced this code below with the get/ that also dealt with query params for searching by some value****************************************
//Get request to /blog-posts will return 10 posts by default
// router.get('/',(req,res) => {
//     BlogPost.find().limit(10)
//     .then(posts => {
//         return res.status(200).json(
//             posts.map(pst => pst.serialize())
//         );
//     })//end of .then()
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ message: "Internal server error BRAHHH!!!, sorry"});
//     })//end of catch

// })//end of GET handler

router.get('/:id',(req,res) => {
    BlogPost.findById(req.params.id)
    .then(pst => res.status(200).json(pst.serialize()))//end of .then()
    .catch(err => {
        console.error(err);
        res.status(500).json({message: `Internal Server Error, whoops, sorry!`})
    });//end of catch
});//end of GET :id

/** Consider using the queryString.parse(req.query) npm package to refactor some of this code. */
router.get('/',(req,res)=> {
    const filters = {};
    const queryableFields = ['title', 'author', 'content'];
    queryableFields.forEach(field => {
        if(req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    BlogPost.find(filters)
    .then(posts => {
        return res.json(
            posts.map(pst => pst.serialize())
        )
    })//end of .then()
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });//end of catch()
})//end of GET by value 

router.post('/', (req,res) => {
    const requiredFields = ['title', 'content', 'author'];
    console.log(Object.keys(req.body).sort());
    console.log(requiredFields.sort());
    
    for(let i=0; i<requiredFields.length; i++){
        if(!req.body[requiredFields[i]]){
            res.send('missing value').end();
        }
    }
    const {title, author, content} = req.body;
    BlogPost.create({title, author, content})
    .then(pst => res.status(201).json(pst.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    })
})
/* ******Blog post must look like this*******:  
{
    "title": "asdfasdfasdf",
    "author": {"firstName":"blue", "lastName": "fish"},
    "content": "asdfasdfasdf"
}
*/

router.delete('/:id', (req,res) => {
    BlogPost.findByIdAndRemove(req.params.id)
    .then(()=> {
        console.log(`Sucessfully deleted blog post with id of ${req.params.id}`);
        res.status(204).json({ message:"deletion success"});//giving a status 204 will prevent the return of anything after successfull operation. Just what it does.
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went terribly wrong' });
      });
})//end of delete /:id


router.put('/:id', (req,res) => {
    if(!(req.params.id && req.body.id) && !(req.params.id === req.body.id)){
        res.status(400).send("Error, either some id values are missing or the do not match each other. (look at request body id and url id)").end()
    }

    const updatedBlog = {};
    Object.keys(req.body).forEach(field => updatedBlog[field] = req.body[field]);
    console.log(updatedBlog);

    BlogPost.findByIdAndUpdate(req.params.id, { $set: updatedBlog }, {new: true})
    .then(updatedBlog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Somthing went wrong'}));

});//end of put /:id







// router.post('/', jsonParser, (req,res) => {
//     if(!req.body.title && !req.body.content && !req.body.author){
//         return res.status(400).send("Must include, title, content, and author");
//     }
//     const {title, content, author} = req.body;
//     const blogPost = BlogPost.create(title, content, author);
//     res.status(201).json(blogPost);
// })

// router.put('/:id', jsonParser, (req,res) => {
//     if(req.params.id !== req.body.id){
//         res.status(400).send("ERROR: either your id doesn't exist or id doesn't match with the one in the url");
//     }
//     BlogPost.update(req.body);
//     res.status(200).send(req.body);
// })

// router.delete('/:id', (req,res) => {
//     if(!BlogPost.posts.find(post=> post.id === req.params.id ) ){
//         return res.status(400).send("ERROR: id provided in url does not match id of any post in BlogPosts.posts");
//     }
//     console.log("deleting: ", BlogPost.posts.find(post=> post.id === req.params.id));
//     BlogPost.delete(req.params.id);
//     res.status(204).end();
// })

module.exports = router;

