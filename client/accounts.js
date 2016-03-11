

Accounts.ui.config({
	//passwordSignupFields: "USERNAME_ONLY",
    requestPermissions: {},
    extraSignupFields: [{
        fieldName: 'full-name',
        fieldLabel: 'Full name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please enter your first and last name");
            return false;
          } else {
            return true;
          }
        }
    }],
	forceEmailLowercase: true,
    forceUsernameLowercase: true
});