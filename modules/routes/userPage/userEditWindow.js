const userEditWindowBL = require('../../BL/userPage/userEditWindowBL');
const validate = require('../../security/validate');
const bruteForceProtector = require('../../security/bruteForceProtector');
const logger = require('../../../logger');

let prefix = "/api/userEditWindow";

module.exports = function (app) {

    app.put(prefix + '/updateUserInfo',
        validate,
        (req, res, next) => {
            // In case one of the updated fields is email.
            if (req.body.updateFields.email) {
                req.body.updateFields.email = req.body.updateFields.email.toLowerCase();
            }

            next();
        },
        (req, res, next) => {
            bruteForceProtector.setFailReturnObj({ "result": { "lock": null } }, "result.lock");
            next();
        },
        bruteForceProtector.globalBruteforce.prevent,
        bruteForceProtector.userBruteforce.getMiddleware({
            key: (req, res, next) => {
                next(req.user.email + prefix);
            }
        }),
        (req, res) => {
            let updateFields = req.body.updateFields;
            updateFields._id = req.user._id;

            userEditWindowBL.UpdateUserInfo(updateFields).then(result => {
                if (result == true) {
                    req.brute.reset(() => {
                        res.send({ result });
                    });
                }
                else {
                    res.send({ result });
                }

            }).catch(err => {
                logger.error(err);
                res.sendStatus(500);
            });
        });
}