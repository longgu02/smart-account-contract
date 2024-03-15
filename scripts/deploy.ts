import { ethers } from "hardhat";

async function main() {
	const af = await ethers.deployContract("AccountFactory");

	await af.waitForDeployment();

	console.log(`AF deployed to ${af.target}`);

	const ep = await ethers.deployContract("EntryPoint");

	await ep.waitForDeployment();

	console.log(`EP deployed to ${ep.target}`);

	const pm = await ethers.deployContract("Paymaster");

	await pm.waitForDeployment();

	console.log(`PM deployed to ${pm.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
