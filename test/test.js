var LiveModel = require("../index").LiveModel,
    assert = require("assert");

exports['test adding things'] = function(beforeExit) {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"My title", published: true});
    var run = false;

    thing.save(function(docs) {
      Thing.find({published: true}, function(things) {
        assert.equal("My title", things[0].get("title"));
        assert.equal(1, things.length);
        run = true;
      });
    });

    beforeExit(function(){
      assert.ok(run, 'Ensure all three timeouts are called');
    });
  });
};

exports['test adding thing updates collection'] = function() {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"Myitle", published: true});
    var newThing = new Thing({title:"Another title", published: true});
    var unpubd = new Thing({title:"Not ready", published: false});

    Thing.find({published: true}, function(things) {
      var calls = 0;
      thing.save(function() {
        assert.equal("Myitle", things[0].get("title"));

        newThing.save(function() {
          assert.equal("Another title", things[1].get("title"));
          unpubd.save(function() {
            assert.equal(2, things.length);
          });
        });
      });

    }); 
  });
};

exports['test removing thing updates collection'] = function() {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"Myitle", published: true});
    //add a thing
    thing.save(function() {
      //find the thing
      Thing.find({published: true}, function(things) {
        assert.equal(1, things.length);
        //remove the thing
        thing.remove(function() {
          //no things!
          assert.equal(0, things.length);
        });
    
      });  
    });
  });
};

exports['test changing a thing updates all instances of the thing'] = function() {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"Myitle", published: true});

    thing.save(function() {
      Thing.find({title: "Myitle"}, function(things) {
        things[0].set({title: "different title"});
        things[0].save(function() {
          assert.eql("different title", thing.get("title")); 
          assert.eql("different title", things[0].get("title")); 
        });
      }); 
    });
  });
};

exports['create events are called'] = function() {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"Myitle", published: true});
    //add a thing
    Thing.find({published: true}, function(things) {
      things.once("create", function(evtThing) {
        assert.eql(thing.get("_id"), evtThing.get("_id")); 
      });
      thing.save();
    });
  }); 
};

exports['remove events are called'] = function() {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"Myitle", published: true});
    Thing.find({published: true}, function(things) {
      things.once("remove", function(evtId) {
        assert.eql(thing.get("_id"), evtId); 
        LiveModel.close();
      });
      thing.save();
      thing.remove();
    });
  }); 
};
