// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RefuseBotBounty
 * @dev Bounty escrow contract for RefuseBot challenge
 * 
 * Features:
 * - One-time claim (first winner takes all)
 * - Owner can fund and withdraw
 * - Supports ETH and ERC20 tokens (USDC)
 * - Claim requires signature from backend
 */
contract RefuseBotBounty is ReentrancyGuard, Ownable {
    
    // Bounty state
    bool public claimed;
    address public winner;
    uint256 public claimTimestamp;
    uint256 public bountyAmount;
    
    // USDC on Base
    IERC20 public immutable USDC;
    
    // Backend signer (for verification)
    address public backendSigner;
    
    // Events
    event BountyFunded(address indexed funder, uint256 amount);
    event BountyClaimed(address indexed winner, uint256 amount, uint256 timestamp);
    event BackendSignerUpdated(address indexed newSigner);
    
    // Errors
    error BountyAlreadyClaimed();
    error InvalidSignature();
    error InsufficientBalance();
    error TransferFailed();
    
    constructor(address _usdcAddress, address _backendSigner) {
        USDC = IERC20(_usdcAddress);
        backendSigner = _backendSigner;
    }
    
    /**
     * @dev Fund the bounty with USDC
     */
    function fundBounty(uint256 amount) external onlyOwner {
        require(USDC.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        bountyAmount += amount;
        emit BountyFunded(msg.sender, amount);
    }
    
    /**
     * @dev Claim bounty (requires backend signature)
     * @param signature Backend signature proving win condition was met
     */
    function claimBounty(bytes memory signature) external nonReentrant {
        if (claimed) revert BountyAlreadyClaimed();
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender));
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        
        if (recoverSigner(ethSignedMessageHash, signature) != backendSigner) {
            revert InvalidSignature();
        }
        
        uint256 balance = USDC.balanceOf(address(this));
        if (balance == 0) revert InsufficientBalance();
        
        // Mark as claimed
        claimed = true;
        winner = msg.sender;
        claimTimestamp = block.timestamp;
        
        // Transfer bounty
        require(USDC.transfer(msg.sender, balance), "Transfer failed");
        
        emit BountyClaimed(msg.sender, balance, block.timestamp);
    }
    
    /**
     * @dev Emergency withdraw (owner only, if no one wins)
     */
    function emergencyWithdraw() external onlyOwner {
        require(!claimed, "Already claimed");
        uint256 balance = USDC.balanceOf(address(this));
        require(USDC.transfer(owner(), balance), "Transfer failed");
    }
    
    /**
     * @dev Update backend signer
     */
    function updateBackendSigner(address newSigner) external onlyOwner {
        backendSigner = newSigner;
        emit BackendSignerUpdated(newSigner);
    }
    
    /**
     * @dev Get current bounty balance
     */
    function getBountyBalance() external view returns (uint256) {
        return USDC.balanceOf(address(this));
    }
    
    // Signature verification helpers
    function getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }
    
    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
    
    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
