import { ethers } from "hardhat";
import {
	CurrencyAmount,
	NativeCurrencyName,
	Percent,
	Token,
	TradeType,
} from "@uniswap/sdk-core";
import { FeeAmount, computePoolAddress } from "@uniswap/v3-sdk";
import { SUPPORTED_CHAINS } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { erc20Abi } from "../types/abi/erc20abi";
import JSBI from "jsbi";

const FACTORY_NONCE = 1;
const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xe382aa915e047268e66b6c7b0f0ca0a77b4df6fd";
export const SP_ADDRESS = "0x11c68f4FB6ef20cf27425B3271b58340673DB104";
export const AF_ADDRESS = "0xfdfCFe90879cC0C09d74878d2fd2080d8D7114f7";
export const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
export const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
export const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
export const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
export const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
export const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
export const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

interface ExampleConfig {
	rpc: {
		local: string;
		mainnet: string;
	};
	tokens: {
		in: Token;
		amountIn: number;
		out: Token;
		poolFee: number;
	};
}

export const POOL_FACTORY_CONTRACT_ADDRESS =
	"0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const QUOTER_CONTRACT_ADDRESS =
	"0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

// Currencies and Tokens

export const WETH_TOKEN = new Token(
	SUPPORTED_CHAINS[10],
	"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	18,
	NativeCurrencyName.ETHER,
	"Ether"
);

export const USDC_TOKEN = new Token(
	SUPPORTED_CHAINS[10],
	"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
	6,
	"USDC",
	"USD//C"
);

