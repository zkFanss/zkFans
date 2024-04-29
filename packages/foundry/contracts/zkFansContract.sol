//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract zkFansContract {

    address contractOwner;

    struct Content {
        string CID;
        string hashedContent;
    }

    struct Profile {
        address payable owner;
        string username;
        mapping(address => bool) fans;
        mapping(string => Content) content;
        mapping(address => bool) isFan;
    }

    mapping(address => Profile) private profiles;

    event SubscribedTo(address indexed subscriber, address indexed profile);
    event SubscriptionRevoked(address indexed from, address indexed to);
    event ContentAdded(string cid);

    constructor(address initialOwner) {
        contractOwner = initialOwner;
    }

    modifier onlyProfileOwner(address _addr) {
        require(msg.sender == profiles[_addr].owner, "Only the profile owner can perform this operation");
        _;
    }

    modifier onlySubscriberOrOwner(address _addr1, address _addr2) {
        require(msg.sender == profiles[_addr1].owner || profiles[_addr1].fans[_addr2], "Only the profile owner or a subscriber can perform this operation");
        _;
    }

    function setProfileOwner(address payable owner) public onlyProfileOwner(owner) {
        Profile storage profile = profiles[owner];
        profile.owner = owner;
    }

    function getProfileUserName(address _owner) public view returns (string memory) {
         return profiles[_owner].username;
    }

    function addProfile(address payable _addr, string memory _name) public {
        require(_addr == msg.sender, "Only you can add yourself");
        Profile storage profile = profiles[_addr];
        profile.owner = _addr;
        profile.username = _name;
    }

    function addContent(string memory _hash, string memory cid) public onlyProfileOwner(msg.sender) {
        Profile storage profile = profiles[msg.sender];
        profile.content[_hash].CID = cid;
        profile.content[_hash].hashedContent = _hash;
        emit ContentAdded(cid);
    }

    function getContent(address _addr, string memory _hash) public view onlySubscriberOrOwner(_addr, msg.sender) returns (string memory) {
        Profile storage profile = profiles[_addr];
        return profile.content[_hash].CID;
    }

    function subscribeToProfile(address payable _profile) public payable {
        require(msg.sender != _profile, "You cannot subscribe to your own profile");
        require(msg.value > 0, "You must send some ETH to subscribe");

        Profile storage profile = profiles[_profile];
        profile.fans[msg.sender] = true;

        Profile storage subscriberProfile = profiles[msg.sender];
        subscriberProfile.isFan[_profile] = true;

        _profile.transfer(msg.value);

        emit SubscribedTo(msg.sender, _profile);
    }

    function isSubscribedToProfile(address owner, address subscriber) public view returns (bool) {
        Profile storage profile = profiles[owner];
        return profile.fans[subscriber];
    }

    function revokeSubscription(address to) onlySubscriberOrOwner(to, msg.sender) public {
        require(msg.sender != to, "You cannot revoke subscription from your own profile");

        Profile storage profile = profiles[to];
        profile.fans[msg.sender] = false;

        Profile storage subscriberProfile = profiles[msg.sender];
        subscriberProfile.isFan[to] = false;

        emit SubscriptionRevoked(msg.sender, to);
    }
}