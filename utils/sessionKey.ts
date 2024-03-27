import { keccak256 } from "ethereumjs-util";
import MerkleTree from "merkletreejs";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { fillUserOp } from "./userOp";
import { Network } from "hardhat/types";
import { getEntryPoint } from "./helpers";
import { EntryPoint } from "../typechain-types";

const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder();

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

export const signNativeSessionUserOp = async (
	userOp: UserOp,
	userOpHash: string,
	sessionSigner: Signer,
	validationModuleAddress: string,
	receiverAddress: string,
	amount: BigInt,
	merkleProof: [string],
	sessionManagerAddress: string
) => {
	const sessionKeySig = await sessionSigner.signMessage(
		ethers.getBytes(userOpHash)
	);

	const paddedSig = defaultAbiCoder.encode(
		// validUntil, validAfter, sessionVerificationModule address, validationData, merkleProof, signature
		["uint48", "uint48", "address", "bytes", "bytes32[]", "bytes"],
		[
			0,
			0,
			validationModuleAddress,
			await calculateNativeSessionKeyData(
				await sessionSigner.getAddress(),
				receiverAddress,
				amount
			),
			merkleProof,
			sessionKeySig,
		]
	);

	const signatureWithModuleAddress = defaultAbiCoder.encode(
		["bytes", "address"],
		[paddedSig, sessionManagerAddress]
	);

	userOp.signature = signatureWithModuleAddress;

	return userOp;
};

export const fillAndSignNativeSessionUserOp = async (
	sender: string,
	initCode: string,
	network: Network,
	callData: { receiver: string; amount: BigInt; data: string },
	sessionSigner: Signer,
	validationModuleAddress: string,
	sessionManagerAddress: string,
	merkleProof: [string]
) => {
	const { userOp, userOpHash } = await fillUserOp(
		sender,
		initCode,
		network,
		callData
	);
	return signNativeSessionUserOp(
		userOp,
		userOpHash,
		sessionSigner,
		validationModuleAddress,
		callData.receiver,
		callData.amount,
		merkleProof,
		sessionManagerAddress
	);
};
