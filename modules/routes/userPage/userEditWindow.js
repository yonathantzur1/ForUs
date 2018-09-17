const userEditWindowBL = require('../../BL/userPage/userEditWindowBL');
const validate = require('../../security/validate');
const bruteForceProtector = require('../../security/bruteForceProtector');

var prefix = "/api/userEditWindow";

module.exports = function (app) {

    app.put(prefix + '/updateUserInfo',
        validate,
        (req, res, next) => {
            bruteForceProtector.setFailReturnObj({ "lock": null }, "lock");
            next();
        },
        bruteForceProtector.globalBruteforce.prevent,
        bruteForceProtector.userBruteforce.getMiddleware({
            key: (req, res, next) => {
                next(req.user.email + prefix);
            }
        }),
        (req, res) => {
            var updateFields = req.body.updateFields;
            updateFields._id = req.user._id;

            userEditWindowBL.UpdateUserInfo(updateFields).then(result => {
                if (result == true) {
                    req.brute.reset(() => {
                        res.send(result);
                    });
                }
                else {
                    res.send(result);
                }

            }).catch(err => {
                res.status(500).end();
            });
        });
}