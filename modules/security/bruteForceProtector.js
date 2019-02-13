const config = require('../../config');
const ExpressBrute = require('express-brute');
const store = new ExpressBrute.MemoryStore();

let failReturnObj = null;
let failReturnObjPath = null;

let failCallback = (req, res, next, nextValidRequestDate) => {
    // Calculate lock time in minutes.
    let minutesLockTime =
        Math.ceil((nextValidRequestDate.getTime() - (new Date()).getTime()) / (1000 * 60));

    res.send(putValueInJsonByStringPath(failReturnObj, failReturnObjPath, minutesLockTime));
};

let handleStoreError = (error) => {
    log.error(error);

    throw {
        message: error.message,
        parent: error.parent
    };
}

// Sending json and path in json (keys separated by . sign)
// and put the value on that path.
function putValueInJsonByStringPath(obj, path, value) {
    eval("obj." + path + "=" + value);
    return obj;
}

module.exports = {
    // Start slowing requests after few attempts.
    userBruteforce: new ExpressBrute(store, {
        freeRetries: config.security.expressBrute.freeRetries - 1,
        minWait: config.security.expressBrute.minWait,
        maxWait: config.security.expressBrute.maxWait,
        failCallback: failCallback,
        handleStoreError: handleStoreError
    }),

    // No more than 1000 login attempts per day per IP.
    globalBruteforce: new ExpressBrute(store, {
        freeRetries: 1000,
        attachResetToRequest: false,
        refreshTimeoutOnRequest: false,
        minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time) 
        maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time) 
        lifetime: 24 * 60 * 60, // 1 day (seconds) 
        failCallback: failCallback,
        handleStoreError: handleStoreError
    }),

    setFailReturnObj(obj, path) {
        failReturnObj = obj;
        failReturnObjPath = path;
    }
}