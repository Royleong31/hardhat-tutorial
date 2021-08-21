import Child from "../Child";
import { Link } from "react-router-dom";

export default function HomePage({ tokenData, tokenBalance }) {
	return (
		<div>
			<h1>Home Page</h1>
			<p>Contract Owner: {tokenData.owner}</p>
			<p>
				Total Supply: {tokenData.totalSupply} {tokenData.symbol}
			</p>

			<Child {...tokenData} tokenBalance={tokenBalance} />

			<Link to="/transfer">Transfer</Link>
			<Link to="/buy">Buy</Link>
		</div>
	);
}
