import { ethers } from "hardhat";

export const getEntryPoint = async () => {
	const entryPoint = await ethers.getContractAt(
		"EntryPoint",
		"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
	);
	return entryPoint;
};

export const getModuleAddress = () => {};
