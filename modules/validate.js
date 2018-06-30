const joi = require('joi');

module.exports = function (req, res, next) {
    try {
        var schemaPath = req.originalUrl.split('/');
        schemaPath[0] = req.method;

        var data = (schemaPath[0] == "POST" || schemaPath[0] == "PUT") ? req.body : req.query;
        var schema = validateSchemaObj[schemaPath[0]];

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
            next()
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
    "POST": {
        "login": {
            "userLogin": {
                email: joi.string().email(),
                password: joi.string().required()
            },
            "register": {
                firstName: joi.string().regex(/^[א-ת]{2,}([ ]+[א-ת]{2,})*([-]+[א-ת]{2,})*$/i),
                lastName: joi.string().regex(/^[א-ת]{2,}([ ]+[א-ת]{2,})*([-]+[א-ת]{2,})*$/i),
                email: joi.string().email(),
                password: joi.string().required()
            }
        }
    },
    "PUT": {
        "login": {
            "forgot": {
                email: joi.string().email()
            },
            "resetPassword": {
                email: joi.string().email(),
                code: joi.string().required(),
                newPassword: joi.string().required()
            }
        },
        "api": {
            "userEditWindow": {
                "updateUserInfo": {
                    updateFields: joi.object().keys({
                        firstName: joi.string().regex(/^[א-ת]{2,}([ ]+[א-ת]{2,})*([-]+[א-ת]{2,})*$/i).optional(),
                        lastName: joi.string().regex(/^[א-ת]{2,}([ ]+[א-ת]{2,})*([-]+[א-ת]{2,})*$/i).optional(),
                        email: joi.string().email().optional()
                    })
                }
            }
        }
    }
}