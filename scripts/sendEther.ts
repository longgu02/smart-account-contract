import { ethers } from "hardhat";

const acc = "0xda7b1d6acbc52733a166e93396b3ea2fd4182e9c";
const SP_ADDRESS = "0x11c68f4FB6ef20cf27425B3271b58340673DB104";
const AF_ADDRESS = "0x43eFEc97A672cfCe9C91f08871C8D685D559D35c";
const EP_ADDRESS = "0x17Ba64A5A80487F3db8C18E084c8f7E072D42923";
const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

async function main() {
	// const Test = await ethers.getContractAt("Test", EP_ADDRESS);
	// const account = await ethers.getContractAt("Account", acc);
	const [signer0] = await ethers.getSigners();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	// const transaction = {
	// 	to: acc,
	// 	value: ethers.parseEther("200"), // Sends 1 Ether
	// };
	await entryPoint.depositTo(PM_ADDRESS, {
		value: ethers.parseEther("1"),
	});
	// await signer0
	// 	.sendTransaction(transaction)
	// 	.then((tx) => {
	// 		console.log(tx);
	// 	})
	// 	.catch((err) => {
	// 		console.log(err);
	// 	});

	// console.log(count);
	// console.log(`account: ${accountBalance}`);
	// console.log(`paymaster: ${paymasterBalance}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
