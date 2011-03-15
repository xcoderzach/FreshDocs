FreshDocuments - MongoDB ODM v0.0.2
===================================

####FreshDocs makes sure that your documents never get stale

  First, an example!

    //Get a document
    var document = Documents.findById("some object id value")
    document.update({title: "A title for out collaborative thing"})

    document.on("update", function() {
      //this will log "A better title, for our collaborative thing"          
      console.log(document.get("title"))
    })

  Meanwhile, someone else...

    var document = Documents.findById("some object id value")
    document.update({title: "A better title, for our collaborative thing"})
  
## But hey! What about collections!

  Right, it wouldn't be very useful if your documents stayed up to date,
  but not your collections!  

  Another Example!

    var documents = Documents.find({awesome: true})

    documents.on("add", function(newDocument) {
      console.log(newDocument.get("title"))
    }

  Meanwhile

    Document.create({title: "An awesome document", awesome: true})

  Updated for you like magic!

## Validations
 
  So you need to validate your data? Cool, we can do that.

  When you're creating a FreshDocument instance, you just pass the validation
  middleware in with your validations

    var Things = FreshDocuments("things", 
                                 Validations({ title: 
                                               { length: { between: [4, 100]
                                                         , message: "Invalid length"}}})) 

  Blam your titles have to be between 4 and 100 characters

## Documentation 
 
  Yes, the documentation is pretty bad right now, It'll get updated as soon as the api
  stabilizes. :-D


## Known Problems (that will be fixed)

  * It's not super efficient for high numbers of collections (linear search)
  * Nothing gets GC'd, yeah...badness
  * get and set functions are teh lamez
  * buggy and generally inefficient
  * The test suite will randomly fail about 1/50 runs, I havent seen this
    problem when used in actual use

## Contributing 

  Any contributions are welcome, features, ideas, bugs, criticism.
  I would be especially grateful for feedback on the api.

## Thanks

  Thanks to Chad Seibert and Brian Goslinga (qbg on github) for help with
  brainstorming and implementation details

  Also thanks to marcello3d for making the awesome Mongolian
  https://github.com/marcello3d/node-mongolian mongodb driver


