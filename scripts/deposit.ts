import { ethers } from "hardhat";

const FACTORY_NONCE = 1;
const acc = "0xeC4cFde48EAdca2bC63E94BB437BbeAcE1371bF3";
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xD0ea240F7e207c4A9866952ce3bAE9E35Df01e2b";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	await entryPoint.depositTo(PM_ADDRESS, {
		value: ethers.parseEther("0.05"),
	});
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
