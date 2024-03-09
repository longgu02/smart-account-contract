import { ethers } from "hardhat";

const acc = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
	// const Test = await ethers.getContractAt("Test", EP_ADDRESS);
	// const account = await ethers.getContractAt("Account", acc);
	const [signer0] = await ethers.getSigners();
	const signature = await signer0.signMessage(
		ethers.getBytes(ethers.id("wee"))
	);

	const Test = await ethers.getContractFactory("Test");
	const test = await Test.deploy(signature);

	console.log("address0: ", await signer0.getAddress());

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
