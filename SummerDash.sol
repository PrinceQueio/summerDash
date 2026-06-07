// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SummerDash
 * @dev Secure GameFi Architecture v2.3 — Final
 *
 * Changelog vs v2.2:
 *  [F-1] finalizeTournament: replaced manual balanceOf update with _transfer()
 *  [F-2] finalizeTournament: empty leaderboard slots now flow to teamWallet
 *  [F-3] finalizeTournament: empty pool no longer deadlocks — state still resets
 *  [F-4] _allocate: now returns uint256 (amount credited) for accounting
 *  [F-5] _resetTournament: extracted as private helper
 *  [NEW] rescueTokens(): owner can recover any stuck ERC-20 or native coin
 *  [NEW] TokenRescued event
 */
contract SummerDash {

    /*//////////////////////////////////////////////////////////////
                            ERC20 TOKEN
    //////////////////////////////////////////////////////////////*/

    string public name     = "Summer Dash";
    string public symbol   = "DASH";
    uint8  public decimals = 18;
    string public constant version = "2.3.0";

    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /*//////////////////////////////////////////////////////////////
                            GAME STATE
    //////////////////////////////////////////////////////////////*/

    address public owner;
    address public pendingOwner;
    address public teamWallet;
    address public backendSigner;

    bool public paused;

    // ── AVAX Fees ──────────────────────────────────────────────
    // All fees are in AVAX wei. Update via setClaimFees() as AVAX price moves.
    //
    // Example with AVAX @ $25:
    //   $0.10 → 0.004  AVAX → 4_000_000_000_000_000 wei
    //   $0.05 → 0.002  AVAX → 2_000_000_000_000_000 wei
    //   $0.01 → 0.0004 AVAX →   400_000_000_000_000 wei
    uint256 public bonusClaimFee;         // ~$0.10 — one-time starter bonus
    uint256 public dailyClaimFee;         // ~$0.01 — daily 500 DASH claim
    uint256 public practiceConversionFee; // ~$0.05 — practice coins → DASH

    // ── Token Constants ────────────────────────────────────────
    uint256 public constant INITIAL_BONUS = 5_000 * 10**18;
    uint256 public constant ENTRY_FEE     = 1_000 * 10**18;
    uint256 public constant DAILY_REWARD  =   500 * 10**18;

    // Practice conversion: 1,000 game coins = 100 DASH (10% rate)
    uint256 public constant PRACTICE_DASH_PER_COIN  = 100 * 10**18;
    uint256 public constant PRACTICE_COINS_PER_UNIT = 1_000;

    // ── Tournament Config ──────────────────────────────────────
    uint256 public constant MIN_DURATION = 1 hours;
    uint256 public tournamentDuration    = 7 days;
    uint256 public currentTournamentId   = 1;
    uint256 public tournamentEndTime;
    uint256 public totalPool;

    // ── User State ─────────────────────────────────────────────
    struct User {
        bool    bonusClaimed;
        uint256 lastTournamentEntered;
        uint256 pendingWinnings;
        uint256 lastDailyClaim;
    }

    mapping(address => User)                        public users;
    mapping(uint256 => mapping(address => uint256)) public tournamentScores;
    mapping(bytes32 => bool)                        public usedMessages;

    address[10] public topTen;
    uint256[10] public topScores;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BonusClaimed(address indexed player, uint256 amount);
    event EntryRegistered(address indexed player, uint256 indexed tournamentId, uint256 burned);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 indexed tournamentId);
    event TournamentFinalized(uint256 indexed id, uint256 pool);
    event WinningsClaimed(address indexed player, uint256 amount);
    event DailyRewardClaimed(address indexed player, uint256 amount);
    event PracticeCoinsConverted(address indexed player, uint256 coinsIn, uint256 dashOut);
    event Paused(bool status);
    event OwnershipTransferInitiated(address indexed newOwner);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event FeesUpdated(uint256 bonusFee, uint256 dailyFee, uint256 practiceFee);
    event AvaxWithdrawn(address indexed to, uint256 amount);
    event TokenRescued(address indexed token, address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                            MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Game paused");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @param _teamWallet   Receives team's share of tournament pool
     * @param _signer       Backend hot-wallet signing score & practice proofs
     * @param _bonusFee     AVAX wei for starter bonus claim  (~$0.10)
     * @param _dailyFee     AVAX wei for daily reward claim   (~$0.01)
     * @param _practiceFee  AVAX wei for practice conversion  (~$0.05)
     */
    constructor(
        address _teamWallet,
        address _signer,
        uint256 _bonusFee,
        uint256 _dailyFee,
        uint256 _practiceFee
    ) {
        require(_teamWallet != address(0), "Bad teamWallet");
        require(_signer     != address(0), "Bad signer");

        owner                 = msg.sender;
        teamWallet            = _teamWallet;
        backendSigner         = _signer;
        bonusClaimFee         = _bonusFee;
        dailyClaimFee         = _dailyFee;
        practiceConversionFee = _practiceFee;

        tournamentEndTime = block.timestamp + tournamentDuration;
    }

    /*//////////////////////////////////////////////////////////////
                            ERC20 LOGIC
    //////////////////////////////////////////////////////////////*/

    function transfer(address _to, uint256 _value) public returns (bool) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0),          "Zero address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        balanceOf[_from] -= _value;
        balanceOf[_to]   += _value;
        emit Transfer(_from, _to, _value);
    }

    function _mint(address _to, uint256 _amount) internal {
        require(totalSupply + _amount <= MAX_SUPPLY, "Max supply reached");
        totalSupply    += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function _burn(address _from, uint256 _amount) internal {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        balanceOf[_from] -= _amount;
        totalSupply      -= _amount;
        emit Transfer(_from, address(0), _amount);
    }

    /*//////////////////////////////////////////////////////////////
                            GAME CORE
    //////////////////////////////////////////////////////////////*/

    function enterTournament() external whenNotPaused {
        require(
            users[msg.sender].lastTournamentEntered != currentTournamentId,
            "Already entered"
        );
        require(balanceOf[msg.sender] >= ENTRY_FEE, "Insufficient DASH");

        uint256 burnAmount = ENTRY_FEE * 10 / 100;
        uint256 poolAmount = ENTRY_FEE - burnAmount;

        _burn(msg.sender, burnAmount);
        _transfer(msg.sender, address(this), poolAmount);

        users[msg.sender].lastTournamentEntered = currentTournamentId;
        totalPool += poolAmount;

        emit EntryRegistered(msg.sender, currentTournamentId, burnAmount);
    }

    /**
     * @notice One-time lifetime starter bonus of 5,000 DASH.
     *         Player must have entered the current tournament first.
     *         Costs ~$0.10 in AVAX to deter sybil farming.
     */
    function claimBonus() external payable whenNotPaused {
        require(msg.value >= bonusClaimFee,      "Insufficient AVAX fee");
        require(!users[msg.sender].bonusClaimed, "Bonus already claimed");
        require(
            users[msg.sender].lastTournamentEntered == currentTournamentId,
            "Enter tournament first"
        );

        users[msg.sender].bonusClaimed = true;
        _mint(msg.sender, INITIAL_BONUS);

        emit BonusClaimed(msg.sender, INITIAL_BONUS);
    }

    /*//////////////////////////////////////////////////////////////
                    PRACTICE COIN CONVERSION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Convert Gold Coins earned in Practice mode into $DASH tokens.
     *
     * Conversion rate : 1,000 game coins = 100 DASH (10% rate)
     * Fee             : ~$0.05 AVAX forwarded immediately to teamWallet.
     *
     * Security model  : Backend signs (player, coinsEarned, runId, address(this), chainId)
     *                   runId is unique per practice run — usedMessages prevents replay.
     *
     * @param _coinsEarned  Raw game coin count from the practice run
     * @param _runId        Unique run identifier issued by the backend
     * @param _signature    Backend signature over the packed hash
     */
    function convertPracticeCoins(
        uint256 _coinsEarned,
        bytes32 _runId,
        bytes memory _signature
    ) external payable whenNotPaused {

        require(msg.value >= practiceConversionFee,      "Insufficient AVAX fee");
        require(_coinsEarned >= PRACTICE_COINS_PER_UNIT, "Too few coins");

        bytes32 messageHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _coinsEarned,
                _runId,
                address(this),
                block.chainid
            )
        );

        require(!usedMessages[messageHash], "Run already claimed");

        bytes32 ethHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        require(
            _recoverSigner(ethHash, _signature) == backendSigner,
            "Bad signature"
        );

        usedMessages[messageHash] = true;

        // dashOut = floor(coinsEarned / 1000) * 100 DASH
        // e.g. 2,500 coins → 2 units → 200 DASH
        uint256 units   = _coinsEarned / PRACTICE_COINS_PER_UNIT;
        uint256 dashOut = units * PRACTICE_DASH_PER_COIN;

        // Forward AVAX fee directly to teamWallet
        (bool sent, ) = teamWallet.call{value: msg.value}("");
        require(sent, "AVAX forward failed");

        _mint(msg.sender, dashOut);

        emit PracticeCoinsConverted(msg.sender, _coinsEarned, dashOut);
    }

    /*//////////////////////////////////////////////////////////////
                    SCORE SUBMISSION (RANKED)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Submit a verified score for the current ranked tournament.
     *         Blocked after tournamentEndTime.
     */
    function submitScore(
        uint256 _score,
        bytes memory _signature
    ) external whenNotPaused {

        require(block.timestamp < tournamentEndTime, "Tournament ended");
        require(
            users[msg.sender].lastTournamentEntered == currentTournamentId,
            "Not entered"
        );

        bytes32 messageHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _score,
                currentTournamentId,
                address(this),
                block.chainid
            )
        );

        require(!usedMessages[messageHash], "Replay detected");

        bytes32 ethHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        require(
            _recoverSigner(ethHash, _signature) == backendSigner,
            "Bad signature"
        );

        usedMessages[messageHash] = true;

        if (_score > tournamentScores[currentTournamentId][msg.sender]) {
            tournamentScores[currentTournamentId][msg.sender] = _score;
            _updateLeaderboard(msg.sender, _score);
        }

        emit ScoreSubmitted(msg.sender, _score, currentTournamentId);
    }

    function _updateLeaderboard(address player, uint256 score) private {
        // Step 1: remove existing entry for this player
        for (uint i = 0; i < 10; i++) {
            if (topTen[i] == player) {
                for (uint j = i; j < 9; j++) {
                    topTen[j]    = topTen[j + 1];
                    topScores[j] = topScores[j + 1];
                }
                topTen[9]    = address(0);
                topScores[9] = 0;
                break;
            }
        }

        // Step 2: insert at correct rank position
        for (uint i = 0; i < 10; i++) {
            if (score > topScores[i]) {
                for (uint j = 9; j > i; j--) {
                    topScores[j] = topScores[j - 1];
                    topTen[j]    = topTen[j - 1];
                }
                topScores[i] = score;
                topTen[i]    = player;
                break;
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        SIGNATURE RECOVERY
    //////////////////////////////////////////////////////////////*/

    function _recoverSigner(
        bytes32 hash,
        bytes memory sig
    ) internal pure returns (address) {
        require(sig.length == 65, "Bad sig length");

        bytes32 r;
        bytes32 s;
        uint8   v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Bad v value");

        address recovered = ecrecover(hash, v, r, s);
        require(recovered != address(0), "ecrecover failed");
        return recovered;
    }

    /*//////////////////////////////////////////////////////////////
                    TOURNAMENT FINALIZATION
    //////////////////////////////////////////////////////////////*/

    function finalizeTournament() external {
        require(block.timestamp >= tournamentEndTime, "Not finished");
        require(
            msg.sender == owner ||
            block.timestamp >= tournamentEndTime + 1 days,
            "Owner grace period"
        );

        uint256 pool = totalPool;

        // [F-3] Empty pool: skip distribution but still reset so game continues
        if (pool == 0) {
            emit TournamentFinalized(currentTournamentId, 0);
            _resetTournament();
            return;
        }

        // [F-2] Accumulate what is actually allocated to players.
        //       Any empty leaderboard slot contributes 0 to allocated,
        //       so its percentage falls through to teamShare automatically.
        uint256 allocated = 0;

        allocated += _allocate(topTen[0], 40, pool);
        allocated += _allocate(topTen[1], 20, pool);
        allocated += _allocate(topTen[2], 10, pool);
        for (uint i = 3; i < 10; i++) {
            allocated += _allocate(topTen[i], 2, pool);
        }

        // teamShare = everything not sent to players (base 16% + empty-slot remainder)
        uint256 teamShare = pool - allocated;

        // [F-1] Proper internal transfer — debits contract balance correctly
        _transfer(address(this), teamWallet, teamShare);

        emit TournamentFinalized(currentTournamentId, pool);
        _resetTournament();
    }

    /**
     * @dev Returns the amount credited to the winner so the caller can
     *      accumulate total allocated. Returns 0 for empty slots.
     */
    function _allocate(
        address winner,
        uint256 percent,
        uint256 pool
    ) private returns (uint256 amount) {
        amount = pool * percent / 100;
        if (winner != address(0)) {
            users[winner].pendingWinnings += amount;
            return amount;
        }
        // Empty slot — amount stays unallocated, flows to teamShare
        return 0;
    }

    function _resetTournament() private {
        currentTournamentId++;
        totalPool         = 0;
        tournamentEndTime = block.timestamp + tournamentDuration;

        for (uint i = 0; i < 10; i++) {
            topTen[i]    = address(0);
            topScores[i] = 0;
        }
    }

    function claimWinnings() external {
        uint256 amount = users[msg.sender].pendingWinnings;
        require(amount > 0, "Nothing to claim");
        users[msg.sender].pendingWinnings = 0;
        _transfer(address(this), msg.sender, amount);
        emit WinningsClaimed(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        DAILY REWARD
    //////////////////////////////////////////////////////////////*/

    function claimDailyReward() external payable whenNotPaused {
        require(msg.value >= dailyClaimFee, "Insufficient AVAX fee");
        require(
            block.timestamp >= users[msg.sender].lastDailyClaim + 1 days,
            "Too soon"
        );
        users[msg.sender].lastDailyClaim = block.timestamp;
        _mint(msg.sender, DAILY_REWARD);
        emit DailyRewardClaimed(msg.sender, DAILY_REWARD);
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY TOKEN RESCUE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Recover any ERC-20 token or native coin accidentally sent
     *         to this contract. Works on any EVM chain.
     *
     * Rules:
     *  - onlyOwner
     *  - DASH (address(this)) is blocked — prize pool is protected
     *  - Pass token = address(0) to rescue native coin (AVAX / ETH / BNB)
     *  - Pass amount = 0 to sweep the full balance
     *
     * @param token   ERC-20 contract address, or address(0) for native coin
     * @param to      Recipient address
     * @param amount  Amount to rescue (0 = full balance)
     */
    function rescueTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0),       "Bad recipient");
        require(token != address(this), "Cannot rescue DASH");

        if (token == address(0)) {
            // ── Native coin (AVAX / ETH / BNB / etc.) ─────────
            uint256 bal = address(this).balance;
            require(bal > 0, "No native balance");
            uint256 sendAmount = amount == 0 ? bal : amount;
            require(sendAmount <= bal, "Amount exceeds balance");

            (bool ok, ) = to.call{value: sendAmount}("");
            require(ok, "Native transfer failed");

            emit AvaxWithdrawn(to, sendAmount);

        } else {
            // ── Any ERC-20 token ───────────────────────────────
            // Low-level calls avoid needing IERC20 import and work
            // on non-standard tokens like USDT that return no bool.

            (bool balSuccess, bytes memory balData) = token.call(
                abi.encodeWithSignature("balanceOf(address)", address(this))
            );
            require(balSuccess && balData.length >= 32, "balanceOf failed");

            uint256 bal = abi.decode(balData, (uint256));
            require(bal > 0, "No token balance");

            uint256 sendAmount = amount == 0 ? bal : amount;
            require(sendAmount <= bal, "Amount exceeds balance");

            (bool sent, bytes memory returnData) = token.call(
                abi.encodeWithSignature("transfer(address,uint256)", to, sendAmount)
            );

            // Handles tokens that return bool AND tokens that return nothing (e.g. USDT)
            require(
                sent && (returnData.length == 0 || abi.decode(returnData, (bool))),
                "Token transfer failed"
            );

            emit TokenRescued(token, to, sendAmount);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN
    //////////////////////////////////////////////////////////////*/

    function pauseGame(bool _state) external onlyOwner {
        paused = _state;
        emit Paused(_state);
    }

    function adminMint(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Zero address");
        _mint(_to, _amount);
    }

    function setBackendSigner(address _new) external onlyOwner {
        require(_new != address(0), "Zero address");
        backendSigner = _new;
    }

    function updateTeamWallet(address _new) external onlyOwner {
        require(_new != address(0), "Zero address");
        teamWallet = _new;
    }

    function setTournamentDuration(uint256 _duration) external onlyOwner {
        require(_duration >= MIN_DURATION, "Duration too short");
        tournamentDuration = _duration;
    }

    /**
     * @notice Update all three AVAX fees at once.
     *         Call whenever AVAX price moves significantly.
     */
    function setClaimFees(
        uint256 _bonusFee,
        uint256 _dailyFee,
        uint256 _practiceFee
    ) external onlyOwner {
        bonusClaimFee         = _bonusFee;
        dailyClaimFee         = _dailyFee;
        practiceConversionFee = _practiceFee;
        emit FeesUpdated(_bonusFee, _dailyFee, _practiceFee);
    }

    // ── Two-step ownership ─────────────────────────────────────

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        pendingOwner = _newOwner;
        emit OwnershipTransferInitiated(_newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        emit OwnershipTransferred(owner, pendingOwner);
        owner        = pendingOwner;
        pendingOwner = address(0);
    }

    /**
     * @notice Withdraw accumulated AVAX from bonus and daily claim fees.
     *         Practice fees are forwarded at claim time so not included here.
     */
    function withdrawAvax() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "Nothing to withdraw");
        (bool ok, ) = teamWallet.call{value: bal}("");
        require(ok, "AVAX transfer failed");
        emit AvaxWithdrawn(teamWallet, bal);
    }

    /*//////////////////////////////////////////////////////////////
                            RECEIVE
    //////////////////////////////////////////////////////////////*/

    receive() external payable {}
}