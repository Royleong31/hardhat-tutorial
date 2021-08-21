// const { expect } = require("chai");
// const assert = require("assert");

// const {
// 	BN, // Big Number support
// 	constants, // Common constants, like the zero address and largest integers
// 	expectEvent, // Assertions for emitted events
// 	expectRevert, // Assertions for transactions that should fail
// } = require("@openzeppelin/test-helpers");

// describe("Token contract", () => {
// 	let Token, token, owner, addr1, addr2;

// 	beforeEach(async () => {
// 		Token = await ethers.getContractFactory("Token");
// 		token = await Token.deploy();
// 		[owner, addr1, addr2, _] = await ethers.getSigners();
// 	});

// 	describe("Deployment", () => {
// 		it("Should set the right owner", async () => {
// 			expect(await token.owner()).to.equal(owner.address);
// 		});

// 		it("should assign the total supply of tokens to the owner", async () => {
// 			const ownerBalances = await token.balanceOf(owner.address);
// 			const totalSupply = await token.totalSupply();

// 			assert.strictEqual(ownerBalances.toNumber(), totalSupply.toNumber());
// 		});
// 	});

// 	describe("Transactions", () => {
// 		it("Should transfer tokens between accounts", async () => {
// 			await token.transfer(addr1.address, 50);
// 			const addr1Balance = await token.balanceOf(addr1.address);
// 			assert.strictEqual(+addr1Balance, 50); //?: Need to convert BigNumber to number

// 			await token.connect(addr1).transfer(addr2.address, 50);
// 			const addr2Balance = await token.balanceOf(addr2.address);
// 			assert.strictEqual(+addr2Balance, 50);

// 			const ownerBalance = await token.balanceOf(owner.address);
// 			assert.strictEqual(ownerBalance.toNumber(), 999950);
// 		});

// 		it("Should fail if sender does not have enough tokens", async () => {
// 			await expect(token.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith(
// 				"Not enough tokens"
// 			);
// 		});

// 		it("Should update balances after transfers", async () => {
// 			const initialOwnerBalance = await token.balanceOf(owner.address);

// 			await token.transfer(addr1.address, 100);
// 			await token.transfer(addr2.address, 50);
// 			const finalOwnerBalance = await token.balanceOf(owner.address);
// 			expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

// 			const addr1Balance = await token.balanceOf(addr1.address);
// 			assert.strictEqual(+addr1Balance, 100);

// 			const addr2Balance = await token.balanceOf(addr2.address);
// 			expect(addr2Balance).to.be.equal(50);
// 		});
// 	});
// });

const { expect, assert } = require("chai");

const {
	BN, // Big Number support
	constants, // Common constants, like the zero address and largest integers
	expectEvent, // Assertions for emitted events
	expectRevert, // Assertions for transactions that should fail
	ether,
	balance,
} = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const TokenContract = artifacts.require("Token");

contract("Token", accounts => {
	const [owner, addr1, addr2] = accounts;
	let token;

	beforeEach(async () => {
		token = await TokenContract.new();
	});

	describe("Deployment", () => {
		it("Should set the right owner", async () => {
			expect(await token.owner()).to.equal(owner);
		});

		it("should assign the total supply of tokens to the owner", async () => {
			const ownerBalances = await token.balanceOf(owner);
			const totalSupply = await token.totalSupply();

			assert.strictEqual(ownerBalances.toNumber(), totalSupply.toNumber());
		});
	});

	describe("Transactions", () => {
		it("Should transfer tokens between accounts", async () => {
			await token.transfer(addr1, 50);
			const addr1Balance = await token.balanceOf(addr1);
			assert.strictEqual(addr1Balance.toNumber(), 50); //?: Need to convert BigNumber to number

			const transfer50FromAddr2 = await token.transfer(addr2, 50, { from: addr1 });
			const addr2Balance = await token.balanceOf(addr2);
			assert.strictEqual(addr2Balance.toNumber(), 50); // ?: addr2Balance is a BN type object (not BigNumber, it's actually a library). .toNumber() converts BN to number but only works until 53 bits

			expectEvent(transfer50FromAddr2, "Transfer", {
				from: addr1,
				to: addr2,
				amount: new BN(50),
			});

			const ownerBalance = await token.balanceOf(owner);
			assert.strictEqual(ownerBalance.toNumber(), 999950);
		});

		it("Should fail if sender does not have enough tokens", async () => {
			await expectRevert(token.transfer(owner, 1, { from: addr1 }), "Not enough token");
		});

		it("Should fail if sender tries to send 0 ether", async () => {
			await expectRevert(token.transfer(addr1, 0), "Transfer amount needs to be positive");
		});

		it("Should update balances after transfers", async () => {
			const initialOwnerBalance = await token.balanceOf(owner);

			await token.transfer(addr1, 100);
			await token.transfer(addr2, 50);
			const finalOwnerBalance = await token.balanceOf(owner);
			expect(finalOwnerBalance.toNumber()).to.equal(initialOwnerBalance - 150);

			const addr1Balance = await token.balanceOf(addr1);
			assert.strictEqual(addr1Balance.toNumber(), 100);

			const addr2Balance = await token.balanceOf(addr2);
			expect(addr2Balance.toNumber()).to.be.equal(50);
		});
	});

	describe("Purchasing tokens", async () => {
		it("successfully sells tokens", async () => {
			const oldAddr1Balance = (await token.balanceOf(addr1)).toNumber();
			const oldOwnerBalance = (await token.balanceOf(owner)).toNumber();
			await token.buyTokens(3, { from: addr1, value: web3.utils.toWei("3", "ether") });

			const newAddr1Balance = (await token.balanceOf(addr1)).toNumber();
			const newOwnerBalance = (await token.balanceOf(owner)).toNumber();

			assert.strictEqual(newAddr1Balance - oldAddr1Balance, 3);
			assert.strictEqual(newOwnerBalance - oldOwnerBalance, -3);
		});

		it("Owner cannot buy tokens", async () => {
			await expectRevert(
				token.buyTokens(5, { value: web3.utils.toWei("5", "ether") }),
				"Owner cannot buy tokens"
			);
		});

		it("Cannot buy tokens if amount is wrong", async () => {
			await expectRevert(
				token.buyTokens(10, { from: addr1, value: web3.utils.toWei("11", "ether") }),
				"Wrong amount sent"
			);
		});

		it("ether is transferred from buyer to owner", async () => {
      // !: Need to convert to BN as the number is too large and will cause errors if calculations are done on normal js numbers
			const oldOwnerBalance = new BN(await web3.eth.getBalance(owner));
			const oldAddr1Balance = new BN(await web3.eth.getBalance(addr1));

			const transaction = await token.buyTokens(2, {
				from: addr1,
				value: web3.utils.toWei("2", "ether"),
			});

			const newOwnerBalance = new BN(await web3.eth.getBalance(owner));
			const newAddr1Balance = new BN(await web3.eth.getBalance(addr1));

      // ?: Gas cost paid by addr1 because of the transaction
			const gasCost = new BN(
				+transaction.receipt.effectiveGasPrice * +transaction.receipt.cumulativeGasUsed
			);

			assert.strictEqual(newOwnerBalance.sub(oldOwnerBalance).toString(), "2000000000000000000");
      // ?: old amt - gas - amt paid = new amt
			assert.strictEqual(oldAddr1Balance.sub(gasCost).sub(newAddr1Balance).toString(), "2000000000000000000"); 

			expectEvent(transaction, "TokenPurchase", {
				from: addr1,
				numberOfTokens: new BN("2"),
				amount: web3.utils.toWei("2", "ether"),
			});
		});
	});
});
