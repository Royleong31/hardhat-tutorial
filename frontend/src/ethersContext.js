import { createContext } from "react";

const EthersContext = createContext({
	web3: undefined,
	contract: undefined,
	account: undefined,
});

export default EthersContext;
