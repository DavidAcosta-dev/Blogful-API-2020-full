"use strict";

/*We are replacing the "BlogPosts" object that had values that were methods for creating a new blog, reading, deleting, and updating
  blogs. We don't need to do that anymore. Mongoose has syntax that we can use to setup the rules for what a blog should look like (schema)
  and it also has the ability to delete, create, update, and read with it's native methods.
  This also means we don't need to use the "uuid" npm package that creates unique ids because once an item is created and stored in mongoDb, it's
  automatically given an id.
  
  Create a new blogpostsSchema and export the Blogposts model to be used in the blogfulRouter*/

  const mongoose = require("mongoose");

  

  //Author mongoose schema. We will assign this to our Blogpost.author key. BUT we will also have to export this schema model out because we are dedicating an "Author" collection to store our authors/users
  const authorSchema = mongoose.Schema({
      firstName: 'string',
      lastName: 'string',
      userName: {           //<------ making userName into an object as opposed to just adding 'string' because we want to add an additional property. 
          type: 'string',   
          unique: true     //        In this case, we want to add 'unique' because we don't want people to be able to have same userNames.
      }
  })

  //Comments mongooose schema. We will assign this to our Blogpost.comments key.
  const commentSchema = mongoose.Schema({ content: 'string'});

  //This is the schema to represent a Blog post object
   const blogPostSchema = mongoose.Schema({
       author: [{                //EDIT: we TRIED adding array brackets to make it possible to have MULTIPLE authors to one blogPost! But that just made the author key say "undefined undefined"
           type: mongoose.Schema.Types.ObjectId, //mongoose library, schema structure, mongoosechema data type, objectId
           ref: 'Author' //needs to come from a document of the Author model. (Basically, tell mongoose to look in the 'Author' collection)
       }],  
       title: {type: String, required: true},
       content: {type: String, required: true},
       comments: [commentSchema], //assigning the commentSchema we made above, to the blogpost's "comment" key. It'll be exported along with blogpost as its subdocument.
       created: {type: Date, default: Date.now}
   });//end of Schema declaration

   //Prehook that essential queries the Author collection using the info provided in the blogposts' "author" property to find and fill in the author key with the actual author document object.
   blogPostSchema.pre('find', function(next) {
       this.populate('author');
       next();
   });

   //same as above, but listens for the findOne() query method aswell.
   blogPostSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
  });

//This provides a virtual property that gets added to the document programmatically
//NOTE: ***** ()=> ARROW FUNCTIONS DO NOT WORK IN THE BELOW CODE!!!! nor do they work in the methods.serialize... code below!!! I think this is mongoose 
   blogPostSchema.virtual('authorName').get(function() { 
       for(let i =0; i< this.author.length; i++){
           return `${this.author[i].firstName} ${this.author[i].lastName}`.trim();
       } 
    //    return `${this.author[0].firstName} ${this.author[0].lastName}`.trim(); ****Used to be this but i modified it to allow for more authors
   });

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data.
//***This should be used for easy to read API features. we don't
//want to give the client the author name as an object with the first and
//last name divided.
   blogPostSchema.methods.serialize = function() {
       return {
           id: this._id,
           author: this.authorName,
           content: this.content,
           title: this.title,
           created: this.created,
           comments: this.comments
       };
   };


//Creating the model object that we will export and use in our router. Remember the "const BlogPost"
//part doesn't really matter dirung the import. We are actually naming the model in the first argument
//where it counts-->mongoose.model("BlogPost") and in the second argument we are giving it the value of 
//the schema we created called blogPostSchema.
//We can OPTIONALLY add a 3rd argument that states which "collection" we want to contribute the documents to 
//be created by our model, HOWEVER, mongoDb infers on it's own which collection you mean based off the name you
//give this model,...which is actually pretty intuitive because models should be made for each collection anyway right?
//BUT*******I found that it's still BEST to include collection name (3rd argument) just in case. If your queries are coming back empty, check this first.
   const BlogPost = mongoose.model('BlogPost', blogPostSchema,"blogPosts"); //
   const Author = mongoose.model('Author', authorSchema, 'authors');

//this model object is now ready to be imported into blogfulRouter.js
module.exports = {BlogPost, Author};
