import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../../services/login/login.service';

declare var swal: any;

export class User {
  constructor() { this.email = ""; this.password = ""; }
  email: string;
  password: string;
}

export class NewUser {
  constructor() { this.firstName = ""; this.lastName = ""; this.email = ""; this.password = ""; }
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

var forgotBtnTextObj = { searchText: "חיפוש", resetPassText: "אפס סיסמא" }

export class ForgotUser {
  constructor() {
    this.email = "";
    this.code = "";
    this.newPassword = "";
    this.showResetCodeField = false;
    this.hasResetCode = false;
    this.forgotBtnText = forgotBtnTextObj.searchText;
  }
  email: string;
  code: string;
  newPassword: string;
  showResetCodeField: boolean;
  hasResetCode: boolean;
  forgotBtnText: string;
}

@Component({
  selector: 'login',
  templateUrl: './login.html',
  providers: [LoginService]
})

export class LoginComponent {
  constructor(private router: Router, private loginService: LoginService) { }

  user: User = new User();
  newUser: NewUser = new NewUser();
  forgotUser: ForgotUser = new ForgotUser();

  isLoading: boolean = false;

  // Running on the array of validation functions and make sure all valid.
  // Getting validation array and object to valid.
  Validation(funcArray: any[], obj: any) {
    var isValid = true;
    var checkedFieldsIds: any[] = [];

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
          this.router.navigateByUrl('');
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
          $("#register-email-micro").html("אימייל זה כבר נמצא בשימוש");
        }
        else {
          $("#register-modal").modal('hide');
          this.router.navigateByUrl('');
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
            $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
          }
          // In case the user was found.
          else {
            this.forgotUser.showResetCodeField = true;
            this.forgotUser.forgotBtnText = forgotBtnTextObj.resetPassText;
            $("#reset-password-alert").snackbar("show");
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
          // In case the email was not found.
          else if (result == false || result.emailNotFound) {
            $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
          }
          // In case the reset code is not exists.
          else if (result.codeNotFound) {
            $("#forgot-code-micro").html("הקוד שהוזן לא נמצא");
          }
          // In case the reset code is lock with max tries or already been used.
          else if (result.maxTry || result.codeIsUsed) {
            $("#forgot-code-micro").html("קוד זה נעול");
          }
          // In case the reset code is expired.
          else if (result.codeIsExpired) {
            $("#forgot-code-micro").html("פג תוקפו של הקוד שהוזן");
          }
          // In case the reset code is wrong.
          else if (result.codeNotValid) {
            $("#forgot-code-micro").html("הקוד שהוזן שגוי");
          }
          // In case the password has been changed.
          else {
            $("#forgot-modal").modal('hide');
            swal(
              'איפוס סיסמא',
              'הסיסמא הוחלפה בהצלחה!',
              'success'
            );
          }
        });
      }
    }
  }

  hasResetCode() {
    this.forgotUser.hasResetCode = true;
    this.forgotUser.showResetCodeField = true;
    this.forgotUser.forgotBtnText = forgotBtnTextObj.resetPassText;
    $(".microtext").html("");
  }

  // Open modal and clear all.
  OpenModal() {
    this.user = new User();
    this.newUser = new NewUser();
    this.forgotUser = new ForgotUser();
    $(".microtext").html("");
  }

  // Key up in login.
  LoginKeyUp(event: any) {
    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.Login();
    }
  }

  // Key up in register modal.
  RegisterKeyUp(event: any) {
    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.Register();
    }
  }

  // Key up in forgot modal.
  ForgotKeyUp(event: any) {
    // In case the key is enter.
    if (event.keyCode == 13) {
      $(".user-input").blur();
      this.ResetPassword();
    }
  }

  // Hide microtext in a specific field.
  HideMicrotext(fieldId: string) {
    $("#" + fieldId).html("");
  }

}

//***Help vars and functions***//

