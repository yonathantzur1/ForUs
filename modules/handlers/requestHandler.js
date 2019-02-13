module.exports = {
    GetIpFromRequest(request) {
        let ip = request.ip;

        return CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromRequest(request) {
        return request.headers["user-agent"];
    },

    GetIpFromSocket(socket) {
        let ip = socket.handshake.address;

        return CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromSocket(socket) {
        return socket.request.headers["user-agent"];
    }
}

function CutIpAddressStringPrefix(ip) {
    if (ip) {
        let realIpStringPartStartIndex = ip.lastIndexOf(":") + 1;
        return ip.substring(realIpStringPartStartIndex);
    }
    else {
        return null;
    }
}