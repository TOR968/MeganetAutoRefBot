const axios = require("axios");
const https = require("https");

async function walletOperation(wallet, proxy, options = {}) {
    const { getProxyAgent, logWithColor, userAgent, refCode, isRegistrationNeeded } = options;
    const walletId = wallet.id;

    try {
        const operationType = isRegistrationNeeded ? "registration" : "info";
        logWithColor(
            walletId,
            `Starting ${operationType} process...`,
            operationType === "registration" ? "registration" : "info"
        );
        logWithColor(walletId, `Using User-Agent: ${userAgent.substring(0, 50)}...`, "info");

        const url = isRegistrationNeeded
            ? `https://api.meganet.app/wallets?address=${wallet.address}&refcode=${refCode}`
            : `https://api.meganet.app/wallets?address=${wallet.address}`;

        const config = {
            method: "get",
            url,
            headers: {
                "User-Agent": userAgent,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            timeout: 30000,
        };

        if (proxy) {
            const httpsAgent = getProxyAgent(proxy, walletId);
            if (httpsAgent) {
                config.httpsAgent = httpsAgent;
                config.httpAgent = false;
                config.protocol = "https:";
            }
        } else {
            config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
        }

        logWithColor(walletId, `Sending request to: ${url}`, "info");

        const response = await axios(config);

        if (response.status === 200) {
            if (!response.data || !response.data.point || !response.data.point._id) {
                logWithColor(walletId, `Invalid response format: ${JSON.stringify(response.data)}`, "error");
                return { success: false };
            }

            const successMessage = isRegistrationNeeded
                ? `Registration successful! Point ID: ${response.data.point._id}`
                : `Wallet info retrieved successfully! Point ID: ${response.data.point._id}`;

            logWithColor(walletId, successMessage, "success");
            return {
                success: true,
                pointId: response.data.point._id,
                walletId: response.data._id,
                data: response.data,
            };
        } else {
            const errorMessage = isRegistrationNeeded
                ? `Registration failed: ${response.status}`
                : `Failed to get wallet info: ${response.status}`;

            logWithColor(walletId, errorMessage, "error");
            return { success: false };
        }
    } catch (error) {
        const errorType = isRegistrationNeeded ? "Registration" : "Wallet info";

        if (error.response) {
            logWithColor(walletId, `${errorType} error: ${error.message}`, "error");
            logWithColor(walletId, `Response status: ${error.response.status}`, "error");
            logWithColor(walletId, `Response data: ${JSON.stringify(error.response.data)}`, "error");
        } else if (error.request) {
            logWithColor(walletId, `${errorType} error: No response received`, "error");
        } else {
            logWithColor(walletId, `${errorType} error: ${error.message}`, "error");
        }

        return { success: false };
    }
}

async function registerWallet(wallet, proxy, options) {
    return walletOperation(wallet, proxy, { ...options, isRegistrationNeeded: true });
}

async function getWalletInfo(wallet, proxy, options) {
    return walletOperation(wallet, proxy, { ...options, isRegistrationNeeded: false });
}

module.exports = {
    registerWallet,
    getWalletInfo,
};
