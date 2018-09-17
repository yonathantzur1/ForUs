module.exports = {
    GetIpFromRequest: function (request) {
        var ip = request.ip;

        return CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromRequest: function (request) {
        return request.headers["user-agent"];
    },

    GetIpFromSocket: function (socket) {
        var ip = socket.handshake.address;

        return CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromSocket: function (socket) {
        return socket.request.headers["user-agent"];
    }
}

function CutIpAddressStringPrefix(ip) {
    if (ip) {
        var realIpStringPartStartIndex = ip.lastIndexOf(":") + 1;
        return ip.substring(realIpStringPartStartIndex);
    }
    else {
        return null;
    }
}