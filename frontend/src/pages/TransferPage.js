import Transfer from "../Transfer";
import { Link } from "react-router-dom";
import Child from "../Child";

import { useEffect, useContext, useState } from "react";
import EthersContext from "./../ethersContext";
import { ethers, Contract } from "ethers";

export default function TransferPage({ tokenData, onTransfer, tokenBalance }) {
	const { account, contract, provider } = useContext(EthersContext);
	const [owner, setOwner] = useState();

	useEffect(() => {
		contract.owner().then(o => {
			setOwner(o.toString());
		});
	}, []);

	return (
		<>
			<h1>Transfer Tokens</h1>

			<Child {...tokenData} tokenBalance={tokenBalance} />

			<p>Owner: {owner}</p>

			<Transfer onTransfer={onTransfer} />
			<Link to="/">Home</Link>
			<Link to="/buy">Buy</Link>
		</>
	);
}
