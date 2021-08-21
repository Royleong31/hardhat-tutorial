// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract Token {
  string public name = 'My Hardhat Token';
  string public symbol = 'MHT';
  uint public totalSupply = 1000000;
  address public owner;
  mapping(address => uint) balances;
  uint tokenPrice = 1 ether;

  event Transfer(address from, address to, uint amount);
  event TokenPurchase(address from, uint numberOfTokens, uint amount);

  constructor() {
    balances[msg.sender] = totalSupply;
    owner = msg.sender;
  }

  function transfer(address to, uint amount) external {
    require(balances[msg.sender] >= amount, 'Not enough tokens');
    require(amount > 0, 'Transfer amount needs to be positive');
    balances[msg.sender] -= amount;
    balances[to] += amount;
    // console.log('Sender balance is %s tokens', balances[msg.sender]);
    // console.log('Trying to send %s tokens to %s', amount, to);

    emit Transfer(msg.sender, to, amount);
  }

  function balanceOf(address account) external view returns(uint) {
    return balances[account];
  }

  function buyTokens(uint numberOfTokens) public payable {
    console.log('Value: %s', msg.value);
    require(msg.sender != owner, 'Owner cannot buy tokens');
    require(balances[owner] >= numberOfTokens, 'Insufficient Tokens');

    uint price = numberOfTokens * tokenPrice;
    require(msg.value == price, 'Wrong amount sent');

    balances[owner] -= numberOfTokens;
    balances[msg.sender] += numberOfTokens;
    payable(owner).transfer(msg.value);

    emit TokenPurchase(msg.sender, numberOfTokens, price);
  }
}