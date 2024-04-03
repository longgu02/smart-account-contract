import { ethers } from "hardhat";

export const getEntryPoint = async () => {
	const entryPoint = await ethers.getContractAt(
		"EntryPoint",
		"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
	);
	return entryPoint;
};

export const getModuleAddress = () => {};

export function pack(addr: string, functionId: number): Buffer {
	// Remove the '0x' prefix from the address and pad it to 40 characters
	const addrPadded = addr.replace(/^0x/, "").padStart(40, "0");

	// Convert the address and functionId to Buffers
	const addrBuf = Buffer.from(addrPadded, "hex");
	const functionIdBuf = Buffer.from(
		functionId.toString(16).padStart(2, "0"),
		"hex"
	);

	// Combine the address and functionId Buffers
	const combined = Buffer.concat([addrBuf, functionIdBuf]);

	return combined;
}
