function setCookie(cname, cvalue, exHours) {
    var d = new Date();
    d.setTime(d.getTime() + (exHours * 60 * 60 * 1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function setToken(token) {
    setCookie("token", token, 24);
}