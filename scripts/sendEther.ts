import { ethers } from "hardhat";

const acc = "0x23fC5F7f5Ef227e7fb7BB58feca70472978B3Cfe";
const FACTORY_ADDRESS = "0xAc0842fb2B3BC05B483d62bf48D30BD122c54C04";
const EP_ADDRESS = "0xb2B9979424E784b956B508303042560B6eed4fc1";
const PM_ADDRESS = "0x07f05bf62Cc6c427679AedEA3753Ad4644E77a6b";

async function main() {
	// const Test = await ethers.getContractAt("Test", EP_ADDRESS);
	// const account = await ethers.getContractAt("Account", acc);
	const [signer0] = await ethers.getSigners();
	const transaction = {
		to: acc,
		value: ethers.parseEther("0.005"), // Sends 1 Ether
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
