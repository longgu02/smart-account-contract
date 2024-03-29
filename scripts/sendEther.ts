import { ethers } from "hardhat";

const acc = "0x4a5f6f7f25fc9f68688cc717f843688a46f07b43";
const AF_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const SM_ADDRESS = "0x07882Ae1ecB7429a84f1D53048d35c4bB2056877";
const ERC20SM_ADDRESS = "0xA7c59f010700930003b33aB25a7a0679C860f29c";

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