export const CurrentConfig: ExampleConfig = {
	rpc: {
		local: "http://localhost:8545",
		mainnet: `https://eth-sepolia.g.alchemy.com/v2/qGkwl3M3bVBT-jyOqJjLnmgYEz-hmW3R`,
	},
	tokens: {
		in: USDC_TOKEN,
		amountIn: 0.1,
		out: WETH_TOKEN,
		poolFee: FeeAmount.MEDIUM,
	},
};

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	// CREATE: hash(deployer + nonce)
	// const defaultAbi = ethers.AbiCoder.defaultAbiCoder();

	// const AccountFactory = await ethers.getContractFactory("AccountFactory");
	// // const address0 = await signer0.getAddress();
	// const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	// const transaction = {
	// 	to: acc,
	// 	value: ethers.parseEther("10"), // Sends 1 Ether
	// };
	// // only first time
	// let initCode =
	// 	AF_ADDRESS +
	// 	AccountFactory.interface
	// 		.encodeFunctionData("createAccount", [
	// 			signer0.address,
	// 			ECDSASM_ADDRESS,
	// 			EP_ADDRESS,
	// 		])
	// 		.slice(2);

	// let sender: any;

	// try {
	// 	await entryPoint.getSenderAddress(initCode);
	// } catch (ex: any) {
	// 	// Local
	// 	// sender = "0x" + ex.data.data.slice(-40);
	// 	// Testnet
	// 	sender = "0x" + ex.data.slice(-40);
	// }

	// console.log({ sender });

	// const code = await ethers.provider.getCode(sender);
	// if (code !== "0x") {
	// 	initCode = "0x";
	// }

	// // const initCode = "0x";
	// const Account = await ethers.getContractFactory("Account");

	// // const erc20: Contract = new ethers.Contract(erc20TokenAddress, ERC20_ABI, provider)
	// const currentPoolAddress = computePoolAddress({
	// 	factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
	// 	tokenA: CurrentConfig.tokens.in,
	// 	tokenB: CurrentConfig.tokens.out,
	// 	fee: CurrentConfig.tokens.poolFee,
	// });

	// const provider = new ethers.AlchemyProvider(
	// 	"https://eth-sepolia.g.alchemy.com/v2/qGkwl3M3bVBT-jyOqJjLnmgYEz-hmW3R"
	// );
	// const poolContract = new ethers.Contract(
	// 	currentPoolAddress,
	// 	IUniswapV3PoolABI.abi,
	// 	provider
	// );

	// const [token0, token1, fee, liquidity, slot0] = await Promise.all([
	// 	poolContract.token0(),
	// 	poolContract.token1(),
	// 	poolContract.fee(),
	// 	poolContract.liquidity(),
	// 	poolContract.slot0(),
	// ]);

	// const quoterContract = new ethers.Contract(
	// 	QUOTER_CONTRACT_ADDRESS,
	// 	Quoter.abi,
	// 	provider
	// );

	// const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
	// 	token0,
	// 	token1,
	// 	fee,
	// 	fromReadableAmount(
	// 		CurrentConfig.tokens.amountIn,
	// 		CurrentConfig.tokens.in.decimals
	// 	).toString(),
	// 	0
	// );

	const V3_SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
	const ALCHEMY_URL =
		"https://eth-sepolia.g.alchemy.com/v2/qGkwl3M3bVBT-jyOqJjLnmgYEz-hmW3R";

	const chainId = SUPPORTED_CHAINS[10];

	const web3Provider = new ethers.AlchemyProvider(ALCHEMY_URL);
	const router = new AlphaRouter({ chainId: chainId, provider: web3Provider });

	const name0 = "Wrapped Ether";
	const symbol0 = "WETH";
	const decimals0 = 18;
	const address0 = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

	const name1 = "USDC";
	const symbol1 = "USDC";
	const decimals1 = 18;
	const address1 = "0xf08A50178dfcDe18524640EA6618a1f965821715";

	const WETH = new Token(chainId, address0, decimals0, symbol0, name0);
	const USDC = new Token(chainId, address1, decimals1, symbol1, name1);

	const getWethContract = () =>
		new ethers.Contract(address0, erc20Abi, web3Provider);
	const getUSDCContract = () =>
		new ethers.Contract(address1, erc20Abi, web3Provider);

	const getPrice = async (
		inputAmount,
		slippageAmount,
		deadline,
		walletAddress
	) => {
		const percentSlippage = new Percent(slippageAmount, 100);
		const wei = ethers.parseUnits(inputAmount.toString(), decimals0);
		const currencyAmount = CurrencyAmount.fromRawAmount(
			WETH,
			JSBI.toNumber(JSBI.BigInt(wei.toString()))
		);

		const route = await router.route(
			currencyAmount,
			USDC,
			TradeType.EXACT_INPUT,
			{
				recipient: walletAddress,
				slippageTolerance: percentSlippage,
				deadline: deadline,
			}
		);

		const transaction = {
			data: route?.methodParameters?.calldata,
			to: V3_SWAP_ROUTER_ADDRESS,
			value: BigNumber.from(route?.methodParameters.value),
			from: walletAddress,
			gasPrice: BigNumber.from(route?.gasPriceWei),
			gasLimit: ethers.hexlify(1000000),
		};

		const quoteAmountOut = route?.quote.toFixed(6);
		const ratio = (quotedAmountOut / inputAmount).toFixed(3);

		return [transaction, quoteAmountOut, ratio];
	};

	const runSwap = async (transaction, signer) => {
		const approvalAmount = ethers.parseUnits("10", 10).toString();
		const contract0 = getWethContract();
		await contract0
			.connect(signer)
			.approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount);

		signer.sendTransaction(transaction);
	};

	const amount = 1;
	const slippage = 2;
	const deadlineMins = 10;

	await getPrice(
		amount,
		slippage,
		Math.floor(Date.now() / 1000 + deadlineMins * 60),
		signer0.address
	);

	// const userOp: UserOp = {
	// 	sender, // smart account address
	// 	nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
	// 	initCode,
	// 	// callData: Account.interface.encodeFunctionData("execute"),
	// 	callData: Account.interface.encodeFunctionData("execute", [
	// 		"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43",
	// 		ethers.parseEther("0"),
	// 		"0x",
	// 	]),
	// 	callGasLimit: "0x" + (200_000).toString(16),
	// 	verificationGasLimit: "0x" + (200_000).toString(16),
	// 	preVerificationGas: "0x" + (100_000).toString(16),
	// 	maxFeePerGas: "0x" + ethers.parseUnits("100", "gwei").toString(16),
	// 	maxPriorityFeePerGas: "0x" + ethers.parseUnits("50", "gwei").toString(16),
	// 	// callGasLimit: "0x0",
	// 	// verificationGasLimit: "0x0",
	// 	// preVerificationGas: "0x0",
	// 	// maxFeePerGas: "0x0",
	// 	// maxPriorityFeePerGas: "0x0",
	// 	paymasterAndData: PM_ADDRESS,
	// 	signature:
	// 		"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
	// };
	// const userOpHash = await entryPoint.getUserOpHash(userOp);

	// const signatureWithModuleAddress = defaultAbi.encode(
	// 	["bytes", "address"],
	// 	[await signer0.signMessage(ethers.getBytes(userOpHash)), ECDSASM_ADDRESS]
	// );
	// userOp.signature = signatureWithModuleAddress;
	// try {
	// 	const { preVerificationGas, verificationGasLimit, callGasLimit } =
	// 		await ethers.provider.send("eth_estimateUserOperationGas", [
	// 			userOp,
	// 			EP_ADDRESS,
	// 		]);
	// 	userOp.preVerificationGas = preVerificationGas;
	// 	userOp.verificationGasLimit = verificationGasLimit;
	// 	userOp.callGasLimit = callGasLimit;
	// } catch (err) {
	// 	console.log(err);
	// }

	// const { maxFeePerGas } = await ethers.provider.getFeeData();
	// userOp.maxFeePerGas = "0x" + maxFeePerGas?.toString(16);

	// const maxPriorityFeePerGas = await ethers.provider.send(
	// 	"rundler_maxPriorityFeePerGas"
	// );
	// userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

	// const userOpHash1 = await entryPoint.getUserOpHash(userOp);

	// const signatureWithModuleAddress1 = defaultAbi.encode(
	// 	["bytes", "address"],
	// 	[await signer0.signMessage(ethers.getBytes(userOpHash1)), ECDSASM_ADDRESS]
	// );
	// userOp.signature = signatureWithModuleAddress1;
	// console.log({ userOp });

	// const opHash = await ethers.provider.send("eth_sendUserOperation", [
	// 	userOp,
	// 	EP_ADDRESS,
	// ]);

	// const receipt = await ethers.provider.waitForTransaction(opHash);
	// console.log("Transaction has been mined");
	// console.log(receipt);

	// let transactionHash;
	// while (!transactionHash || transactionHash == null) {
	// 	await ethers.provider
	// 		.send("eth_getUserOperationByHash", [opHash])
	// 		.then((res) => {
	// 			if (res != null) {
	// 				transactionHash = res.transactionHash;
	// 			}
	// 			// console.log(res);
	// 		});
	// }
	// console.log(transactionHash);

	// setTimeout(async () => {
	// 	const { transactionHash } = await ethers.provider.send(
	// 		"eth_getUserOperationByHash",
	// 		[opHash]
	// 	);

	// 	console.log(transactionHash);
	// }, 50000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
