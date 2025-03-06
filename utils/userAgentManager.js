const fs = require("fs");

class UserAgentManager {
    constructor(
        walletsFile = "wallets.json",
        userAgentsFile = "user_agents.json",
        userAgentsListFile = "./utils/user_agents_list.txt"
    ) {
        this.walletsFile = walletsFile;
        this.userAgentsFile = userAgentsFile;
        this.userAgentsListFile = userAgentsListFile;
    }

    readFileLines(filePath) {
        try {
            return fs
                .readFileSync(filePath, "utf-8")
                .split("\n")
                .filter((line) => line.trim() !== "");
        } catch (error) {
            console.error(`File reading error ${filePath}: ${error.message}`);
            return [];
        }
    }

    readWallets(filePath) {
        try {
            const data = fs.readFileSync(filePath, "utf-8");
            const wallets = JSON.parse(data);
            return wallets;
        } catch (error) {
            console.error(`Error reading wallets file ${filePath}: ${error.message}`);
            return [];
        }
    }

    generateUserAgent(availableUserAgents) {
        if (availableUserAgents.length === 0) {
            return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
        }

        const randomIndex = Math.floor(Math.random() * availableUserAgents.length);
        return availableUserAgents[randomIndex].trim();
    }

    initializeUserAgents() {
        const wallets = this.readWallets(this.walletsFile);
        const availableUserAgents = this.readFileLines(this.userAgentsListFile);

        let userAgents = {};
        if (fs.existsSync(this.userAgentsFile)) {
            try {
                userAgents = JSON.parse(fs.readFileSync(this.userAgentsFile, "utf-8"));
            } catch (error) {
                console.warn("Error reading existing user_agents.json, creating a new one");
            }
        }

        wallets.forEach((wallet) => {
            if (!userAgents[wallet.address]) {
                userAgents[wallet.address] = this.generateUserAgent(availableUserAgents);
            }
        });

        fs.writeFileSync(this.userAgentsFile, JSON.stringify(userAgents, null, 2), "utf-8");

        return userAgents;
    }

    getUserAgent(walletAddress) {
        const userAgents = this.initializeUserAgents();
        return userAgents[walletAddress] || null;
    }
}

module.exports = UserAgentManager;
