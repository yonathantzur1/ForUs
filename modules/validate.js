const joi = require('joi');
const regexp = require('../app/regex/regexpEnums');

module.exports = function (req, res, next) {
    try {
        var fullRequestPath = req.originalUrl;
        var reqMethod = req.method;
        var data;

        if (reqMethod == "POST" || reqMethod == "PUT") {
            data = req.body;
        }
        else if (reqMethod == "GET" || reqMethod == "DELETE") {
            data = req.query;

            // Searching for ? of query parameters.
            var startParametersIndex = fullRequestPath.indexOf('?');

            if (startParametersIndex != -1) {
                fullRequestPath = fullRequestPath.substring(0, startParametersIndex);
            }
        }

        var schemaPath = fullRequestPath.split('/');
        schemaPath[0] = reqMethod;

        var schema = validateSchemaObj[reqMethod];

        for (var i = 1; i < schemaPath.length; i++) {
            schema = schema[schemaPath[i]];

            if (schema == null) {
                throw ("No validation scheme at: " + BuildSchemaPathString(schemaPath));
            }
        }

        var result = joi.validate(data, schema);

        if (!result) {
            throw ("Validate result is null");
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
        var schema = schemaPath[0];

        for (var i = 1; i < schemaPath.length; i++) {
            schema += "->" + schemaPath[i]
        }

        return schema;
    }
    else {
        return "";
    }
}

var validateSchemaObj = {
    "GET": {
        "forgotPassword": {
            "validateResetPasswordToken": {
                token: joi.string().regex(new RegExp(regexp.PasswordRegexp.hash, "i"))
            }
        }
    },
    "POST": {
        "login": {
            "userLogin": {
                email: joi.string().email(),
                password: joi.string().required()
            },
            "register": {
                firstName: joi.string().regex(new RegExp(regexp.UserRegexp.name, "i")),
                lastName: joi.string().regex(new RegExp(regexp.UserRegexp.name, "i")),
                email: joi.string().email(),
                password: joi.string().required()
            }
        }
    },
    "PUT": {
        "forgotPassword": {
            "forgot": {
                email: joi.string().email()
            },
            "resetPassword": {
                email: joi.string().email(),
                code: joi.string().required(),
                newPassword: joi.string().required()
            },
            "resetPasswordByToken": {
                token: joi.string().regex(new RegExp(regexp.PasswordRegexp.hash, "i")),
                newPassword: joi.string().required()
            }
        },
        "api": {
            "userEditWindow": {
                "updateUserInfo": {
                    updateFields: joi.object().keys({
                        firstName: joi.string().regex(new RegExp(regexp.UserRegexp.name, "i")).optional(),
                        lastName: joi.string().regex(new RegExp(regexp.UserRegexp.name, "i")).optional(),
                        email: joi.string().email().optional()
                    })
                }
            }
        }
    }
}