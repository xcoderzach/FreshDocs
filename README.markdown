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
  
