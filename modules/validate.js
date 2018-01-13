var joi = require('joi');

module.exports = function (req, res, next) {
    var schemaPath = req.originalUrl.split('/');
    schemaPath[0] = req.method;

    var data = (schemaPath[0] == "POST" || schemaPath[0] == "PUT") ? req.body : req.query;
    var schema;

    try {
        schema = validateSchemaObj[schemaPath[0]][schemaPath[1]][schemaPath[2]];
    }
    catch (err) {
        console.error("No validation scheme at: " + schemaPath[0] + "-" + schemaPath[1] + "-" + schemaPath[2]);
    }

    if (schema) {
        var result = joi.validate(data, schema);

        // In case there is no validation error.
        if (result && !result.error) {
            next();
        }
        else {
            res.send(null);
        }
    }
    else {
        res.send(null);
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
                firstName: joi.string().regex(/^[א-ת']{2,}([ ]+[א-ת']{2,})*([-]+[א-ת']{2,})*$/i),
                lastName: joi.string().regex(/^[א-ת']{2,}([ ]+[א-ת']{2,})*([-]+[א-ת']{2,})*$/i),
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
        }
    }
}