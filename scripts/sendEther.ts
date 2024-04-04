import { ethers } from "hardhat";

const acc = "0xda7b1d6acbc52733a166e93396b3ea2fd4182e9c";
const SP_ADDRESS = "0x5bf5b11053e734690269C6B9D438F8C9d48F528A";
const AF_ADDRESS = "0xffa7CA1AEEEbBc30C874d32C7e22F052BbEa0429";
const EP_ADDRESS = "0x3aAde2dCD2Df6a8cAc689EE797591b2913658659";
const PM_ADDRESS = "0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926";
const SM_ADDRESS = "0xE3011A37A904aB90C8881a99BD1F6E21401f1522";
const ERC20SM_ADDRESS = "0x1f10F3Ba7ACB61b2F50B9d6DdCf91a6f787C0E82";
const NATIVESM_ADDRESS = "0x457cCf29090fe5A24c19c1bc95F492168C0EaFdb";
const ECDSASM_ADDRESS = "0x525C7063E7C20997BaaE9bDa922159152D0e8417";
const CTPLUGIN_ADDRESS = "0x38a024C0b412B9d1db8BC398140D00F5Af3093D4";
const SUBPLUGIN_ADDRESS = "0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c";

async function main() {
	// const Test = await ethers.getContractAt("Test", EP_ADDRESS);
	// const account = await ethers.getContractAt("Account", acc);
	const [signer0] = await ethers.getSigners();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const transaction = {
		to: acc,
		value: ethers.parseEther("200"), // Sends 1 Ether
	};
	await entryPoint.depositTo(PM_ADDRESS, {
		value: ethers.parseEther("100"),
	});
	await signer0
		.sendTransaction(transaction)
		.then((tx) => {
			console.log(tx);
		})
		.catch((err) => {
			console.log(err);
		});

	// console.log(count);
	// console.log(`account: ${accountBalance}`);
	// console.log(`paymaster: ${paymasterBalance}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
