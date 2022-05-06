"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
var crypto_1 = require("crypto");
var queryEncode = function (string) {
    var replacements = {
        '+': '-',
        '=': '_',
        '/': '~',
    };
    return string.replace(/[+=/]/g, function (match) {
        return replacements[match];
    });
};
var determineScheme = function (url) {
    var parts = url.split('://');
    if (parts.length < 2) {
        throw new Error('Invalid URL.');
    }
    return parts[0].replace('*', '');
};
var getRtmpUrl = function (rtmpUrl) {
    var parsed = new URL(rtmpUrl);
    return parsed.pathname.replace(/^\//, '') + parsed.search + parsed.hash;
};
var getResource = function (url) {
    switch (determineScheme(url)) {
        case 'http':
        case 'https':
            return url;
        case 'rtmp':
            return getRtmpUrl(url);
        default:
            throw new Error('Invalid URI scheme. Scheme must be one of' + ' http, https, or rtmp');
    }
};
var signPolicy = function (policy, privateKey) {
    var sign = crypto_1.createSign('RSA-SHA1');
    sign.write(policy);
    return queryEncode(sign.sign(privateKey, 'base64'));
};
var signWithCannedPolicy = function (url, expires, keyPairId, privateKey) {
    var policy = JSON.stringify({
        Statement: [
            {
                Resource: url,
                Condition: { DateLessThan: { 'AWS:EpochTime': expires } },
            },
        ],
    });
    return {
        Expires: expires,
        'Key-Pair-Id': keyPairId,
        Signature: signPolicy(policy.toString(), privateKey),
    };
};
var signWithCustomPolicy = function (policy, keyPairId, privateKey) {
    var modifiedPolicy = policy.replace(/\s/gm, '');
    return {
        Policy: queryEncode(Buffer.from(modifiedPolicy).toString('base64')),
        'Key-Pair-Id': keyPairId,
        Signature: signPolicy(policy, privateKey),
    };
};
var Signer = /** @class */ (function () {
    function Signer(keyPairId, privateKey) {
        if (keyPairId === void 0 || privateKey === void 0) {
            throw new Error('A key pair ID and private key are required');
        }
        this.keyPairId = keyPairId;
        this.privateKey = privateKey;
    }
    Signer.prototype.getSignedCookie = function (options) {
        var signatureHash = options.policy
            ? signWithCustomPolicy(options.policy, this.keyPairId, this.privateKey)
            : options.url
                ? signWithCannedPolicy(options.url, options.expires, this.keyPairId, this.privateKey)
                : {};
        var cookieHash = {};
        for (var key in signatureHash) {
            if (Object.prototype.hasOwnProperty.call(signatureHash, key)) {
                cookieHash['CloudFront-' + key] = signatureHash[key];
            }
        }
        return cookieHash;
    };
    Signer.prototype.getSignedUrl = function (options) {
        var resource = getResource(options.url);
        var parsedUrl = new URL(options.url);
        var signatureHash = options.policy
            ? signWithCustomPolicy(options.policy, this.keyPairId, this.privateKey)
            : options.expires
                ? signWithCannedPolicy(resource, options.expires, this.keyPairId, this.privateKey)
                : {};
        parsedUrl.search = '';
        var searchParams = parsedUrl.searchParams;
        for (var key in signatureHash) {
            if (Object.prototype.hasOwnProperty.call(signatureHash, key)) {
                searchParams.set(key, signatureHash[key]);
            }
        }
        var signedUrl = determineScheme(options.url) === 'rtmp'
            ? getRtmpUrl(parsedUrl.toString())
            : parsedUrl.toString();
        return signedUrl;
    };
    return Signer;
}());
exports.Signer = Signer;