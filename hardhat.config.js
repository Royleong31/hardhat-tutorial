require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");

// !: NEED to add 0x in front of the private key address

module.exports = {
	solidity: "0.8.0",
	networks: {
		rinkeby: {
			url: INFURA_RINKEBY_URL,
			accounts: [PRIVATE_KEY],
		},
	},
};

/*
in console, type
1) npx hardhat run scripts/deploy.js
	- If done without any other details, it will deploy on local network(not ganache) but will die immediately after so can't interact with it.
	
2) npx hardhat run scripts/deploy.js --network rinkeby	
	- Deploys contract to rinkeby test network.
	- Use the contract ABI and address to interact with the contract in the front end

3) npx hardhat run scripts/deploy.js --network localhost
	- IMPT!!! Need to run npx hardhat node in another terminal in order to start the local network. It is like ganache CLI.
	- Deploys to localhost: 8545 by default
*/