// Login validation functions array.
var loginValidationFuncs = [
  {
    isFieldValid(user: User) {
      return (user.email ? true : false);
    },
    errMsg: "יש להזין כתובת אימייל",
    fieldId: "login-email-micro",
    inputId: "login-email"
  },
  {
    isFieldValid(user: User) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      return (emailPattern.test(user.email));
    },
    errMsg: "כתובת אימייל לא תקינה",
    fieldId: "login-email-micro",
    inputId: "login-email"
  },
  {
    isFieldValid(user: User) {
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
    isFieldValid(newUser: NewUser) {
      return (newUser.firstName ? true : false);
    },
    errMsg: "יש להזין שם פרטי",
    fieldId: "register-firstName-micro",
    inputId: "register-firstName"
  },
  {
    isFieldValid(newUser: NewUser) {
      var namePattern = /^[א-ת']{2,}([ ]+[א-ת']{2,})*([-]+[א-ת']{2,})*$/i;
      return (namePattern.test(newUser.firstName));
    },
    errMsg: "יש להזין שם תקין בעברית",
    fieldId: "register-firstName-micro",
    inputId: "register-firstName"
  },
  {
    isFieldValid(newUser: NewUser) {
      return (newUser.lastName ? true : false);
    },
    errMsg: "יש להזין שם משפחה",
    fieldId: "register-lastName-micro",
    inputId: "register-lastName"
  },
  {
    isFieldValid(newUser: NewUser) {
      var namePattern = /^[א-ת']{2,}([ ]+[א-ת']{2,})*([-]+[א-ת']{2,})*$/i;
      return (namePattern.test(newUser.lastName));
    },
    errMsg: "יש להזין שם תקין בעברית",
    fieldId: "register-lastName-micro",
    inputId: "register-lastName"
  },
  {
    isFieldValid(newUser: NewUser) {
      return (newUser.email ? true : false);
    },
    errMsg: "יש להזין כתובת אימייל",
    fieldId: "register-email-micro",
    inputId: "register-email"
  },
  {
    isFieldValid(newUser: NewUser) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

      return (emailPattern.test(newUser.email));
    },
    errMsg: "כתובת אימייל לא תקינה",
    fieldId: "register-email-micro",
    inputId: "register-email"
  },
  {
    isFieldValid(newUser: NewUser) {
      return (newUser.password ? true : false);
    },
    errMsg: "יש להזין סיסמא",
    fieldId: "register-password-micro",
    inputId: "register-password"
  }
];

var forgotValidationFuncs = [
  {
    isFieldValid(forgotUser: ForgotUser) {
      return (forgotUser.email ? true : false);
    },
    errMsg: "יש להזין כתובת אימייל",
    fieldId: "forgot-email-micro",
    inputId: "forgot-email"
  },
  {
    isFieldValid(forgotUser: ForgotUser) {
      var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

      return (emailPattern.test(forgotUser.email));
    },
    errMsg: "כתובת אימייל לא תקינה",
    fieldId: "forgot-email-micro",
    inputId: "forgot-email"
  },
  {
    isFieldValid(forgotUser: ForgotUser) {
      // In case the code field is shown.
      if (forgotUser.showResetCodeField || forgotUser.hasResetCode) {
        return (forgotUser.code ? true : false);
      }
      else {
        return true;
      }
    },
    errMsg: "יש להזין קוד אימות",
    fieldId: "forgot-code-micro",
    inputId: "forgot-code"
  },
  {
    isFieldValid(forgotUser: ForgotUser) {
      // In case the code field is shown.
      if (forgotUser.showResetCodeField || forgotUser.hasResetCode) {
        return (forgotUser.newPassword ? true : false);
      }
      else {
        return true;
      }
    },
    errMsg: "יש להזין סיסמא חדשה",
    fieldId: "forgot-newPassword-micro",
    inputId: "forgot-newPassword"
  }
];

// Check if object is in array.
function IsInArray(array: any[], value: any): boolean {
  // Running on all the array.
  for (var i = 0; i < array.length; i++) {
    // In case the value is in the array.
    if (array[i] === value) {
      return true;
    }
  }

  return false;
}