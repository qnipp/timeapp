// Options

/*
AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    lowercaseUsername: false,
    focusFirstInput: true,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: false,
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
    redirectTimeout: 4000,

    // Hooks
    onLogoutHook: myLogoutFunc,
    onSubmitHook: mySubmitFunc,
    preSignUpHook: myPreSubmitFunc,
    postSignUpHook: myPostSubmitFunc,

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

*/


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


//Routes
//AccountsTemplates.configureRoute('changePwd');
//AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('forgotPwd');
//AccountsTemplates.configureRoute('resetPwd');

AccountsTemplates.configureRoute('signIn', {
    name: 'login',
    path: '/',
    //template: 'login',
    layoutTemplate: 'ApplicationLayout',
    redirect: '/iamin',
	yieldTemplates: {
        logobar: {to: 'header'},
        login: {to: 'main'},
    }
});

AccountsTemplates.configureRoute('signUp', {
    name: 'register',
    path: '/register',
    template: 'register',
    //layoutTemplate: 'myLayout',
    redirect: '/iamin',
	yieldTemplates: {
        logobar: {to: 'header'},
        login: {to: 'main'},
    }
});

//AccountsTemplates.configureRoute('verifyEmail');