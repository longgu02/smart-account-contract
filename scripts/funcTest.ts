import { ethers } from "hardhat";
import { fillUserOp } from "../utils/userOp";
import { Network } from "../utils/addresses";

const acc = "0xbd374dcca2f7af3ce406bcabac72565815136e92";
const SP_ADDRESS = "0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650";
const AF_ADDRESS = "0xc351628EB244ec633d5f21fBD6621e1a683B1181";
const EP_ADDRESS = "0xFD471836031dc5108809D173A067e8486B9047A3";
const PM_ADDRESS = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
const SM_ADDRESS = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";
const ERC20SM_ADDRESS = "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07";
const NATIVESM_ADDRESS = "0x162A433068F51e18b7d13932F27e66a3f99E6890";
const ECDSASM_ADDRESS = "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe";
const CTPLUGIN_ADDRESS = "0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f";
const SUBPLUGIN_ADDRESS = "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();

	// const subscriptionPlugin = await ethers.getContractAt(
	// 	"SubscriptionPlugin",
	// 	SUBPLUGIN_ADDRESS,
	// 	signer1
	// );

	// const tx = await subscriptionPlugin.collect(acc, ethers.parseEther("7"));
	// const rec = await tx.wait();
	// console.log(rec);

	const account = await ethers.getContractAt("Account", acc);

	const tx = await account.checkPluginInstalled(SUBPLUGIN_ADDRESS);
	// const rece = await tx.wait();
	console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
