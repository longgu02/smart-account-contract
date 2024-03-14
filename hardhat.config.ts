require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
// Account private key
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY";

const config: HardhatUserConfig = {
	defaultNetwork: "sepolia",
	networks: {
		sepolia: {
			url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
			accounts: [PRIVATE_KEY],
		},
	},
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000,
			},
		},
	},
};

export default config;
