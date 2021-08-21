import BuyTokens from "../BuyTokens";
import { Link } from "react-router-dom";
import Child from "../Child";

export default function PurchasePage({ tokenData, tokenBalance, onBuyTokens }) {
	return (
		<>
			<h1>Buy Tokens</h1>
			<Child {...tokenData} tokenBalance={tokenBalance} />

			<BuyTokens {...tokenData} onBuyTokens={onBuyTokens} />
			<Link to="/">Home</Link>
			<Link to="/transfer">Transfer</Link>
		</>
	);
}
