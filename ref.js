const fs = require("fs");
const config = require("./config.json");
const UserAgentManager = require("./utils/userAgentManager");
const { registerWallet } = require("./utils/walletManager");
const { colors, logWithColor } = require("./utils/logger");
const { getProxyAgent } = require("./utils/proxyManager");

const userAgentManager = new UserAgentManager();

const wallets = JSON.parse(fs.readFileSync("./wallets.json", "utf8"));
const proxies = fs
    .readFileSync("./proxy.txt", "utf8")
    .split("\n")
    .filter((proxy) => proxy.trim() !== "");

async function main() {
    logWithColor("SYSTEM", `Starting Meganet bot for ${wallets.length} wallets...`, "info");
    logWithColor("SYSTEM", `Use proxy: ${config.useProxy ? "Yes" : "No"}`, "info");

    const getRandomDelay = () => Math.floor(Math.random() * 5000) + 2000;
    const batchSize = 100;

    for (let i = 0; i < wallets.length; i += batchSize) {
        const batch = wallets.slice(i, i + batchSize);
        logWithColor("SYSTEM", `Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} wallets)`, "info");

        for (const wallet of batch) {
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
                    isRegistrationNeeded: true,
                };

                await registerWallet(wallet, proxy, options);
            }, getRandomDelay());
        }

        await new Promise((resolve) => setTimeout(resolve, 0.5 * 60 * 1000));
        logWithColor("SYSTEM", `Waiting 30 seconds before next batch...`, "info");
    }
}

main().catch((error) => {
    console.error(`${colors.red}FATAL ERROR:${colors.reset} ${error.message}`);
});
