import { useState, useEffect } from "react";
import Token from "./Token.json";

import getBlockchain from "./ethereum.js";
import EthersContext from "./ethersContext.js";
import { ethers, Contract } from "ethers";

import HomePage from "./pages/HomePage.js";
import PurchasePage from "./pages/PurchasePage.js";
import TransferPage from "./pages/TransferPage.js";

import { Route, Switch, Redirect } from "react-router-dom";

// const HARDHAT_NETWORK_ID = "31337";
const HARDHAT_NETWORK_ID = "4";
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export default function App() {
	// const [token, setToken] = useState(undefined);
	const [tokenData, setTokenData] = useState(); // { name: "", symbol: "", totalSupply: 0, owner: "" }
	const [userTokenBalance, setUserTokenBalance] = useState();
	const [selectedAddress, setSelectedAddress] = useState();
	const [txBeingSent, setTxBeingSent] = useState();
	const [transactionError, setTransactionError] = useState();
	const [networkError, setNetworkError] = useState();

	const [provider, setProvider] = useState();
	const [token, setToken] = useState();
	useEffect(() => {
		// const init = async () => {
		// 	const { token, signerAddress, provider } = await getBlockchain();
		// 	setToken(token);
		// 	setProvider(provider);
		// 	setTokenData({
		// 		name: await token.name(),
		// 		symbol: await token.symbol(),
		// 		totalSupply: (await token.totalSupply()).toNumber(),
		// 		owner: await token.owner(),
		// 	});
		// 	const [selectedAddress] = await window.ethereum.enable();
		// 	setSelectedAddress(selectedAddress);
		// 	setUserTokenBalance((await token.balanceOf(selectedAddress)).toNumber());
		// };
		// init();

		connectWallet();
	}, []);

	const accountsChangedHandler = ([newAddress]) => {
		if (newAddress === undefined) return _resetState();

		_initialize();
	};

	const networkChangeHandler = ([networkId]) => {
		// ?: The user will be asked to connect wallet again
		// TODO: Make sure the user reconnects wallet
		_resetState();
		connectWallet();
		console.log("inside network changed listener");
	};

	async function connectWallet() {
		// ?: Remove any previous listeners to prevent outdated listeners from lingering after the network is changed
		window.ethereum.removeListener("accountsChanged", accountsChangedHandler);
		window.ethereum.removeListener("networkChanged", networkChangeHandler);

		window.ethereum.on("accountsChanged", accountsChangedHandler);

		// ?: Reset State if the network is changed
		window.ethereum.on("networkChanged", networkChangeHandler);

		console.log("connecting wallet");

		if (_checkNetwork()) {
			_initialize();
		}
	}

	// ?: Runs when user connects wallet or when the user changes account
	// ?: store token contract in token, store the token symbol and name in tokenData, and update user's balance every 1s
	async function _initialize() {
		// await _intializeContract(); // ?: store token contract in a variable

		await window.ethereum.enable();

		// ?: Initialise contract and provider
		const _provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = _provider.getSigner();
		const signerAddress = await signer.getAddress();

		const _token = new Contract(Token.address, Token.abi, signer);

		// set the states
		setProvider(_provider);
		setSelectedAddress(signerAddress);
		setToken(_token);

		setTokenData({
			name: await _token.name(),
			symbol: await _token.symbol(),
			totalSupply: (await _token.totalSupply()).toNumber(),
			owner: await _token.owner(),
		});

		// !: _updateBalance does not work here. Maybe it's because it is run on the same render cycle so state is not updated
		const balance = await _token.balanceOf(signerAddress);
		setUserTokenBalance(balance);
	}

	// ?: Updates every 1s and also when transaction succeeds
	async function _updateBalance() {
		const balance = await token.balanceOf(selectedAddress);
		setUserTokenBalance(balance);
		console.log(`updating balance: ${balance}`);
	}

	// TODO: In case user fails to connect wallet, connect again
	function _dismissNetworkError() {
		setNetworkError();
	}

	// ?: This is an utility method that turns an RPC error into a human readable message.
	function _getRpcErrorMessage(error) {
		if (error.data) {
			return error.data.message;
		}

		return error.message;
	}

	// ?: Runs when either the account is deleted or the network is changed. User will
	function _resetState() {
		setTokenData();
		setUserTokenBalance();
		setSelectedAddress();
		setTxBeingSent();
		setTransactionError();
		setNetworkError();
	}

	// ?: Checks if selected network is Localhost:8545
	function _checkNetwork() {
		if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
			return true;
		}

		setNetworkError("Plese connect metamask to Rinkeby Test Network");

		return false;
	}

	async function _transferTokens(to, amount) {
		try {
			// ?: Remove any prior transaction errors
			setTransactionError();

			// We send the transaction, and save its hash in the Dapp's state. This
			// way we can indicate that we are waiting for it to be mined.
			// ?: Store the tx hash. This function may throw an error, for example when the user tries to transfer more than he has
			const tx = await token.transfer(to, amount);
			// ?: txBeingSent will be shown in a banner to tell the user that the transaction is mining
			setTxBeingSent(tx.hash);
			console.log(tx);

			// We use .wait() to wait for the transaction to be mined. This method
			// returns the transaction's receipt.
			const receipt = await tx.wait();
			console.log(receipt);

			// ?: if receipt.status === 0, it means that there's an error
			if (receipt.status === 0) {
				// We can't know the exact error that made the transaction fail when it
				// was mined, so we throw this generic one.
				throw new Error("Transaction failed");
			}

			// ?: Transaction succeeded, update balance as it has changed
			await _updateBalance();
		} catch (error) {
			// We check the error code to see if this error was produced because the
			// user rejected a tx. If that's the case, we do nothing.
			if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
				return;
			}

			// Other errors are logged and stored in the Dapp's state. This is used to
			// show them to the user, and for debugging.
			console.error(error);
			setTransactionError(error);
		} finally {
			// ?: Remove the transaction loading banner
			setTxBeingSent();
		}
	}

	async function _buyTokens(tokenNum) {
		try {
			// ?: Remove any prior transaction errors
			setTransactionError();
			const tx = await token.buyTokens(tokenNum, { value: ethers.utils.parseEther(tokenNum) });

			// ?: txBeingSent will be shown in a banner to tell the user that the transaction is mining
			setTxBeingSent(tx.hash);
			console.log(tx);
			const receipt = await tx.wait();
			console.log(receipt);

			// ?: if receipt.status === 0, it means that there's an error
			if (receipt.status === 0) {
				// We can't know the exact error that made the transaction fail when it
				// was mined, so we throw this generic one.
				throw new Error("Transaction failed");
			}

			// ?: Transaction succeeded, update balance as it has changed
			await _updateBalance();
		} catch (error) {
			// We check the error code to see if this error was produced because the
			// user rejected a tx. If that's the case, we do nothing.
			console.log(error);
			if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
				return;
			}

			// Other errors are logged and stored in the Dapp's state. This is used to
			// show them to the user, and for debugging.
			console.error(error);
			setTransactionError(error);
		} finally {
			// ?: Remove the transaction loading banner
			setTxBeingSent();
		}
	}

	if (networkError) {
		console.log(networkError);
		return <h1>{networkError}</h1>;
	}

	if (transactionError) {
		console.log(transactionError);
		return <h1>{_getRpcErrorMessage(transactionError)}</h1>;
	}

	if (!userTokenBalance || !tokenData || !selectedAddress) {
		return "Loading...";
	}

	return (
		<EthersContext.Provider value={{ account: selectedAddress, contract: token, provider }}>
			<div>
				<button onClick={connectWallet}>Connect Wallet</button>

				<h5>{txBeingSent ? txBeingSent : ""}</h5>

				<Switch>
					<Route path="/" exact>
						<HomePage tokenData={tokenData} tokenBalance={userTokenBalance.toString()} />
					</Route>

					<Route path="/buy" exact>
						<PurchasePage
							tokenData={tokenData}
							tokenBalance={userTokenBalance.toString()}
							onBuyTokens={_buyTokens}
						/>
					</Route>

					<Route path="/transfer" exact>
						<TransferPage
							onTransfer={_transferTokens}
							tokenData={tokenData}
							tokenBalance={userTokenBalance.toString()}
						/>
					</Route>
				</Switch>
			</div>
		</EthersContext.Provider>
	);
}
