// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract FeedbackPayment {
    error NotOwner();
    error IncorrectAmount();

    mapping(address => bool) public hasPaid;
    address immutable owner;

    constructor(){
        owner = msg.sender; 
    }
 
    function pay() external payable {
        if (msg.value < 0.02 ether){
            revert IncorrectAmount();
        }
        hasPaid[msg.sender] = true;
    }

    function withdraw() public {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success);
    }

    fallback() external payable {}
    receive() external payable {}
}
