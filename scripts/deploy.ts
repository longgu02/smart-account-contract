import { ethers } from "hardhat";

async function main() {
	const SingleOwnerPlugin = await ethers.deployContract("SingleOwnerPlugin");
	await SingleOwnerPlugin.waitForDeployment();
	console.log(`const SP_ADDRESS = "${SingleOwnerPlugin.target}"`);

	const af = await ethers.deployContract("AccountFactory", [
		SingleOwnerPlugin.target,
	]);
	await af.waitForDeployment();
	console.log(`const AF_ADDRESS = "${af.target}"`);

	const ep = await ethers.deployContract("EntryPoint");
	await ep.waitForDeployment();
	console.log(`const EP_ADDRESS = "${ep.target}"`);

	const pm = await ethers.deployContract("Paymaster");
	await pm.waitForDeployment();
	console.log(`const PM_ADDRESS = "${pm.target}"`);

	const sm = await ethers.deployContract("SessionKeyManager");
	await sm.waitForDeployment();
	console.log(`const SM_ADDRESS = "${sm.target}"`);

	const erc20sm = await ethers.deployContract("ERC20SessionValidationModule");
	await erc20sm.waitForDeployment();
	console.log(`const ERC20SM_ADDRESS = "${erc20sm.target}"`);

	const nativeSm = await ethers.deployContract("NativeSessionValidationModule");
	await nativeSm.waitForDeployment();
	console.log(`const NATIVESM_ADDRESS = "${nativeSm.target}"`);

	const ECDSAsm = await ethers.deployContract("EcdsaOwnershipRegistryModule");
	await ECDSAsm.waitForDeployment();
	console.log(`const ECDSASM_ADDRESS = "${ECDSAsm.target}"`);

	const counterPlugin = await ethers.deployContract("CounterPlugin");
	await counterPlugin.waitForDeployment();
	console.log(`const CTPLUGIN_ADDRESS = "${counterPlugin.target}"`);

	const SubscriptionPlugin = await ethers.deployContract("SubscriptionPlugin");
	await SubscriptionPlugin.waitForDeployment();
	console.log(`const SUBPLUGIN_ADDRESS = "${SubscriptionPlugin.target}"`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
