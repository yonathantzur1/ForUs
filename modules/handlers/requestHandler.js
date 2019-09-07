module.exports = {
    GetIpFromRequest(request) {
        let ip = request.ip;

        return GetIpFromRequestString(ip);
    },

    GetUserAgentFromRequest(request) {
        return request.headers["user-agent"];
    },

    GetIpFromSocket(socket) {
        let ip = socket.handshake.address;

        return GetIpFromRequestString(ip);
    },

    GetUserAgentFromSocket(socket) {
        return socket.request.headers["user-agent"];
    }
}

function GetIpFromRequestString(ip) {
    if (ip) {
        let realIpStringPartStartIndex = ip.lastIndexOf(":") + 1;

        return ip.substring(realIpStringPartStartIndex);
    }
    else {
        return null;
    }
}