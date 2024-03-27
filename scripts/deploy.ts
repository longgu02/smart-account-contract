import { ethers } from "hardhat";

async function main() {
	// const af = await ethers.deployContract("AccountFactory");

	// await af.waitForDeployment();

	// console.log(`AF deployed to ${af.target}`);

	// const ep = await ethers.deployContract("EntryPoint");

	// await ep.waitForDeployment();

	// console.log(`EP deployed to ${ep.target}`);

	// const pm = await ethers.deployContract("Paymaster");

	// await pm.waitForDeployment();

	// console.log(`PM deployed to ${pm.target}`);

	const sm = await ethers.deployContract("SessionKeyManager");

	await sm.waitForDeployment();

	console.log(`SM deployed to ${sm.target}`);

	const erc20sm = await ethers.deployContract("ERC20SessionValidationModule");

	await erc20sm.waitForDeployment();

	console.log(`erc20sm deployed to ${erc20sm.target}`);

	const nativeSm = await ethers.deployContract("NativeSessionValidationModule");

	await nativeSm.waitForDeployment();

	console.log(`nativeSm deployed to ${nativeSm.target}`);

	// const ECDSAsm = await ethers.deployContract("EcdsaOwnershipRegistryModule");

	// await ECDSAsm.waitForDeployment();

	// console.log(`ECDSAsm deployed to ${ECDSAsm.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
