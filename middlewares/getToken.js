module.exports = function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        };
    } else if (headers && headers.Authorization) {
        var parted = headers.Authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        };
    } else {
        return null;
    };
}