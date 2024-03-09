import { ethers } from "hardhat";

const acc = "0x23fC5F7f5Ef227e7fb7BB58feca70472978B3Cfe";
const FACTORY_ADDRESS = "0xAc0842fb2B3BC05B483d62bf48D30BD122c54C04";
const EP_ADDRESS = "0xb2B9979424E784b956B508303042560B6eed4fc1";
const PM_ADDRESS = "0x07f05bf62Cc6c427679AedEA3753Ad4644E77a6b";
const INFURA_API_KEY = process.env.INFURA_API_KEY;

async function main() {
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const provider = new ethers.JsonRpcProvider(
		`https://sepolia.infura.io/v3/${INFURA_API_KEY}`
	);
	const [signer0] = await ethers.getSigners();
	const account = await ethers.getContractAt("Account", acc);

	const count = await account.count();
	const accountBalance = await entryPoint.balanceOf(acc);
	const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	console.log(count);
	console.log(`account: ${accountBalance}`);
	console.log(`paymaster: ${paymasterBalance}`);
	console.log(
		`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	);
	console.log(`account balance: ${await provider.getBalance(acc)}`);
	// console.log(
	// 	`signer1 balance: ${await provider.getBalance(await signer1.getAddress())}`
	// );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
