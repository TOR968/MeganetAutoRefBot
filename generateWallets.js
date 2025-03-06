const { Keypair } = require("@solana/web3.js");
const fs = require("fs");
const readline = require("readline");
const bs58 = require("bs58");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function generateWallets(count) {
    const wallets = [];

    for (let i = 0; i < count; i++) {
        try {
            const keypair = Keypair.generate();
            const address = keypair.publicKey.toString();
            const privateKey = bs58.encode(keypair.secretKey);

            wallets.push({
                id: 0,
                address,
                privateKey,
            });
        } catch (error) {
            console.error(`Error creating a wallet: ${error.message}`);
        }
    }

    return wallets;
}

function saveWallets(wallets) {
    try {
        let existingWallets = [];
        let nextId = 1;

        if (fs.existsSync("wallets.json")) {
            const fileContent = fs.readFileSync("wallets.json", "utf8");
            if (fileContent.trim()) {
                existingWallets = JSON.parse(fileContent);
                if (existingWallets.length > 0) {
                    nextId = Math.max(...existingWallets.map((wallet) => wallet.id)) + 1;
                }
            }
        }

        wallets.forEach((wallet) => {
            wallet.id = nextId++;
        });

        const allWallets = [...existingWallets, ...wallets];

        fs.writeFileSync("wallets.json", JSON.stringify(allWallets, null, 2));

        console.log(`✅ Successfully generated ${wallets.length} of wallets.`);
        console.log(`✅ Total in the wallets.json file: ${allWallets.length} wallets.`);
    } catch (error) {
        console.error(`❌ Error when saving wallets:${error.message}`);
    }
}

function main() {
    rl.question("Enter the number of wallets to generate:", (answer) => {
        const count = parseInt(answer.trim());

        if (isNaN(count) || count <= 0) {
            console.error("❌ Please enter a valid number greater than 0.");
            rl.close();
            return;
        }

        console.log(`⏳ Generating ${count} of Solana wallets...`);

        try {
            const wallets = generateWallets(count);
            saveWallets(wallets);
            console.log("✅ The wallets.json file was successfully saved.");
        } catch (error) {
            console.error(`❌ Error in the generation process: ${error.message}`);
        } finally {
            rl.close();
        }
    });
}

main();
