import { ethers } from "hardhat";
import { fillUserOp } from "../utils/userOp";
import { Network } from "../utils/addresses";

async function main() {}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
