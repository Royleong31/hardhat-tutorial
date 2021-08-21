import { useState, useContext, useRef } from "react";
import EthersContext from "./ethersContext";
import { ethers, Contract } from "ethers";

export default function BuyTokens({ name, symbol, totalSupply, owner, onBuyTokens }) {
	const { account, contract, provider } = useContext(EthersContext);
	const [tokenPrice, setTokenPrice] = useState();
	const tokenNumRef = useRef();

	const submitHandler = async event => {
		event.preventDefault();

		const tokenNum = tokenNumRef.current.value;
		const amtToBePaid = ethers.utils.parseEther(tokenNum);

		// try {
		// 	const tx = await contract.buyTokens(tokenNum, { value: amtToBePaid });

		// 	console.log(tx);
		// 	const receipt = await tx.wait(tx);
		// 	console.log(receipt);
		// } catch (error) {
		// 	console.log(error.data.message);
		// }
		onBuyTokens(tokenNum);
	};

	return (
		<form onSubmit={submitHandler}>
			<p>Token Price: 1 ETH</p>

			<label htmlFor="numOfTokens">Number of Tokens</label>
			<input ref={tokenNumRef} type="number" name="numOfTokens" id="numOfTokens" />

			<button type="submit">Buy Tokens</button>
		</form>
	);
}
