Accounts.ui.config({
  //passwordSignupFields: "USERNAME_ONLY",
  requestPermissions: {},
  extraSignupFields: [
    {
      fieldName: "full-name",
      fieldLabel: "Full name",
      inputType: "text",
      visible: true,
      validate: function(value, errorFunction) {
        if (!value) {
          errorFunction("Please enter your first and last name");
          return false;
        } else {
          return true;
        }
      }
    }
  ],
  forceEmailLowercase: true,
  forceUsernameLowercase: true
});

/*
// Generate user initials after Facebook login
Accounts.onCreateUser((options, user) => {
  if (! user.services.facebook) {
    throw new Error('Expected login with Facebook only.');
  }

  const { first_name, last_name } = user.services.facebook;
  user.initials = first_name[0].toUpperCase() + last_name[0].toUpperCase();

  // Don't forget to return the new user object at the end!
  return user;
});*/
