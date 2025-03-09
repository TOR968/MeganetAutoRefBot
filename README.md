# MeganetAutoRefBot

https://meganet.app/login?refcode=591OHJ

An automated bot for Meganet wallet registration and point farming with proxy and user-agent rotation support.

| ✅  | Feature                                          |
| --- | ------------------------------------------------ |
| ✅  | Automatic wallet registration with referral code |
| ✅  | Periodic ping operations to farm points          |
| ✅  | Proxy support for multiple wallets               |
| ✅  | User-agent rotation for each wallet              |
| ✅  | Interactive Solana wallet generator              |
| ✅  | Batch processing (100 wallets per batch)         |

## For suggestions or to report a bug, please contact [telegram](https://t.me/tor_dev)

## [Support the development 💙](https://support-me-ruby.vercel.app/)

## Requirements

-   Node.js (v14 or higher)
-   NPM (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/TOR968/MeganetAutoRefBot.git
cd MeganetAutoRefBot
```

2. Install dependencies:

```bash
npm install
```

3. Configure your wallets and proxies:
    - Add your wallet addresses to `wallets.json`
    - Add your proxies to `proxy.txt` (one proxy per line)
    - Configure settings in `config.json`

## Wallet Generator

The bot includes an interactive Solana wallet generator to help you create new wallets for Meganet:

1. Run the wallet generator:

```bash
node generateWallets.js
```

2. When prompted, enter the number of wallets you want to generate.

3. The script will:
    - Generate the specified number of Solana wallets
    - Automatically assign IDs to each wallet
    - Append new wallets to existing ones in `wallets.json` (if any)
    - Display the public address of each generated wallet

### wallets.json

Create a file named `wallets.json` with your wallet information:

```json
[
    {
        "id": 1,
        "address": "YOUR_WALLET_ADDRESS_1",
        "privateKey": "YOUR_PRIVATE_KEY_1"
    },
    {
        "id": 2,
        "address": "YOUR_WALLET_ADDRESS_2",
        "privateKey": "YOUR_PRIVATE_KEY_2"
    }
]
```

## Configuration

### proxy.txt

Create a file named `proxy.txt` with your proxies (one per line):

```
http://username:password@host:port
socks5://username:password@host:port
```

### config.json

Create a file named `config.json` with your settings:

```json
{
    "refCode": "YOUR_REFERRAL_CODE",
    "pingInterval": 15000,
    "useProxy": true
}
```

-   `refCode`: Your Meganet referral code
-   `pingInterval`: Time between pings in milliseconds (default: 15000)
-   `useProxy`: Set to `true` to use proxies, `false` to use direct connection

## Usage

Start the bot:

- start auto ref

```bash
node ref.js
```

- start to farm points

```bash
node index.js
```

## Disclaimer

This bot is for educational purposes only. Use at your own risk. The developers are not responsible for any consequences of using this bot.

## License

MIT
