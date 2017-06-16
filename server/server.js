Meteor.startup(function() {
  // code to run on server at startup

  console.log("Meteor startup is called!");

  //console.log("Dropping indeces on items..");
  //Items._dropIndex("title");

  if (CNF.PLUGIN) {
    for (var plugin in CNF.PLUGIN) {
      console.log("Loading TimeApp plugin: " + plugin);
      if (CNF.PLUGIN[plugin].ATTRIBUTES) {
        var found = false;
        for (var attrib in CNF.PLUGIN[plugin].ATTRIBUTES) {
          //console.log("Checking if Attribute is available: "+ attrib + " / " + CNF.PLUGIN[plugin].ATTRIBUTES[attrib]);
          found = Attributes.findOne({
            name: CNF.PLUGIN[plugin].ATTRIBUTES[attrib]
          });

          if (!found) {
            console.log(
              "Creating new Attribute: " + CNF.PLUGIN[plugin].ATTRIBUTES[attrib]
            );
            Attributes.insert({
              name: CNF.PLUGIN[plugin].ATTRIBUTES[attrib],
              type: "text",
              defaulValue: ""
            });
          }
        }
      }
    }
  }
});
