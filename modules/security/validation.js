const joi = require('@hapi/joi');
const regexp = require('../enums').REGEXP;
const REST = require('../enums').REST
const logger = require('../../logger');

module.exports = (req, res, next) => {
    try {
        let fullRequestPath = req.originalUrl;
        let reqMethod = req.method;
        let data;

        if (reqMethod == REST.POST || reqMethod == REST.PUT) {
            data = req.body;
        }
        else if (reqMethod == REST.GET || reqMethod == REST.DELETE) {
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
                throw ("No validation scheme at: " + buildSchemaPathString(schemaPath));
            }
        }

        let result = joi.object(schema).validate(data);

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
        logger.error(err);
        res.sendStatus(400);
    }
};

function buildSchemaPathString(schemaPath) {
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

let validateSchemaObj = {};

//#region get
validateSchemaObj[REST.GET] = {
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
};
//#endregion

//#region post
validateSchemaObj[REST.POST] = {
    "api": {
        "login": {
            "userLogin": {
                email: joi.string().email(),
                password: joi.string().required()
            }
        },
        "register": {
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
};
//#endregion

//#region put
validateSchemaObj[REST.PUT] = {
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
};
//#endregion

//#region delete
validateSchemaObj[REST.DELETE] = {

};
//#endregion