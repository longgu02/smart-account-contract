import { ethers } from "hardhat";

const acc = "0xeC4cFde48EAdca2bC63E94BB437BbeAcE1371bF3";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	const erc20 = await ethers.deployContract("MyToken", [
		ethers.parseEther("999999"),
	]);

	await erc20.waitForDeployment();

	console.log(`MTK deployed to ${erc20.target}`);

	const mtkContract = await ethers.getContractAt("MyToken", erc20.target);

	console.log(
		"signer0 balance: ",
		await mtkContract.balanceOf(await signer0.getAddress())
	);
	await mtkContract.transfer(acc, ethers.parseEther("1"));
	console.log(
		"signer0 balance then: ",
		await mtkContract.balanceOf(await signer0.getAddress())
	);
	console.log("acc balance: ", await mtkContract.balanceOf(acc));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
