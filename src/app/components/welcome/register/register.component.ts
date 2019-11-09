import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SnackbarService } from '../../../services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { RegisterService } from '../../../services/welcome/register.service';
import { GlobalService } from '../../../services/global/global.service';

import { UserRegexp } from '../../../regex/regexpEnums';

declare let $: any;

export class NewUser {
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';
}

@Component({
    selector: 'register',
    templateUrl: './register.html',
    providers: [RegisterService],
    styleUrls: ['./register.css', '../welcome.css']
})

export class RegisterComponent implements OnInit {
    newUser: NewUser = new NewUser();
    isLoading: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        public registerService: RegisterService,
        private globalService: GlobalService) {
        this.validationFuncs = [
            {
                isFieldValid(newUser: NewUser) {
                    return !!newUser.firstName;
                },
                errMsg: "יש להזין שם פרטי",
                fieldId: "register-firstName-micro",
                inputId: "register-firstName"
            },
            {
                isFieldValid(newUser: NewUser, userRegexp: any) {
                    let namePattern = userRegexp.name;
                    return (namePattern.test(newUser.firstName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "register-firstName-micro",
                inputId: "register-firstName"
            },
            {
                isFieldValid(newUser: NewUser) {
                    return !!newUser.lastName;
                },
                errMsg: "יש להזין שם משפחה",
                fieldId: "register-lastName-micro",
                inputId: "register-lastName"
            },
            {
                isFieldValid(newUser: NewUser, userRegexp: any) {
                    let namePattern = userRegexp.name;
                    return (namePattern.test(newUser.lastName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "register-lastName-micro",
                inputId: "register-lastName"
            },
            {
                isFieldValid(newUser: NewUser) {
                    return !!newUser.email;
                },
                errMsg: "יש להזין כתובת אימייל",
                fieldId: "register-email-micro",
                inputId: "register-email"
            },
            {
                isFieldValid(newUser: NewUser, userRegexp: any) {
                    let emailPattern = userRegexp.email;

                    return (emailPattern.test(newUser.email));
                },
                errMsg: "כתובת אימייל לא תקינה",
                fieldId: "register-email-micro",
                inputId: "register-email"
            },
            {
                isFieldValid(newUser: NewUser) {
                    return !!newUser.password;
                },
                errMsg: "יש להזין סיסמא",
                fieldId: "register-password-micro",
                inputId: "register-password"
            }
        ];
    }

    ngOnInit() {
        this.newUser.email = this.globalService.getData("registerEmail") || "";
    }

    // Regiter the new user to the DB.
    register() {
        this.newUser.firstName = this.newUser.firstName.trim();
        this.newUser.lastName = this.newUser.lastName.trim();
        this.newUser.email = this.newUser.email.trim();

        // In case the register modal fields are valid.
        if (this.microtextService.validation(this.validationFuncs, this.newUser, UserRegexp)) {
            this.isLoading = true;

            this.registerService.register(this.newUser).then((data: any) => {
                let result = data ? data.result : null;
                this.isLoading = false;

                // In case of server error.
                if (result == null) {
                    this.snackbarService.snackbar("אירעה שגיאה בחיבור לשרת");
                }
                // In case the email is already exists.
                else if (result == false) {
                    // Show microtext of the email field. 
                    $("#register-email-micro").html("אימייל זה נמצא בשימוש");
                }
                else {
                    this.router.navigateByUrl('');
                }
            });
        }
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    registerEnter() {
        $(".user-input").blur();
        this.register();
    }
}