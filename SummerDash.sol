// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SummerDash
 * @dev Secure GameFi Architecture v1.1
 * Implements Backend Signing (Anti-Cheat), Anti-Bot Bonus Logic, and Tournament Enforcements.
 */
contract SummerDash {
    
    // --- ERC-20 Standard Variables ---
    string public name = "Summer Dash";
    string public symbol = "DASH";
    uint8 public decimals = 18;
    string public constant version = "1.1.0";
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // --- Game State Variables ---
    address public owner;
    address public teamWallet;
    address public backendSigner; // Trusted backend oracle
    
    uint256 public constant INITIAL_BONUS = 5000 * 10**18;
    uint256 public constant ENTRY_FEE = 1000 * 10**18;
    uint256 public constant DAILY_REWARD = 500 * 10**18;
    
    uint256 public tournamentDuration = 7 days;
    uint256 public currentTournamentId = 1;
    uint256 public tournamentEndTime;
    uint256 public totalPool;

    struct User {
        bool bonusClaimed;
        uint256 highScore;
        uint256 lastTournamentEntered;
        uint256 pendingWinnings;
        uint256 lastDailyClaim;
    }
    
    mapping(address => User) public users;
    mapping(uint256 => mapping(address => uint256)) public tournamentScores; // History
    address[10] public topTen;
    uint256[10] public topScores;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BonusClaimed(address indexed player, uint256 amount);
    event EntryRegistered(address indexed player, uint256 tournamentId, uint256 burned);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 tournamentId);
    event TournamentFinalized(uint256 tournamentId, uint256 poolAmount);
    event WinningsClaimed(address indexed player, uint256 amount);
    event DailyRewardClaimed(address indexed player, uint256 amount);

    constructor(address _teamWallet, address _backendSigner) {
        owner = msg.sender;
        teamWallet = _teamWallet;
        backendSigner = _backendSigner;
        tournamentEndTime = block.timestamp + tournamentDuration;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // --- ERC-20 Logic ---

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "Transfer to zero address");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function _mint(address _to, uint256 _amount) internal {
        require(totalSupply + _amount <= MAX_SUPPLY, "Would exceed max supply");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function _burn(address _from, uint256 _amount) internal {
        require(balanceOf[_from] >= _amount, "Burn amount exceeds balance");
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
        emit Transfer(_from, address(0), _amount);
    }

    // --- Core Game Functions ---

    /**
     * @dev REQUIREMENT: Bonus only claimable AFTER paying entry fee.
     * Prevents sybil bots from draining the supply for free.
     */
    function claimBonus() public {
        require(!users[msg.sender].bonusClaimed, "Already claimed");
        require(users[msg.sender].lastTournamentEntered == currentTournamentId, "Must enter tournament first");
        
        users[msg.sender].bonusClaimed = true;
        _mint(msg.sender, INITIAL_BONUS);
        emit BonusClaimed(msg.sender, INITIAL_BONUS);
    }

    /**
     * @dev Deducts fee, BURNS 10%, and puts 90% into the prize pool.
     * REQUIREMENT: Prevent multiple entries per tournament ID.
     */
    function enterTournament() public {
        require(users[msg.sender].lastTournamentEntered != currentTournamentId, "Already entered this round");
        require(balanceOf[msg.sender] >= ENTRY_FEE, "Insufficient $DASH");
        
        uint256 burnAmount = (ENTRY_FEE * 10) / 100;
        uint256 poolAmount = ENTRY_FEE - burnAmount;
        
        _burn(msg.sender, burnAmount);
        _transfer(msg.sender, address(this), poolAmount);
        
        users[msg.sender].lastTournamentEntered = currentTournamentId;
        totalPool += poolAmount;
        
        emit EntryRegistered(msg.sender, currentTournamentId, burnAmount);
    }

    /**
     * @dev REQUIREMENT: Verify backend signature to prevent fake scores.
     */
    function submitScore(uint256 _score, bytes memory _signature) public {
        require(users[msg.sender].lastTournamentEntered == currentTournamentId, "Must enter first");
        
        // Verify Cryptographic Signature
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, _score, currentTournamentId));
        bytes32 ethSignedMessageHash = _getEthSignedMessageHash(messageHash);
        require(_recoverSigner(ethSignedMessageHash, _signature) == backendSigner, "Invalid score signature");
        
        // Update per-tournament history
        if (_score > tournamentScores[currentTournamentId][msg.sender]) {
            tournamentScores[currentTournamentId][msg.sender] = _score;
            
            // Update global personal high score and leaderboard
            if (_score > users[msg.sender].highScore) {
                users[msg.sender].highScore = _score;
                _updateLeaderboard(msg.sender, _score);
            }
        }
        
        emit ScoreSubmitted(msg.sender, _score, currentTournamentId);
    }

    // --- Internal Helpers ---

    function _updateLeaderboard(address _player, uint256 _score) private {
        for (uint i = 0; i < 10; i++) {
            if (_score > topScores[i]) {
                for (uint j = 9; j > i; j--) {
                    topScores[j] = topScores[j-1];
                    topTen[j] = topTen[j-1];
                }
                topScores[i] = _score;
                topTen[i] = _player;
                break;
            }
        }
    }

    // --- Signature Verification Helpers ---

    function _getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _splitSignature(bytes memory _sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }

    // --- Tournament Management ---

    function finalizeTournament() public onlyOwner {
        require(block.timestamp >= tournamentEndTime, "Tournament not over");
        
        _allocateWinnings(topTen[0], (totalPool * 40) / 100);
        _allocateWinnings(topTen[1], (totalPool * 20) / 100);
        _allocateWinnings(topTen[2], (totalPool * 10) / 100);
        for (uint i = 3; i < 10; i++) {
            _allocateWinnings(topTen[i], (totalPool * 2) / 100);
        }
        
        uint256 teamShare = totalPool - ((totalPool * 84) / 100);
        balanceOf[teamWallet] += teamShare;
        emit Transfer(address(this), teamWallet, teamShare);

        emit TournamentFinalized(currentTournamentId, totalPool);
        
        currentTournamentId++;
        totalPool = 0;
        tournamentEndTime = block.timestamp + tournamentDuration;
        
        for (uint i = 0; i < 10; i++) {
            topScores[i] = 0;
            topTen[i] = address(0);
        }
    }

    function _allocateWinnings(address _winner, uint256 _amount) private {
        if (_winner != address(0)) {
            users[_winner].pendingWinnings += _amount;
        }
    }

    function claimWinnings() public {
        uint256 winnings = users[msg.sender].pendingWinnings;
        require(winnings > 0, "No winnings");
        users[msg.sender].pendingWinnings = 0;
        _transfer(address(this), msg.sender, winnings);
        emit WinningsClaimed(msg.sender, winnings);
    }

    function claimDailyReward() public {
        require(block.timestamp >= users[msg.sender].lastDailyClaim + 1 days, "Reward not ready");
        users[msg.sender].lastDailyClaim = block.timestamp;
        _mint(msg.sender, DAILY_REWARD);
        emit DailyRewardClaimed(msg.sender, DAILY_REWARD);
    }

    // --- Admin Functions ---

    function setBackendSigner(address _newSigner) public onlyOwner {
        backendSigner = _newSigner;
    }

    function setTournamentDuration(uint256 _newDuration) public onlyOwner {
        tournamentDuration = _newDuration;
    }
    
    function updateTeamWallet(address _newWallet) public onlyOwner {
        teamWallet = _newWallet;
    }
}

