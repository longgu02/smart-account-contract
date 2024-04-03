import { ethers } from "hardhat";

const SP_ADDRESS = "0x56fC17a65ccFEC6B7ad0aDe9BD9416CB365B9BE8";
async function main() {
	const af = await ethers.deployContract("AccountFactory", [SP_ADDRESS]);

	await af.waitForDeployment();

	console.log(`AF deployed to ${af.target}`);

	// const ep = await ethers.deployContract("EntryPoint");

	// await ep.waitForDeployment();

	// console.log(`EP deployed to ${ep.target}`);

	// const pm = await ethers.deployContract("Paymaster");

	// await pm.waitForDeployment();

	// console.log(`PM deployed to ${pm.target}`);

	// const sm = await ethers.deployContract("SessionKeyManager");

	// await sm.waitForDeployment();

	// console.log(`SM deployed to ${sm.target}`);

	// const erc20sm = await ethers.deployContract("ERC20SessionValidationModule");

	// await erc20sm.waitForDeployment();

	// console.log(`erc20sm deployed to ${erc20sm.target}`);

	// const nativeSm = await ethers.deployContract("NativeSessionValidationModule");

	// await nativeSm.waitForDeployment();

	// console.log(`nativeSm deployed to ${nativeSm.target}`);

	// const ECDSAsm = await ethers.deployContract("EcdsaOwnershipRegistryModule");

	// await ECDSAsm.waitForDeployment();

	// console.log(`ECDSAsm deployed to ${ECDSAsm.target}`);

	// const SingleOwnerPlugin = await ethers.deployContract("SingleOwnerPlugin");

	// await SingleOwnerPlugin.waitForDeployment();

	// console.log(`SingleOwnerPlugin deployed to ${SingleOwnerPlugin.target}`);

	// const counterPlugin = await ethers.deployContract("CounterPlugin");

	// await counterPlugin.waitForDeployment();

	// console.log(`counterPlugin deployed to ${counterPlugin.target}`);

	const SubscriptionPlugin = await ethers.deployContract("SubscriptionPlugin");

	await SubscriptionPlugin.waitForDeployment();

	console.log(`SubscriptionPlugin deployed to ${SubscriptionPlugin.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
