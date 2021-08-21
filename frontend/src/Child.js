import { useEffect, useContext, useState } from "react";
import EthersContext from "./ethersContext";
import { ethers, Contract } from "ethers";

export default function Child({ name, symbol, totalSupply, owner, tokenBalance }) {
	const { account, contract, provider } = useContext(EthersContext);
	// const [tokenBalance, setTokenBalance] = useState("0");
	const [ethBalance, setEthBalance] = useState("0");

	useEffect(() => {
		// console.log('inside useEffect of child.js');
		// contract.balanceOf(account).then(bal => {
		// 	setTokenBalance(bal.toString());
		// });

		provider.getBalance(account).then(bal => {
			const balanceInEth = ethers.utils.formatEther(bal);
			setEthBalance(balanceInEth);
		});
		// ?: account needs to be a dependency otherwise it will not change when the account changes
	}, [account]);

	return (
		<div>
			<hr />
			<h5>Contract Address: {contract.address}</h5>
			<h3>Current user account: {account}</h3>
			<h6>
				Account token Balance: {tokenBalance} {symbol}
			</h6>
			<h6>Ether balance: {ethBalance} ETH</h6>
			<hr />
		</div>
	);
}
