var LiveModel = require("../index").LiveModel,
    assert = require("assert");

exports['test adding things'] = function(beforeExit) {
  LiveModel("things", function(Thing) {
    var thing = new Thing({title:"My title", published: true});
    var run = false;

    thing.save(function(docs) {
      Thing.find({published: true}, function(things) {
         assert.equal("My title", things[0].title);
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
        assert.equal("Myitle", things[0].title);

        newThing.save(function() {
          assert.equal("Another title", things[1].title);
          unpubd.save(function() {
            assert.equal(2, things.length);
            LiveModel.close();
          });
        });
      });

    }); 
  });
};

/*
exports['test removing thing updates collection'] = function() {
  var thing = new Thing({title:"My title", published: true});
  //add a thing
  thing.save(function() {
    //find the thing
    Thing.find({published: true}, function(things) {
      assert.equal(1, things.length);
      //remove the thing
      thing.remove(function() {
        assert.equal(0, things.length);
      });
  
    });  
  });
}; */
