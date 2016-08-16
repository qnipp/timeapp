// Options

// see: https://github.com/meteor-useraccounts/core/blob/master/Guide.md

AccountsTemplates.configure({
	//  defaultLayout: 'ApplicationLayout',
	
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    lowercaseUsername: true,
    focusFirstInput: true,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: false,

    // Client-side Validation
    continuousValidation: false,
    negativeFeedback: false,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Privacy Policy and Terms of Use
    //privacyUrl: 'privacy',
    //termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: '/iamin',
    redirectTimeout: 2000,

    // Hooks
	/*
    onLogoutHook: myLogoutFunc,
    onSubmitHook: mySubmitFunc,
    preSignUpHook: myPreSubmitFunc,
    postSignUpHook: myPostSubmitFunc,
	*/

    // Texts
    texts: {
      button: {
          signUp: "Register Now!"
      },
      socialSignUp: "Register",
      socialIcons: {
          "meteor-developer": "fa fa-rocket"
      },
      title: {
          forgotPwd: "Recover Your Password"
      },
    },
});

/*


AccountsTemplates.configure({
	//defaultLayout: 'emptyLayout',
	showForgotPasswordLink: true,
	overrideLoginErrors: true,
	enablePasswordChange: true,

	// sendVerificationEmail: true,
	// enforceEmailVerification: true,
	//confirmPassword: true,
	//continuousValidation: false,
	//displayFormLabels: true,
	//forbidClientAccountCreation: true,
	//formValidationFeedback: true,
	//homeRoutePath: '/',
	//showAddRemoveServices: false,
	//showPlaceholders: true,

	negativeValidation: true,
	positiveValidation: true,
	negativeFeedback: false,
	positiveFeedback: true,

	// Privacy Policy and Terms of Use
	//privacyUrl: 'privacy',
	//termsUrl: 'terms-of-use',
});
*/

//Routes
//AccountsTemplates.configureRoute('changePwd');
//AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('forgotPwd');
//AccountsTemplates.configureRoute('resetPwd');

/*
AccountsTemplates.addField({
    _id: 'JIRA_user',
    type: 'text',
    displayName: "Jira Username",
    required: false,
    func: function (number) {
        if (Meteor.isServer){
			return false; // meaning no error!
			return true; // Validation error!
        }
    },
    errStr: 'Invalid Username number!',
});

AccountsTemplates.addField({
    _id: 'JIRA_pswd',
    type: 'text',
    displayName: "Jira Password",
    required: false,
    func: function (number) {
        if (Meteor.isServer){
			return false; // meaning no error!
			return true; // Validation error!
        }
    },
    errStr: 'Invalid Password number!',
});
*/

AccountsTemplates.configureRoute('signIn', {
    name: 'login',
    path: '/',
    //template: 'login',
    layoutTemplate: 'ApplicationLayout',
    //redirect: '/iamin',
	yieldTemplates: {
        logobar: {to: 'header'},
        login: {to: 'main'},
    }
});

AccountsTemplates.configureRoute('signUp', {
    name: 'register',
    path: '/register',
    //template: 'register',
    layoutTemplate: 'ApplicationLayout',
    redirect: '/iamin',
	yieldTemplates: {
        logobar: {to: 'header'},
        register: {to: 'main'},
    }
});


AccountsTemplates.configureRoute('changePwd', {
    name: 'profile',
    path: '/profile',
    //template: 'register',
    layoutTemplate: 'ApplicationLayout',
    //redirect: '/profile',
	yieldTemplates: {
        navbar: {to: 'header'},
        profile: {to: 'main'},
    }
});

AccountsTemplates.configureRoute('forgotPwd', {
    name: 'forgot',
    path: '/forgot',
    //template: 'register',
    layoutTemplate: 'ApplicationLayout',
    //redirect: '/profile',
	yieldTemplates: {
        navbar: {to: 'header'},
        forgot: {to: 'main'},
    }
});


//AccountsTemplates.configureRoute('verifyEmail');