import { ethers } from "hardhat";
import { genMerkleTree } from "../utils/sessionKey";

const AF_ADDRESS = "0x5FeaeBfB4439F3516c74939A9D04e95AFE82C4ae";
const EP_ADDRESS = "0x976fcd02f7C4773dd89C309fBF55D5923B4c98a1";
const PM_ADDRESS = "0x19cEcCd6942ad38562Ee10bAfd44776ceB67e923";
const SM_ADDRESS = "0x66F625B8c4c635af8b74ECe2d7eD0D58b4af3C3d";
const ERC20SM_ADDRESS = "0x8bCe54ff8aB45CB075b044AE117b8fD91F9351aB";
const NATIVE_ADDRESS = "0xf5059a5D33d5853360D16C683c16e67980206f36";

async function main() {
	// const [signer0, signer1] = await ethers.getSigners();
	// const { merkleTree, data } = genMerkleTree(
	// 	ERC20SM_ADDRESS,
	// 	"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43"
	// );

	// const sessionKeyManager = ethers.getContractAt(
	// 	"SessionKeyManager",
	// 	SM_ADDRESS
	// );

	// console.log({ merkleTree, data });
	const nativeModule = ethers.getContractAt("NativeSessionValidationModule", NATIVE_ADDRESS);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
