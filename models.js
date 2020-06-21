"use strict";

/*We are replacing the "BlogPosts" object that had values that were methods for creating a new blog, reading, deleting, and updating
  blogs. We don't need to do that anymore. Mongoose has syntax that we can use to setup the rules for what a blog should look like (schema)
  and it also has the ability to delete, create, update, and read with it's native methods.
  This also means we don't need to use the "uuid" npm package that creates unique ids because once an item is created and stored in mongoDb, it's
  automatically given an id.
  
  Create a new blogpostsSchema and export the Blogposts model to be used in the blogfulRouter*/

  const mongoose = require("mongoose");

  //This is the schema to represent a Blog post object
   const blogPostSchema = mongoose.Schema({
       author: {                //author is an object with keys which have string values
           firstName: String,
           lastName: String
       },
       title: {type: String, required: true},
       content: {type: String, required: true},
       created: {type: Date, default: Date.now}
   });//end of Schema declaration

//This provides a virtual property that gets added to the document programmatically
//NOTE: ***** ()=> ARROW FUNCTIONS DO NOT WORK IN THE BELOW CODE!!!! nor do they work in the methods.serialize... code below!!! I think this is mongoose 
   blogPostSchema.virtual('authorName').get(function() {  
       return `${this.author.firstName} ${this.author.lastName}`.trim();
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
           created: this.created
       };
   };


//Creating the model object that we will export and use in our router. Remember the "const BlogPost"
//part doesn't really matter dirung the import. We are actually naming the model in the first argument
//where it counts-->mongoose.model("BlogPost") and in the second argument we are giving it the value of 
//the schema we created called blogPostSchema.
//We can OPTIONALLY add a 3rd argument that states which "collection" we want to contribute the documents to 
//be created by our model, HOWEVER, mongoDb infers on it's own which collection you mean based off the name you
//give this model,...which is actually pretty intuitive because models should be made for each collection anyway right?
   const BlogPost = mongoose.model('BlogPost', blogPostSchema,"blogPosts");
   
//this model object is now ready to be imported into blogfulRouter.js
module.exports = {BlogPost};
