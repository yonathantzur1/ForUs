const joi = require('@hapi/joi');
const REGEXP = require('../../enums').REGEXP;
const REST = require('../../enums').REST

let schemas = {};

//#region get

schemas[REST.GET] = {
    "api": {
        "forgotPassword": {
            "validateResetPasswordToken": {
                token: joi.string().regex(new RegExp(REGEXP.PASSWORD.HASH, "i"))
            }
        },
        "deleteUser": {
            "validateDeleteUserToken": {
                token: joi.string().regex(new RegExp(REGEXP.PASSWORD.HASH, "i"))
            }
        }
    }
};

//#endregion

//#region post

schemas[REST.POST] = {
    "api": {
        "login": {
            "userLogin": {
                email: joi.string().email(),
                password: joi.string().required()
            }
        },
        "register": {
            "register": {
                firstName: joi.string().max(10).regex(new RegExp(REGEXP.USER.NAME, "i")),
                lastName: joi.string().max(10).regex(new RegExp(REGEXP.USER.NAME, "i")),
                email: joi.string().email(),
                password: joi.string().required()
            }
        },
        "userReportWindow": {
            "reportUser": {
                reportedUserId: joi.string().required(),
                reasonId: joi.string().required(),
                reasonDetails: joi.string().max(600).required()
            }
        }
    }
};

//#endregion

//#region put

schemas[REST.PUT] = {
    "api": {
        "forgotPassword": {
            "forgotPasswordRequest": {
                email: joi.string().email()
            },
            "resetPassword": {
                email: joi.string().email(),
                code: joi.string().required(),
                newPassword: joi.string().required()
            },
            "resetPasswordByToken": {
                token: joi.string().regex(new RegExp(REGEXP.PASSWORD.HASH, "i")),
                newPassword: joi.string().required()
            }
        },
        "deleteUser": {
            "deleteAccount": {
                token: joi.string().regex(new RegExp(REGEXP.PASSWORD.HASH, "i")),
                password: joi.string().required()
            }
        },
        "userEditWindow": {
            "updateUserInfo": {
                updateFields: joi.object().keys({
                    firstName: joi.string().regex(new RegExp(REGEXP.USER.NAME, "i")).optional(),
                    lastName: joi.string().regex(new RegExp(REGEXP.USER.NAME, "i")).optional(),
                    email: joi.string().email().optional(),
                    password: joi.string().required()
                })
            }
        },
        "userPasswordWindow": {
            "updateUserPassword": {
                oldPassword: joi.string().required(),
                newPassword: joi.string().required()
            }
        },
        "userPrivacyWindow": {
            "setUserPrivacy": {
                isPrivate: joi.boolean().required()
            }
        }
    }
};

//#endregion

//#region delete

schemas[REST.DELETE] = {

};

//#endregion

module.exports = schemas;