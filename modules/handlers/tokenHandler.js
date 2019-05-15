const jwt = require('jsonwebtoken');
const config = require('../../config');
const encryption = require('../security/encryption');

let self = module.exports = {
    GetTokenFromUserObject(user) {
        let tokenUserObject = {
            "_id": user._id,
            "uid": user.uid,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "profile": user.profile,
            "friends": user.friends,
            "permissions": user.permissions
        }

        let tokenObject = { "user": tokenUserObject };
        let token = encryption.encrypt(jwt.sign(tokenObject,
            config.security.jwt.secret,
            config.security.jwt.options));

        return token;
    },

    DecodeToken(token) {
        try {
            return jwt.verify(encryption.decrypt(token), config.security.jwt.secret);
        }
        catch (err) {
            return null;
        }
    },

    DecodeTokenFromRequest(request) {
        let token = this.GetTokenFromRequest(request);
        return this.DecodeToken(token);
    },

    DecodeTokenFromSocket(socket) {
        let token = this.GetTokenFromSocket(socket);
        return this.DecodeToken(token);
    },

    SetTokenOnCookie(token, res, isPreventUidCookie) {
        res.cookie(config.security.token.cookieName,
            token,
            { maxAge: config.security.token.maxAge, httpOnly: true });

        token = this.DecodeToken(token);

        if (token.user && !isPreventUidCookie) {
            res.cookie(config.security.token.uidCookieName,
                token.user.uid,
                { maxAge: config.security.token.maxAge, httpOnly: false });
        }
    },

    DeleteTokenFromCookie(res) {
        res.clearCookie(config.security.token.cookieName);
    },

    DeleteUidFromCookie(res) {
        res.clearCookie(config.security.token.uidCookieName);
    },

    DeleteAuthCookies(res) {
        this.DeleteTokenFromCookie(res);
        this.DeleteUidFromCookie(res);
    },

    GetTokenFromCookie(cookie) {
        return GetCookieByName(config.security.token.cookieName, cookie);
    },

    GetTokenFromSocket(socket) {
        return GetCookieByName(config.security.token.cookieName, socket.request.headers.cookie);
    },

    GetTokenFromRequest(request) {
        return GetCookieByName(config.security.token.cookieName, request.headers.cookie);
    },

    GetUidFromRequest(request) {
        return GetCookieByName(config.security.token.uidCookieName, request.headers.cookie);
    },

    ValidateUserAuthCookies(request) {
        let token = self.DecodeTokenFromRequest(request);
        let cookieUid = self.GetUidFromRequest(request);

        // Return if the user is login and authorized.
        if (token && token.user.uid == cookieUid) {
            request.user = token.user;
            return true;
        }
        else {
            return false;
        }
    }
}

function GetCookieByName(cname, cookie) {
    if (!cookie) {
        return '';
    }

    let name = cname + "=";
    let ca = cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return '';
}