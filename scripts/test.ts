import { ethers } from "hardhat";

const acc = "0x7a9acb410c96404fb36cfac35f11c799bba95d32";

const SP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const AF_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EP_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const SM_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const ERC20SM_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const NATIVESM_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const ECDSASM_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const CTPLUGIN_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const SUBPLUGIN_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const FASTPLUGIN_ADDRESS = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

const ALCHEMY_SEPOLIA =
	process.env.ALCHEMY_SEPOLIA || "qGkwl3M3bVBT-jyOqJjLnmgYEz-hmW3R";

async function main() {
	// const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
	const [signer0, signer1, signer2, signer3] = await ethers.getSigners();
	const provider = new ethers.JsonRpcProvider("http://localhost:8545");
	// const provider = new ethers.JsonRpcProvider(
	// 	`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA}`
	// );
	// const [signer0] = await ethers.getSigners();
	const account = await ethers.getContractAt("Account", acc);
	// const transaction = {
	// 	to: acc,
	// 	value: ethers.parseEther("200"), // Sends 1 Ether
	// };
	// await entryPoint.depositTo(PM_ADDRESS, {
	// 	value: ethers.parseEther("0.4"),
	// });
	// console.log("pm: ", await entryPoint.balanceOf(PM_ADDRESS));
	// await signer0
	// 	.sendTransaction(transaction)
	// 	.then((tx) => {
	// 		console.log(tx);
	// 	})
	// 	.catch((err) => {
	// 		console.log(err);
	// 	});
	const fastPluginContract = await ethers.getContractAt(
		"FastTransferPlugin",
		FASTPLUGIN_ADDRESS
	);
	await fastPluginContract.transfer(
		acc,
		signer1.address,
		ethers.parseEther("10"),
		// Math.floor(new Date().getTime() / 1000),
		1718950724,
		1,
		signer0.address
	);

	// console.log(
	// 	acc,
	// 	signer1.address,
	// 	ethers.parseEther("10"),
	// 	Math.floor(new Date().getTime() / 1000),
	// 	1,
	// 	signer0.address
	// );

	// const count = await account.count();
	// const accountBalance = await entryPoint.balanceOf(acc);
	// const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	// console.log(count);
	// console.log(`account: ${accountBalance}`);
	// console.log(`paymaster: ${paymasterBalance}`);
	// console.log(
	// 	`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	// );

	console.log(`account balance: ${await provider.getBalance(acc)}`);
	console.log(`rev balance: ${await provider.getBalance(signer1.address)}`);
	console.log(`rev balance: ${await provider.getBalance(signer2.address)}`);
	console.log(await account.checkPluginInstalled(FASTPLUGIN_ADDRESS));
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
