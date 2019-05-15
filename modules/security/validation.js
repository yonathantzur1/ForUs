const joi = require('@hapi/joi');
const regexp = require('../enums').REGEXP;

module.exports = function (req, res, next) {
    try {
        let fullRequestPath = req.originalUrl;
        let reqMethod = req.method;
        let data;

        if (reqMethod == "POST" || reqMethod == "PUT") {
            data = req.body;
        }
        else if (reqMethod == "GET" || reqMethod == "DELETE") {
            data = req.query;

            // Searching for ? of query parameters.
            let startParametersIndex = fullRequestPath.indexOf('?');

            if (startParametersIndex != -1) {
                fullRequestPath = fullRequestPath.substring(0, startParametersIndex);
            }
        }

        let schemaPath = fullRequestPath.split('/');
        schemaPath[0] = reqMethod;

        let schema = validateSchemaObj[reqMethod];

        for (let i = 1; i < schemaPath.length; i++) {
            schema = schema[schemaPath[i]];

            if (schema == null) {
                throw ("No validation scheme at: " + BuildSchemaPathString(schemaPath));
            }
        }

        let result = joi.validate(data, schema);

        if (!result) {
            throw ("Validate result is " + result);
        }
        else if (result.error) {
            throw (result.error.message);
        }
        else {
            next();
        }
    }
    catch (err) {
        console.error(err);
        res.status(400).end();
    }
}

function BuildSchemaPathString(schemaPath) {
    if (schemaPath.length > 0) {
        let schema = schemaPath[0];

        for (let i = 1; i < schemaPath.length; i++) {
            schema += "->" + schemaPath[i]
        }

        return schema;
    }
    else {
        return '';
    }
}

let validateSchemaObj = {}

//#region get
validateSchemaObj["GET"] = {
    "api": {
        "forgotPassword": {
            "validateResetPasswordToken": {
                token: joi.string().regex(new RegExp(regexp.PASSWORD.HASH, "i"))
            }
        },
        "deleteUser": {
            "validateDeleteUserToken": {
                token: joi.string().regex(new RegExp(regexp.PASSWORD.HASH, "i"))
            }
        }
    }
}
//#endregion

//#region post
validateSchemaObj["POST"] = {
    "api": {
        "login": {
            "userLogin": {
                email: joi.string().email(),
                password: joi.string().required()
            },
            "register": {
                firstName: joi.string().max(10).regex(new RegExp(regexp.USER.NAME, "i")),
                lastName: joi.string().max(10).regex(new RegExp(regexp.USER.NAME, "i")),
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
}
//#endregion

//#region put
validateSchemaObj["PUT"] = {
    "api": {
        "login": {
            "forgotPasswordRequest": {
                email: joi.string().email()
            },
            "resetPassword": {
                email: joi.string().email(),
                code: joi.string().required(),
                newPassword: joi.string().required()
            },
        },
        "forgotPassword": {
            "resetPasswordByToken": {
                token: joi.string().regex(new RegExp(regexp.PASSWORD.HASH, "i")),
                newPassword: joi.string().required()
            }
        },
        "deleteUser": {
            "deleteAccount": {
                token: joi.string().regex(new RegExp(regexp.PASSWORD.HASH, "i")),
                password: joi.string().required()
            }
        },
        "userEditWindow": {
            "updateUserInfo": {
                updateFields: joi.object().keys({
                    firstName: joi.string().regex(new RegExp(regexp.USER.NAME, "i")).optional(),
                    lastName: joi.string().regex(new RegExp(regexp.USER.NAME, "i")).optional(),
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
}
//#endregion

//#region delete
validateSchemaObj["DELETE"] = {

}
//#endregion