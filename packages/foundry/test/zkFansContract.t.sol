// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/zkFansContract.sol";

contract YourContractTest is Test {
    zkFansContract public zkFans;

    // function setUp() public {
    //     zkFans = new zkFansContract(vm.addr(1));
    // }

    // function testMessageOnDeployment() public view {
    //     require(
    //         keccak256(bytes(zkFans.greeting()))
    //             == keccak256("Building Unstoppable Apps!!!")
    //     );
    // }

    // function testSetNewMessage() public {
    //     zkFans.setGreeting("Learn Scaffold-ETH 2! :)");
    //     require(
    //         keccak256(bytes(zkFans.greeting()))
    //             == keccak256("Learn Scaffold-ETH 2! :)")
    //     );
    // }
}
