import { keccak256 } from "ethereumjs-util";
import MerkleTree from "merkletreejs";
import { ethers } from "hardhat";

const defaultAbiCoder = new ethers.AbiCoder();

export const genMerkleTree = (
	sessionValidationModuleAddress: string,
	sessionKey: string,
	sessionData: string
) => {
	const data = ethers.concat([
		ethers.zeroPadValue("0x00", 6),
		ethers.zeroPadValue("0x00", 6),
		ethers.zeroPadValue(sessionValidationModuleAddress, 20),
		sessionData,
	]);

	const merkleTree = new MerkleTree(
		[ethers.keccak256(data), ethers.keccak256(data)],
		keccak256,
		{
			sortPairs: false,
			hashLeaves: false,
		}
	);

	console.log({
		hehe: merkleTree.getHexProof(ethers.keccak256(data)).toString(),
		merkleTree,
		data,
	});

	return { merkleTree, data };
};

export function calculateNativeSessionKeyData(
	sessionPublicKey: string,
	recipient: string,
	maxAmount: BigInt
) {
	return defaultAbiCoder.encode(
		["address", "address", "uint256"],
		[sessionPublicKey, recipient, maxAmount]
	);
}

// export async function makeEcdsaSessionKeySignedUserOp(
// 	functionName: string,
// 	functionParams: any,
// 	userOpSender: string,
// 	sessionKey: Signer,
// 	entryPoint: EntryPoint,
// 	sessionKeyManagerAddress: string,
// 	validUntil: number,
// 	validAfter: number,
// 	sessionValidationModuleAddress: string,
// 	sessionKeyParamsData: BytesLike,
// 	merkleProof: any,
// 	options?: {
// 		preVerificationGas?: number;
// 	}
// ): Promise<UserOperation> {
// 	const SmartAccount = await ethers.getContractFactory("SmartAccount");

// 	const txnDataAA1 = SmartAccount.interface.encodeFunctionData(
// 		functionName,
// 		functionParams
// 	);

// 	const userOp = await fillAndSign(
// 		{
// 			sender: userOpSender,
// 			callData: txnDataAA1,
// 			...options,
// 		},
// 		sessionKey,
// 		entryPoint,
// 		"nonce",
// 		true
// 	);

// 	const paddedSig = defaultAbiCoder.encode(
// 		// validUntil, validAfter, sessionVerificationModule address, validationData, merkleProof, signature
// 		["uint48", "uint48", "address", "bytes", "bytes32[]", "bytes"],
// 		[
// 			validUntil,
// 			validAfter,
// 			sessionValidationModuleAddress,
// 			sessionKeyParamsData,
// 			merkleProof,
// 			userOp.signature,
// 		]
// 	);

// 	const signatureWithModuleAddress = defaultAbiCoder.encode(
// 		["bytes", "address"],
// 		[paddedSig, sessionKeyManagerAddress]
// 	);
// 	userOp.signature = signatureWithModuleAddress;

// 	return userOp;
// }
