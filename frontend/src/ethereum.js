import { ethers, Contract } from "ethers";
import Token from "./Token.json";

const getBlockchain = () =>
	new Promise((resolve, reject) => {
		window.addEventListener("load", async () => {
			if (window.ethereum) {
				// ?: This enables the window.ethereum and also returns an array containing the address of the current account
				const [address] = await window.ethereum.enable();

				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const signer = provider.getSigner();
				const signerAddress = await signer.getAddress();

				const token = new Contract(Token.address, Token.abi, signer);

				resolve({ signerAddress, token, provider });
			}
			resolve({ signerAddress: undefined, token: undefined });
		});
	});

export default getBlockchain;
