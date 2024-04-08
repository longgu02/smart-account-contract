import { ethers } from "hardhat";

// const EP_ADDRESS = ""

async function main() {
	// Deploy
	const SingleOwnerPlugin = await ethers.deployContract("SingleOwnerPlugin");
	await SingleOwnerPlugin.waitForDeployment();
	console.log(`export const SP_ADDRESS = "${SingleOwnerPlugin.target}"`);

	const af = await ethers.deployContract("AccountFactory", [
		SingleOwnerPlugin.target,
	]);
	await af.waitForDeployment();
	console.log(`export const AF_ADDRESS = "${af.target}"`);

	const ep = await ethers.deployContract("EntryPoint");
	await ep.waitForDeployment();
	console.log(`export const EP_ADDRESS = "${ep.target}"`);

	const pm = await ethers.deployContract("Paymaster");
	await pm.waitForDeployment();
	console.log(`export const PM_ADDRESS = "${pm.target}"`);

	const sm = await ethers.deployContract("SessionKeyManager");
	await sm.waitForDeployment();
	console.log(`export const SM_ADDRESS = "${sm.target}"`);

	const erc20sm = await ethers.deployContract("ERC20SessionValidationModule");
	await erc20sm.waitForDeployment();
	console.log(`export const ERC20SM_ADDRESS = "${erc20sm.target}"`);

	const nativeSm = await ethers.deployContract("NativeSessionValidationModule");
	await nativeSm.waitForDeployment();
	console.log(`export const NATIVESM_ADDRESS = "${nativeSm.target}"`);

	const ECDSAsm = await ethers.deployContract("EcdsaOwnershipRegistryModule");
	await ECDSAsm.waitForDeployment();
	console.log(`export const ECDSASM_ADDRESS = "${ECDSAsm.target}"`);

	const counterPlugin = await ethers.deployContract("CounterPlugin");
	await counterPlugin.waitForDeployment();
	console.log(`export const CTPLUGIN_ADDRESS = "${counterPlugin.target}"`);

	const SubscriptionPlugin = await ethers.deployContract("SubscriptionPlugin");
	await SubscriptionPlugin.waitForDeployment();
	console.log(
		`export const SUBPLUGIN_ADDRESS = "${SubscriptionPlugin.target}"`
	);

	// Transfer funds for PM and ACC
	// const Test = await ethers.getContractAt("Test", EP_ADDRESS);
	// const account = await ethers.getContractAt("Account", acc);
	const [signer0] = await ethers.getSigners();
	const entryPoint = await ethers.getContractAt("EntryPoint", ep.target);

	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	let initCode =
		af.target +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [
				signer0.address,
				ECDSAsm.target,
				ep.target,
			])
			.slice(2);

	let sender: any;

	try {
		await entryPoint.getSenderAddress(initCode);
	} catch (ex: any) {
		// Local
		sender = "0x" + ex.data.data.slice(-40);
		// Testnet
		// sender = "0x" + ex.data.slice(-40);
		// console.log(ex)
	}

	console.log({ sender });

	const transaction = {
		to: sender,
		value: ethers.parseEther("200"), // Sends 1 Ether
	};
	await entryPoint.depositTo(pm.target, {
		value: ethers.parseEther("100"),
	});
	await signer0
		.sendTransaction(transaction)
		.then((tx) => {
			console.log(tx);
		})
		.catch((err) => {
			console.log(err);
		});
	console.log("pm: ", await entryPoint.balanceOf(pm.target));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
