import { useRef, useContext } from "react";
import EthersContext from "./ethersContext";

export default function Transfer({ onTransfer }) {
	const { account, contract, provider } = useContext(EthersContext);
	const toRef = useRef();
	const amountRef = useRef();

	const submitHandler = async event => {
		event.preventDefault();
		const transferToAdd = toRef.current.value;
		const amount = amountRef.current.value;
		console.log(`Amount: ${amount}`);
		console.log(`Transfer to: ${transferToAdd}`);

		// const tx = await contract.transfer(transferToAdd, amount);
		// console.log(tx);
		// const receipt = await tx.wait();
		// console.log(receipt);
		onTransfer(transferToAdd, amount);
	};

	return (
		<form onSubmit={submitHandler}>
			<div>
				<label htmlFor="to">Transfer To</label>
				<input ref={toRef} type="text" name="to" />
			</div>

			<div>
				<label htmlFor="amount">Amount</label>
				<input ref={amountRef} type="number" name="amount" id="amount" />
			</div>

			<button type="submit">Transfer</button>
		</form>
	);
}
