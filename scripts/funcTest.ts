import { ethers } from "hardhat";
import { fillUserOp } from "../utils/userOp";
import { Network } from "../utils/addresses";

const acc = "0xfacff941e53707bc22e21d45aa8573bc4e477e34";
const AF_ADDRESS = "0xFE5f411481565fbF70D8D33D992C78196E014b90";
const EP_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
const PM_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
const SM_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
const ERC20SM_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
const NATIVESM_ADDRESS = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
const ECDSASM_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
const SP_ADDRESS = "0x56fC17a65ccFEC6B7ad0aDe9BD9416CB365B9BE8";
const CTPLUGIN_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
const SUBPLUGIN_ADDRESS = "0x638A246F0Ec8883eF68280293FFE8Cfbabe61B44";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();

	const subscriptionPlugin = await ethers.getContractAt(
		"SubscriptionPlugin",
		SUBPLUGIN_ADDRESS,
		signer1
	);

	const tx = await subscriptionPlugin.collect(acc, ethers.parseEther("7"));
	const rec = await tx.wait();
	console.log(rec);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
