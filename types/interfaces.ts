interface UserOp {
	sender?: string; // smart account address
	nonce: string;
	initCode: string;
	callData: string;
	callGasLimit?: Number;
	verificationGasLimit?: Number;
	preVerificationGas?: Number;
	maxFeePerGas?: string;
	maxPriorityFeePerGas?: string;
	paymasterAndData: string;
	signature: string;
}
