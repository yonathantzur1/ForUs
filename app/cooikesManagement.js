function setCookie(cname, cvalue, exHours) {
    var d = new Date();
    d.setTime(d.getTime() + (exHours * 60 * 60 * 1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function setToken(token) {
    setCookie("tk", token, 48);
}

function deleteToken() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}