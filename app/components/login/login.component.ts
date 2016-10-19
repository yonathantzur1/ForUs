import { Component } from '@angular/core';
import { LoginService } from '../../services/login/login.service';

declare var swal;

export class User {
  constructor() { this.email = ""; this.password = ""; }
  email: string;
  password: string;
}

export class NewUser {
  constructor() { this.name = ""; this.email = ""; this.password = ""; }
  name: string;
  email: string;
  password: string;
}

export class ForgotUser {
  constructor() {
    this.email = "";
    this.code = "";
    this.newPassword = "";
    this.showResetCodeField = false;
    this.hasResetCode = false;
  }
  email: string;
  code: string;
  newPassword: string;
  showResetCodeField: boolean;
  hasResetCode: boolean;
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
  forgotUser: ForgotUser = new ForgotUser();

  isLoading: boolean = false;

  forgotBtnTextObj = { searchText: "חיפוש", resetPassText: "אפס סיסמא" }
  forgotBtnText: string = this.forgotBtnTextObj.searchText;

  // Running on the array of validation functions and make sure all valid.
  Validation(funcArray, obj) {
    var isValid = true;
    var checkedFieldsIds = [];

    // Running on all login validation functions.
    for (var i = 0; i < funcArray.length; i++) {
      // In case the field was not invalid before.
      if (!IsInArray(checkedFieldsIds, funcArray[i].fieldId)) {
        // In case the field is not valid.
        if (!funcArray[i].isFieldValid(obj)) {
          // In case the field is the first invalid field.
          if (isValid) {
            $("#" + funcArray[i].inputId).focus();
          }

          isValid = false;

          // Push the field id to the array,
          // so in the next validation of this field it will not be checked.
          checkedFieldsIds.push(funcArray[i].fieldId);

          // Show the microtext of the field. 
          $("#" + funcArray[i].fieldId).html(funcArray[i].errMsg);
        }
        else {
          // Clear the microtext of the field.
          $("#" + funcArray[i].fieldId).html("");
        }
      }
    }

    checkedFieldsIds = [];

    return isValid;
  }

  // Login user and redirect him to main page.
  Login() {
    // In case the login fields are valid.
    if (this.Validation(loginValidationFuncs, this.user)) {
      this.isLoading = true;

      this.loginService.Login(this.user).then((result) => {
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

  // Regiter the new user to the DB.
  Register() {
    // In case the register modal fields are valid.
    if (this.Validation(registerValidationFuncs, this.newUser)) {
      this.isLoading = true;

      this.loginService.Register(this.newUser).then((result) => {
        this.isLoading = false;

        // In case of server error.
        if (result == null) {
          $("#server-error").snackbar("show");
        }
        // In case the email is already exists.
        else if (result == false) {
          // Show microtext of the email field. 
          $("#register-email-micro").html("אימייל זה כבר נמצא בשימוש!");
        }
        else {
          $("#register-modal").modal('hide');
        }
      });
    }
  }

  // Send mail with reset code to the user.
  ResetPassword() {
    // In case the forgot modal fields are valid.
    if (this.Validation(forgotValidationFuncs, this.forgotUser)) {
      this.isLoading = true;

      // In case the user is in the first stage of reset password.
      if (this.forgotUser.showResetCodeField == false) {
        this.loginService.Forgot(this.forgotUser.email).then((result) => {
          this.isLoading = false;

          // In case of server error.
          if (result == null) {
            $("#server-error").snackbar("show");
          }
          // In case the user was not found.
          else if (result == false) {
            // Show microtext of the email field. 
            $("#forgot-email-micro").html("אימייל זה לא קיים במערכת!");
          }
          // In case the user was found.
          else {
            this.forgotUser.showResetCodeField = true;
            this.forgotBtnText = this.forgotBtnTextObj.resetPassText;
          }
        });
      }
      // In case the user is in the second stage of reset password.
      else {
        this.loginService.ResetPassword(this.forgotUser).then((result) => {
          this.isLoading = false;

          // In case of server error.
          if (result == null) {
            $("#server-error").snackbar("show");
          }
          // In case the reset code is wrong.
          else if (result == false) {
            // Show microtext of the code field. 
            $("#forgot-code-micro").html("הקוד שהוזן שגוי!");
          }
          // In case the password has been changed.
          else {
            $("#forgot-modal").modal('hide');
          }
        });
      }
    }
  }

  hasResetCode() {
    this.forgotUser.hasResetCode = true;
    this.forgotUser.showResetCodeField = true;
    this.forgotBtnText = this.forgotBtnTextObj.resetPassText;
  }

  // Open modal and clear all.
  OpenModal() {
    this.user = new User();
    this.newUser = new NewUser();
    this.forgotUser = new ForgotUser();
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
    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.Register();
    }
  }

  // Key up in forgot modal.
  ForgotKeyUp(event) {
    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.ResetPassword();
    }
  }

  // Hide microtext in a specific field.
  HideMicrotext(fieldId) {
    $("#" + fieldId).html("");
  }

}

//***Help vars and functions***//

// Login validation functions array.
var loginValidationFuncs = [
  {
    isFieldValid(user) {
      return (user.email ? true : false);
    },
    errMsg: "יש להזין כתובת אימייל",
    fieldId: "login-email-micro",
    inputId: "login-email"
  },
  {
    isFieldValid(user) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      return (emailPattern.test(user.email));
    },
    errMsg: "כתובת אימייל לא תקינה",
    fieldId: "login-email-micro",
    inputId: "login-email"
  },
  {
    isFieldValid(user) {
      return (user.password ? true : false);
    },
    errMsg: "יש להזין סיסמא",
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
    errMsg: "יש להזין את שמך!",
    fieldId: "register-name-micro",
    inputId: "register-name"
  },
  {
    isFieldValid(newUser) {
      var namePattern = /^[א-ת]{2,}([ ]+[א-ת]{2,})*$/i;
      return (namePattern.test(newUser.name));
    },
    errMsg: "יש להזין שם תקין בעברית!",
    fieldId: "register-name-micro",
    inputId: "register-name"
  },
  {
    isFieldValid(newUser) {
      return (newUser.email ? true : false);
    },
    errMsg: "יש להזין כתובת אימייל!",
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
    errMsg: "יש להזין סיסמא!",
    fieldId: "register-password-micro",
    inputId: "register-password"
  }
];

var forgotValidationFuncs = [
  {
    isFieldValid(forgotUser) {
      return (forgotUser.email ? true : false);
    },
    errMsg: "יש להזין כתובת אימייל!",
    fieldId: "forgot-email-micro",
    inputId: "forgot-email"
  },
  {
    isFieldValid(forgotUser) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

      return (emailPattern.test(forgotUser.email));
    },
    errMsg: "כתובת אימייל לא תקינה!",
    fieldId: "forgot-email-micro",
    inputId: "forgot-email"
  },
  {
    isFieldValid(forgotUser) {
      // In case the code field is shown.
      if (forgotUser.showResetCodeField || forgotUser.hasResetCode) {
        return (forgotUser.code ? true : false);
      }
      else {
        return true;
      }
    },
    errMsg: "יש להזין קוד אימות!",
    fieldId: "forgot-code-micro",
    inputId: "forgot-code"
  },
  {
    isFieldValid(forgotUser) {
      // In case the code field is shown.
      if (forgotUser.showResetCodeField  || forgotUser.hasResetCode) {
        return (forgotUser.newPassword ? true : false);
      }
      else {
        return true;
      }
    },
    errMsg: "יש להזין סיסמא חדשה!",
    fieldId: "forgot-newPassword-micro",
    inputId: "forgot-newPassword"
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