import { ethers } from "hardhat";

const acc = "0xfacff941e53707bc22e21d45aa8573bc4e477e34";
const AF_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const SM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const ERC20SM_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const NATIVESM_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const ECDSASM_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

async function main() {
	// const Test = await ethers.getContractAt("Test", EP_ADDRESS);
	// const account = await ethers.getContractAt("Account", acc);
	const [signer0] = await ethers.getSigners();
	const transaction = {
		to: acc,
		value: ethers.parseEther("200"), // Sends 1 Ether
	};

	await signer0
		.sendTransaction(transaction)
		.then((tx) => {
			console.log(tx);
		})
		.catch((err) => {
			console.log(err);
		});

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
