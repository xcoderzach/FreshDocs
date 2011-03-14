FreshDocuments
===============

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

## Known Problems (that will be fixed)

  * It's not super efficient for high numbers of collections (linear search)
  * Nothing gets GC'd, yeah...badness
  * get and set functions are teh lamez
  * buggy and generally inefficient
