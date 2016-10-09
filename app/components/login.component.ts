import { Component }      from '@angular/core';
import { LoginService } from '../services/login.service';

declare var swal;

export class User {
  constructor() { this.email = ""; this.password = "" }
  email: string;
  password: string;
}

export class NewUser {
  constructor() { this.name = ""; this.email = ""; this.password = "" }
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'login',
  templateUrl: 'views/login.html',
  providers: [LoginService]
})

export class LoginComponent {
  constructor(private loginService: LoginService) { }

  user: User = new User();
  newUser: NewUser = new NewUser();

  isLoading: boolean = false;

  // Running on the array of login validation functions and make sure all valid.
  LoginValidation() {
    var isValid = true;
    var checkedFieldsIds = [];

    // Running on all login validation functions.
    for (var i = 0; i < loginValidationFuncs.length; i++) {
      // In case the field was not invalid before.
      if (!IsInArray(checkedFieldsIds, loginValidationFuncs[i].fieldId)) {        
        // In case the field is not valid.
        if (!loginValidationFuncs[i].isFieldValid(this.user)) {
          // In case the field is the first invalid field.
          if (isValid) {
            $("#" + loginValidationFuncs[i].inputId).focus();
          }

          isValid = false;

          // Push the field id to the array,
          // so in the next validation of this field it will not be checked.
          checkedFieldsIds.push(loginValidationFuncs[i].fieldId);

          // Show the microtext of the field. 
          $("#" + loginValidationFuncs[i].fieldId).html(loginValidationFuncs[i].errMsg);
        }
        else {
          // Clear the microtext of the field.
          $("#" + loginValidationFuncs[i].fieldId).html("");
        }
      }
    }

    checkedFieldsIds = [];

    return isValid;
  }

  // Login user and redirect him to main page.
  Login() {
    // Focus out login button.
    $("#login-btn").blur();

    // In case the login fields are valid.
    if (this.LoginValidation()) {
      this.isLoading = true;

      this.loginService.Login(this.user.email, this.user.password).then((result) => {
        this.isLoading = false;

        // In case of server error.
        if (result == null) {
          $("#server-error").snackbar("show");

        }
        else if (result == false) {
          $("#login-failed").snackbar("show");
        }
        else {
          swal("ברוך הבא!");
        }
      });
    }
  }

  // Running on the array of register validation functions and make sure all valid.
  RegisterValidation() {
    var isValid = true;
    var checkedFieldsIds = [];

    // Running on all register validation functions.
    for (var i = 0; i < registerValidationFuncs.length; i++) {

      // In case the field was not invalid before.
      if (!IsInArray(checkedFieldsIds, registerValidationFuncs[i].fieldId)) {        
        // In case the field is not valid.
        if (!registerValidationFuncs[i].isFieldValid(this.newUser)) {
          // In case the field is the first invalid field.
          if (isValid) {
            $("#" + registerValidationFuncs[i].inputId).focus();
          }

          isValid = false;

          // Push the field id to the array,
          // so in the next validation of this field it will not be checked.
          checkedFieldsIds.push(registerValidationFuncs[i].fieldId);

          // Show the microtext of the field. 
          $("#" + registerValidationFuncs[i].fieldId).html(registerValidationFuncs[i].errMsg);
        }
        else {
          // Clear the microtext of the field.
          $("#" + registerValidationFuncs[i].fieldId).html("");
        }
      }
    }

    checkedFieldsIds = [];

    return isValid;
  }

  // Regiter the new user to the DB.
  Register() {
    // Focus out register button.
    $("#register-btn").blur();

    // In case the register modal fields are valid.
    if (this.RegisterValidation()) {
      this.isLoading = true;

      this.loginService.Register(this.newUser.name, this.newUser.email, this.newUser.password).then((result) => {
        this.isLoading = false;

        // In case of server error.
        if (result == null) {
          $("#server-error").snackbar("show");
        }
        // In case the email is already exists.
        else if (result == false) {
          swal(
            'אופס...',
            'כתובת האימייל כבר נמצאת בשימוש!',
            'error'
          );
        }
        else {
          $("#register-modal").modal('hide');
        }
      });
    }
  }

  // Exit from register modal.
  CancelRegister() {
    $("#register-modal").modal('hide');
    this.newUser = new NewUser();
    $(".microtext").html("");
  }

  // Key up in login.
  LoginKeyUp(event) {
    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.Login();
    }
  }

  // Key up in register modal.
  RegisterKeyUp(event) {
    // In case the key is escape.
    if (event.keyCode == 27) {
      this.newUser = new NewUser();
    }

    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.Register();
    }
  }
}

//***Help vars and functions***//

// Login validation functions array.
var loginValidationFuncs = [
  {
    isFieldValid(user) {
      return (user.email ? true : false);
    },
    errMsg: "נדרש",
    fieldId: "login-email-micro",
    inputId: "login-email"
  },
  {
    isFieldValid(user) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      return (emailPattern.test(user.email));
    },
    errMsg: "לא תקין",
    fieldId: "login-email-micro",
    inputId: "login-email"
  },
  {
    isFieldValid(user) {
      return (user.password ? true : false);
    },
    errMsg: "נדרש",
    fieldId: "login-password-micro",
    inputId: "login-password"
  }
];

// Register validation functions array.
var registerValidationFuncs = [
  {
    isFieldValid(newUser) {
      return (newUser.name ? true : false);
    },
    errMsg: "הכנס את שמך!",
    fieldId: "register-name-micro",
    inputId: "register-name"
  },
  {
    isFieldValid(newUser) {
      return (newUser.email ? true : false);
    },
    errMsg: "הכנס אימייל!",
    fieldId: "register-email-micro",
    inputId: "register-email"
  },
  {
    isFieldValid(newUser) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

      return (emailPattern.test(newUser.email));
    },
    errMsg: "כתובת אימייל לא תקינה!",
    fieldId: "register-email-micro",
    inputId: "register-email"
  },
  {
    isFieldValid(newUser) {
      return (newUser.password ? true : false);
    },
    errMsg: "הכנס סיסמא!",
    fieldId: "register-password-micro",
    inputId: "register-password"
  }
];

// Check if object is in array.
function IsInArray(array, value): boolean {
  // Running on all the array.
  for (var i = 0; i < array.length; i++) {
    // In case the value is in the array.
    if (array[i] === value) {
      return true;
    }
  }

  return false;
}