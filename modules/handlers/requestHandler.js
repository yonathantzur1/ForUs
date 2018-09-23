module.exports = {
    GetIpFromRequest(request) {
        var ip = request.ip;

        return CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromRequest(request) {
        return request.headers["user-agent"];
    },

    GetIpFromSocket(socket) {
        var ip = socket.handshake.address;

        return CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromSocket(socket) {
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