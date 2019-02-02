const deleteUserBL = require('../BL/deleteUserBL');
const tokenHandler = require('../handlers/tokenHandler');
const validate = require('../security/validate');
const events = require('../events');

var prefix = "/deleteUser";

module.exports = (app) => {
    // Validating the delete user request unique token.
    app.get(prefix + '/validateDeleteUserToken',
        validate,
        (req, res) => {
            tokenHandler.DeleteAuthCookies(res);
            deleteUserBL.ValidateDeleteUserToken(req.query.token).then(result => {
                res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
            }).catch(err => {
                res.status(500).end();
            });
        });

    // Remove user account by token and password.
    app.put(prefix + '/deleteAccount',
        validate,
        (req, res) => {
            deleteUserBL.IsAllowToDeleteAccount(req.body).then(user => {
                // In case the password is wrong.
                if (user == false) {
                    res.send(false);
                    return;
                }

                // Change user id from ObjectId to string.
                user._id = user._id.toString();

                // Remove the user from DB.
                deleteUserBL.DeleteUserFromDB(user._id).then((userFriendsIds) => {
                    // In case of error.
                    if (!userFriendsIds) {
                        res.send(null);
                        return
                    }

                    // In case the user has friends.
                    if (userFriendsIds.length > 0) {
                        var userName = user.firstName + " " + user.lastName;
                        events.emit('socket.RemoveFriendUser', user._id, userName, userFriendsIds);
                    }

                    res.send(true);
                }).catch((err) => {
                    res.status(500).end();
                });
            }).catch((err) => {
                res.status(500).end();
            });;
        });
};