import { ethers } from "hardhat";
import { fillUserOp } from "../utils/userOp";
import { Network } from "../utils/addresses";

const acc = "0xeC4cFde48EAdca2bC63E94BB437BbeAcE1371bF3";
const FACTORY_ADDRESS = "0x0b3b4d0F8348A65D5Ba0bc365f640B8Ff9baf31F";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xD0ea240F7e207c4A9866952ce3bAE9E35Df01e2b";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	const address0 = await signer0.getAddress();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	let initCode =
		FACTORY_ADDRESS +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [
				"0x1df742d8e2518946924567b5c96eea22ae528e71",
			])
			.slice(2);

	let sender: any;

	try {
		await entryPoint.getSenderAddress(initCode);
	} catch (ex: any) {
		// Local
		// sender = "0x" + ex.data.data.slice(-40);
		// Testnet
		sender = "0x" + ex.data.slice(-40);
	}

	console.log({ sender });

	const code = await ethers.provider.getCode(sender);
	if (code !== "0x") {
		initCode = "0x";
	}

	const userOp = await fillUserOp(sender, initCode, Network.sepolia);
	console.log({ userOp });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
