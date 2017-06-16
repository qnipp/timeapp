// Set up login services
Meteor.startup(function() {
  // Add Facebook configuration entry
  /*
	ServiceConfiguration.configurations.update(
	  { service: "facebook" },
	  { $set: {
	      appId: "XXXXXXXXXXXXXXX",
	      secret: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	    }
	  },
	  { upsert: true }
	);
	*/
  // Add GitHub configuration entry
  /*
	ServiceConfiguration.configurations.update(
	  { service: "github" },
	  { $set: {
	      clientId: "XXXXXXXXXXXXXXXXXXXX",
	      secret: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
	    }
	  },
	  { upsert: true }
	);
	*/
  /*
	  // Add Google configuration entry
	  ServiceConfiguration.configurations.update(
	    { service: "google" },
	    { $set: {
	        clientId: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	        client_email: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	        secret: "XXXXXXXXXXXXXXXXXXXXXXXX"
	      }
	    },
	    { upsert: true }
	  );
	*/
  // Add Linkedin configuration entry
  /*
	ServiceConfiguration.configurations.update(
	  { service: "linkedin" },
	  { $set: {
	      clientId: "XXXXXXXXXXXXXX",
	      secret: "XXXXXXXXXXXXXXXX"
	    }
	  },
	  { upsert: true }
	);
	*/
});

/*
Accounts.emailTemplates.siteName = "TimeApp";
Accounts.emailTemplates.from = "TimeApp <timeapp@qnipp.com>";
Accounts.emailTemplates.resetPassword.subject = function (user) {
    return "Message for " + user.profile.displayName;
};
Accounts.emailTemplates.resetPassword.text = function (user, url) {
    var signature = "TimeApp Bot";
    //var president = President.findOne();
    //if (president)
    //    president = Meteor.users.findOne(president.presidentId);
    //    signature = president.profile.displayName + ", the TimeApp President.";
    return "Dear " + user.profile.displayName + ",\n\n" +
        "Click the following link to set your new password:\n" +
        url + "\n\n" +
        "Please never forget it again!!!\n\n\n" +
        "Cheers,\n" +
        signature;
};
*/
