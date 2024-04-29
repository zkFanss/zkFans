//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

contract zkFansContract {

    address contractOwner;

    struct Content {
        string CID;
        string hashedContent;
        mapping(address => bool) subscribers;
    }

    struct Profile {
        address payable owner;
        mapping(address => bool) subscribers;
        mapping(string => Content) content;
        mapping(address => bool) subscribed;
        mapping(address => bool) isSubscribedToContent;
    }

    mapping(address => Profile) private profiles;

    event ContentPaid(address indexed buyer, string cid);
    event SubscribedTo(address indexed subscriber, address indexed profile);
    event SubscribedToContent(address indexed subscriber, string indexed cid);
    event SubscriptionRevoked(address indexed from, address indexed to);

    constructor(address initialOwner) {
        contractOwner = initialOwner;
    }

    modifier onlyProfileOwner(address owner) {
        require(msg.sender == profiles[owner].owner, "Only the profile owner can perform this operation");
        _;
    }

    modifier onlySubscribedOrOwner(address owner) {
        require(msg.sender == profiles[owner].owner || profiles[owner].subscribers[msg.sender], "Only the profile owner or a subscriber can perform this operation");
        _;
    }

    modifier hasPaidForContent(address owner, string memory _hash) {
        require(profiles[owner].content[_hash].subscribers[msg.sender], "Only paid subscribers can access this content");
        _;
    }

    function setProfileOwner(address payable owner) public onlyProfileOwner(owner) {
        Profile storage profile = profiles[owner];
        profile.owner = owner;
    }

    function getProfile(address owner) public view returns (address) {
         return profiles[owner].owner;
    }

    function addProfile(address payable _addr) public {
        Profile storage profile = profiles[_addr];
        profile.owner = _addr;
    }

    function addContent(string memory _hash, string memory cid) public onlyProfileOwner(msg.sender) {
        Profile storage profile = profiles[msg.sender];
        profile.content[_hash].CID = cid;
    }

    function getContent(address _address, string memory _hash) public view onlySubscribedOrOwner(_address) hasPaidForContent(_address, _hash) returns (string memory) {
        Profile storage profile = profiles[_address];
        return profile.content[_hash].CID;
    }

    function subscribeToProfile(address payable _profile) public payable {
        require(msg.sender != _profile, "You cannot subscribe to your own profile");
        require(msg.value > 0, "You must send some ETH to subscribe");

        Profile storage profile = profiles[_profile];
        profile.subscribers[msg.sender] = true;

        Profile storage subscriberProfile = profiles[msg.sender];
        subscriberProfile.subscribed[_profile] = true;

        _profile.transfer(msg.value);

        emit SubscribedTo(msg.sender, _profile);
    }

    function subscribeToContent(address payable _profile, string memory _hash) public payable {
        require(msg.sender != _profile, "You cannot subscribe to your own profile");
        require(msg.value > 0, "You must send some ETH to subscribe");

        Profile storage profile = profiles[_profile];
        profile.content[_hash].subscribers[msg.sender] = true;

        Profile storage subscriberProfile = profiles[msg.sender];
        subscriberProfile.isSubscribedToContent[_profile] = true;

        _profile.transfer(msg.value);

        emit SubscribedToContent(msg.sender, profile.content[_hash].CID);
    }

    function isSubscribedToProfile(address owner, address subscriber) public view returns (bool) {
        Profile storage profile = profiles[owner];
        return profile.subscribers[subscriber];
    }

    function payForContent(address payable owner, string memory _hash) public payable {
        Profile storage profile = profiles[owner];
        Content storage content = profile.content[_hash];
        require(content.subscribers[msg.sender], "You must be a subscriber to access this content");
        require(msg.value > 0, "You must send some ETH to access this content");
        owner.transfer(msg.value);
        emit ContentPaid(msg.sender, content.CID);
    }

    function revokeSubscription(address to) onlySubscribedOrOwner(msg.sender) public {
        require(msg.sender != to, "You cannot revoke subscription from your own profile");

        Profile storage profile = profiles[to];
        profile.subscribers[msg.sender] = false;

        Profile storage subscriberProfile = profiles[msg.sender];
        subscriberProfile.subscribed[to] = false;

        emit SubscriptionRevoked(msg.sender, to);
    }
}