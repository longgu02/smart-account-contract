import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0x15ae0f06d83c9f5b03180fb66cf4b2d6a7ae580a";
const AF_ADDRESS = "0x9d4454B023096f34B160D6B654540c56A1F81688";
const EP_ADDRESS = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
const PM_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
const SM_ADDRESS = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E";
const ERC20SM_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
const NATIVESM_ADDRESS = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";
const ECDSASM_ADDRESS = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";

async function main() {
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
	const ecdsaModule = await ethers.getContractAt(
		"EcdsaOwnershipRegistryModule",
		ECDSASM_ADDRESS
	);
	const sessionKeyManager = await ethers.getContractAt(
		"SessionKeyManager",
		SM_ADDRESS
	);
	// const mtkContract = await ethers.getContractAt("MyToken", MTK_ADDRESS);

	const provider = new ethers.JsonRpcProvider("http://localhost:8545");
	const [signer0, signer1, signer2] = await ethers.getSigners();
	const account = await ethers.getContractAt("Account", acc);

	// const count = await account.count();
	const accountBalance = await entryPoint.balanceOf(acc);
	const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	// console.log(count);
	console.log(`account: ${accountBalance}`);
	console.log(`paymaster: ${paymasterBalance}`);
	console.log(
		`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	);

	console.log(
		`receiver balance: ${await provider.getBalance(await signer2.getAddress())}`
	);
	console.log(`account balance: ${await provider.getBalance(acc)}`);
	console.log(
		`Merkle root: ${(await sessionKeyManager.getSessionKeys(acc)).merkleRoot}`
	);
	console.log(`ECDSA Init: ${await ecdsaModule.getOwner(acc)}`);

	// console.log(`account erc20 balance: ${await mtkContract.balanceOf(acc)}`);
	// console.log(
	// 	`signer1 erc20 balance: ${await mtkContract.balanceOf(
	// 		await signer1.getAddress()
	// 	)}`
	// );
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
