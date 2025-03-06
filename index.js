const fs = require("fs");
const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const https = require("https");
const config = require("./config.json");
const UserAgentManager = require("./utils/userAgentManager");
const { registerWallet, getWalletInfo } = require("./utils/walletManager");
const { colors, logWithColor } = require("./utils/logger");

const userAgentManager = new UserAgentManager();

const wallets = JSON.parse(fs.readFileSync("./wallets.json", "utf8"));
const proxies = fs
    .readFileSync("./proxy.txt", "utf8")
    .split("\n")
    .filter((proxy) => proxy.trim() !== "");

function getProxyAgent(proxyString, walletId) {
    if (!proxyString) return null;

    try {
        if (proxyString.startsWith("http")) {
            logWithColor(walletId, `Using proxy: ${proxyString}`, "info");
            return new HttpsProxyAgent(proxyString);
        } else if (proxyString.startsWith("socks")) {
            logWithColor(walletId, `Using proxy: ${proxyString}`, "info");
            return new SocksProxyAgent(proxyString);
        }
    } catch (error) {
        logWithColor(walletId, `Error creating proxy agent: ${error.message}`, "error");
    }

    return null;
}

async function handlePing(wallet, registrationResult, proxy) {
    const walletId = wallet.id;
    let pingCount = 0;
    const userAgent =
        userAgentManager.getUserAgent(wallet.address) ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

    if (!registrationResult.success) {
        logWithColor(walletId, `Skipping ping operations due to registration failure`, "warning");
        return;
    }

    const { pointId, walletId: meganetWalletId } = registrationResult;
    logWithColor(walletId, `Starting ping operations. Point ID: ${pointId}`, "ping");

    const pingInterval = setInterval(async () => {
        try {
            pingCount++;

            const pingConfig = {
                method: "get",
                url: `https://api.meganet.app/points/point-today/${pointId}`,
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
                    pingConfig.httpsAgent = httpsAgent;
                    pingConfig.httpAgent = false;
                    pingConfig.protocol = "https:";
                }
            } else {
                pingConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
            }

            logWithColor(walletId, `Sending ping request`, "ping");
            const pingResponse = await axios(pingConfig);

            if (pingResponse.status === 200) {
                logWithColor(
                    walletId,
                    `Ping successful! Points today: ${pingResponse.data.pointsFarmToday}`,
                    "ping"
                );

                if (pingCount % 10 === 0) {
                    const uptimeConfig = {
                        method: "patch",
                        url: `https://api.meganet.app/wallets/uptime/${meganetWalletId}`,
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
                            uptimeConfig.httpsAgent = httpsAgent;
                            uptimeConfig.httpAgent = false;
                            uptimeConfig.protocol = "https:";
                        }
                    } else {
                        uptimeConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
                    }

                    logWithColor(walletId, `Sending uptime update request`, "info");
                    const uptimeResponse = await axios(uptimeConfig);

                    if (uptimeResponse.status === 200) {
                        logWithColor(walletId, `Uptime update successful!`, "success");
                    } else {
                        logWithColor(walletId, `Uptime update failed: ${uptimeResponse.status}`, "error");
                    }
                }
            } else {
                logWithColor(walletId, `Ping failed: ${pingResponse.status}`, "error");
            }
        } catch (error) {
            if (error.response) {
                logWithColor(walletId, `Ping error: ${error.message}`, "error");
                logWithColor(walletId, `Response status: ${error.response.status}`, "error");
                logWithColor(walletId, `Response data: ${JSON.stringify(error.response.data)}`, "error");
            } else if (error.request) {
                logWithColor(walletId, `Ping error: No response received`, "error");
            } else {
                logWithColor(walletId, `Ping error: ${error.message}`, "error");
            }
        }
    }, config.pingInterval || 15000);
}

async function main() {
    logWithColor("SYSTEM", `Starting Meganet bot for ${wallets.length} wallets...`, "info");
    logWithColor("SYSTEM", `Use proxy: ${config.useProxy ? "Yes" : "No"}`, "info");
    logWithColor("SYSTEM", `Registration needed: ${config.isRegistrationNeeded ? "Yes" : "No"}`, "info");

    const getRandomDelay = () => Math.floor(Math.random() * 4000) + 1000;

    for (const wallet of wallets) {
        setTimeout(async () => {
            const proxyIndex = wallet.id - 1;
            const proxy = config.useProxy && proxyIndex < proxies.length ? proxies[proxyIndex] : null;

            const userAgent =
                userAgentManager.getUserAgent(wallet.address) ||
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

            const options = {
                getProxyAgent,
                logWithColor,
                userAgent,
                refCode: config.refCode,
                isRegistrationNeeded: config.isRegistrationNeeded,
            };

            let walletResult;
            if (config.isRegistrationNeeded) {
                walletResult = await registerWallet(wallet, proxy, options);
            } else {
                walletResult = await getWalletInfo(wallet, proxy, options);
            }

            handlePing(wallet, walletResult, proxy);
        }, getRandomDelay());
    }
}

main().catch((error) => {
    console.error(`${colors.red}FATAL ERROR:${colors.reset} ${error.message}`);
});
