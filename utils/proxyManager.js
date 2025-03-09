const { HttpsProxyAgent } = require("https-proxy-agent");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { logWithColor } = require("./logger");

function getProxyAgent(proxyString, walletId) {
    if (!proxyString) return null;

    try {
        if (proxyString.startsWith("http")) {
            logWithColor(walletId, `Using HTTP(S) proxy: ${proxyString}`, "info");
            return new HttpsProxyAgent(proxyString);
        } else if (proxyString.startsWith("socks")) {
            logWithColor(walletId, `Using SOCKS proxy: ${proxyString}`, "info");
            return new SocksProxyAgent(proxyString);
        } else {
            logWithColor(walletId, `Using HTTP(S) proxy: http://${proxyString}`, "info");
            return new HttpsProxyAgent("http://" + proxyString);
        }
    } catch (error) {
        logWithColor(walletId, `Error creating proxy agent: ${error.message}`, "error");
    }

    return null;
}

module.exports = { getProxyAgent };
