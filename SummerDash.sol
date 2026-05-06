// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SummerDash
 * @dev A comprehensive game manager contract for the Summer Dash tournament.
 * Includes $DASH token distribution, tournament entry, and immutable score recording.
 */
contract SummerDash {
    
    // --- State Variables ---
    address public owner;
    address public teamWallet;
    
    uint256 public constant INITIAL_BONUS = 5000;
    uint256 public constant ENTRY_FEE = 1000;
    uint256 public constant DAILY_REWARD = 500;
    
    // Tournament Configuration
    uint256 public tournamentDuration = 7 days; // Can be changed by owner to 1 day, etc.
    uint256 public currentTournamentId = 1;
    uint256 public tournamentEndTime;
    uint256 public totalPool;

    // User Data
    struct User {
        uint256 dashBalance;
        bool bonusClaimed;
        uint256 highScore;
        uint256 lastTournamentEntered;
        uint256 pendingWinnings;
        uint256 lastDailyClaim;
    }
    
    mapping(address => User) public users;
    address[] public runners;
    
    // Leaderboard Tracking (Simplfied for Example)
    address[10] public topTen;
    uint256[10] public topScores;

    // --- Events ---
    event BonusClaimed(address indexed player, uint256 amount);
    event EntryRegistered(address indexed player, uint256 tournamentId);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 tournamentId);
    event TournamentFinalized(uint256 tournamentId, uint256 poolAmount);
    event WinningsClaimed(address indexed player, uint256 amount);
    event CoinsConverted(address indexed player, uint256 coinAmount, uint256 dashAmount);
    event DailyRewardClaimed(address indexed player, uint256 amount, uint256 nextAvailable);

    constructor(address _teamWallet) {
        owner = msg.sender;
        teamWallet = _teamWallet;
        tournamentEndTime = block.timestamp + tournamentDuration;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // --- Core Functions ---

    /**
     * @dev Allows new players to claim their starter 5,000 $DASH.
     * Requires gas payment from the player.
     */
    function claimBonus() public {
        require(!users[msg.sender].bonusClaimed, "Already claimed");
        
        users[msg.sender].bonusClaimed = true;
        users[msg.sender].dashBalance += INITIAL_BONUS;
        
        emit BonusClaimed(msg.sender, INITIAL_BONUS);
    }

    /**
     * @dev Deducts 1,000 $DASH and authorizes the player for a Ranked run.
     */
    function enterTournament() public {
        require(users[msg.sender].dashBalance >= ENTRY_FEE, "Insufficient $DASH");
        
        users[msg.sender].dashBalance -= ENTRY_FEE;
        users[msg.sender].lastTournamentEntered = currentTournamentId;
        totalPool += ENTRY_FEE;
        
        emit EntryRegistered(msg.sender, currentTournamentId);
    }

    /**
     * @dev Records the player's high score. Only allowed if they entered this tournament.
     */
    function submitScore(uint256 _score) public {
        require(users[msg.sender].lastTournamentEntered == currentTournamentId, "Must enter first");
        
        // Update high score
        if (_score > users[msg.sender].highScore) {
            users[msg.sender].highScore = _score;
            _updateLeaderboard(msg.sender, _score);
        }
        
        emit ScoreSubmitted(msg.sender, _score, currentTournamentId);
    }

    /**
     * @dev Private helper to keep track of the Top 10.
     */
    function _updateLeaderboard(address _player, uint256 _score) private {
        for (uint i = 0; i < 10; i++) {
            if (_score > topScores[i]) {
                // Shift lower scores down
                for (uint j = 9; j > i; j--) {
                    topScores[j] = topScores[j-1];
                    topTen[j] = topTen[j-1];
                }
                // Insert new high score
                topScores[i] = _score;
                topTen[i] = _player;
                break;
            }
        }
    }

    /**
     * @dev Distributes the pool according to the 40/20/10/2% logic.
     * Can be called when tournamentEndTime is reached.
     */
    function finalizeTournament() public onlyOwner {
        require(block.timestamp >= tournamentEndTime, "Tournament not over");
        
        uint256 remainingPool = totalPool;
        
        // 1st: 40%
        _allocateWinnings(topTen[0], (totalPool * 40) / 100);
        // 2nd: 20%
        _allocateWinnings(topTen[1], (totalPool * 20) / 100);
        // 3rd: 10%
        _allocateWinnings(topTen[2], (totalPool * 10) / 100);
        
        // 4th-10th: 2% each
        for (uint i = 3; i < 10; i++) {
            _allocateWinnings(topTen[i], (totalPool * 2) / 100);
        }
        
        // Team Share: Remaining balance (roughly 16%)
        uint256 teamShare = totalPool - ((totalPool * 84) / 100); // 40+20+10+14 = 84%
        users[teamWallet].dashBalance += teamShare;

        emit TournamentFinalized(currentTournamentId, totalPool);
        
        // Reset for Next Tournament
        currentTournamentId++;
        totalPool = 0;
        tournamentEndTime = block.timestamp + tournamentDuration;
        
        // Clear Leaderboard for new week
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

    /**
     * @dev Allows winners to pull their winnings into their main $DASH balance.
     */
    function claimWinnings() public {
        uint256 winnings = users[msg.sender].pendingWinnings;
        require(winnings > 0, "No winnings");
        
        users[msg.sender].pendingWinnings = 0;
        users[msg.sender].dashBalance += winnings;
        
        emit WinningsClaimed(msg.sender, winnings);
    }

    /**
     * @dev Allows players to convert in-game coins to $DASH.
     * In this example, we use a 1:1 ratio.
     */
    function convertCoinsToDash(uint256 _coinAmount) public {
        require(_coinAmount > 0, "Zero coins");
        
        // Update balance
        users[msg.sender].dashBalance += _coinAmount;
        
        emit CoinsConverted(msg.sender, _coinAmount, _coinAmount);
    }

    /**
     * @dev Allows players to claim a small daily reward (500 $DASH).
     * Enforces a 24-hour cooldown.
     */
    function claimDailyReward() public {
        require(block.timestamp >= users[msg.sender].lastDailyClaim + 1 days, "Reward not ready");
        
        users[msg.sender].lastDailyClaim = block.timestamp;
        users[msg.sender].dashBalance += DAILY_REWARD;
        
        emit DailyRewardClaimed(msg.sender, DAILY_REWARD, block.timestamp + 1 days);
    }

    // --- Admin Functions ---
    
    function setTournamentDuration(uint256 _newDuration) public onlyOwner {
        tournamentDuration = _newDuration;
    }
    
    function updateTeamWallet(address _newWallet) public onlyOwner {
        teamWallet = _newWallet;
    }
}
