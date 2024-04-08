import { ethers } from "hardhat";
import { fillUserOp } from "../utils/userOp";
import { Network } from "../utils/addresses";

const acc = "0xc02e40414992d80c7a2df88bd1e66d7894eb2cf0";
export const SP_ADDRESS = "0x11c68f4FB6ef20cf27425B3271b58340673DB104";
export const AF_ADDRESS = "0xfdfCFe90879cC0C09d74878d2fd2080d8D7114f7";
export const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
export const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
export const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
export const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
export const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
export const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
export const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

async function main() {
	const [signer0, signer1, signer2, signer3] = await ethers.getSigners();

	// const provider = new ethers.JsonRpcProvider("http://localhost:8545");
	// const YoutubeWallet = new ethers.Wallet(
	// 	"0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
	// ).connect(provider);
	// const YoutubeSubPrice = ethers.parseEther("6");
	// const subscriptionPlugin = await ethers.getContractAt(
	// 	"SubscriptionPlugin",
	// 	SUBPLUGIN_ADDRESS,
	// 	signer3
	// );

	// const tx = await subscriptionPlugin.collect(acc, YoutubeSubPrice);
	// const rec = await tx.wait();
	// console.log(rec);

	const AccountFactory = await ethers.getContractAt(
		"AccountFactory",
		AF_ADDRESS
	);

	const tx = await AccountFactory.createAccount(
		"0x4293c950C41A8f5DD78195ee52e5011680725a9e",
		ECDSASM_ADDRESS,
		EP_ADDRESS
	);

	const re = await tx.wait();
	console.log(re);

	// const tx = await account.checkPluginInstalled(SUBPLUGIN_ADDRESS);
	// const rece = await tx.wait();
	// console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
