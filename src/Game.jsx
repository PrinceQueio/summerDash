import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from './AudioManager';

const Game = ({ onGameOver, onScoreUpdate, initialState }) => {
    const canvasRef = useRef(null);
    const [isStarted, setIsStarted] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [coreLoaded, setCoreLoaded] = useState(false);

    // Asset Refs
    // Asset Refs
    const runImg = useRef(new Image());
    const jumpImg = useRef(new Image());
    // Level 1
    const bgImg1 = useRef(new Image());
    const obsImg1 = useRef(new Image());

    // Background Refs (Lazy Load)
    const bgRefs = useRef([]);
    const obsRefs = useRef([]);
    // Initialize refs arrays
    if (bgRefs.current.length === 0) {
        for (let i = 0; i < 31; i++) {
            bgRefs.current[i] = new Image();
            obsRefs.current[i] = new Image();
        }
    }

    // Helper to get correct ref based on level index (0-19)
    const getBgRef = (index) => {
        if (index === 0) return bgImg1.current;
        return bgRefs.current[index];
    };
    const getObsRef = (index) => {
        if (index === 0) return obsImg1.current;
        return obsRefs.current[index];
    };
    // Level 2
    const bgImg2 = useRef(new Image());
    const obsImg2 = useRef(new Image());
    // Level 3
    const bgImg3 = useRef(new Image());
    const obsImg3 = useRef(new Image());
    // Level 4
    const bgImg4 = useRef(new Image());
    const obsImg4 = useRef(new Image());
    // Level 5
    const bgImg5 = useRef(new Image());
    const obsImg5 = useRef(new Image());
    // Level 6
    const bgImg6 = useRef(new Image());
    const obsImg6 = useRef(new Image());
    // Level 7
    const bgImg7 = useRef(new Image());
    const obsImg7 = useRef(new Image());
    // Level 8 (Cloud)
    const bgImg8 = useRef(new Image());
    const obsImg8 = useRef(new Image());
    // Level 9 (Desert)
    const bgImg9 = useRef(new Image());
    const obsImg9 = useRef(new Image());
    // Level 10 (Temple)
    const bgImg10 = useRef(new Image());
    const obsImg10 = useRef(new Image());
    // Level 11 (Crystal)
    const bgImg11 = useRef(new Image());
    const obsImg11 = useRef(new Image());
    // Level 12 (Factory)
    const bgImg12 = useRef(new Image());
    const obsImg12 = useRef(new Image());
    // Level 13 (Graveyard)
    const bgImg13 = useRef(new Image());
    const obsImg13 = useRef(new Image());
    // Level 14 (Swamp)
    const bgImg14 = useRef(new Image());
    const obsImg14 = useRef(new Image());
    // Level 15 (Castle)
    const bgImg15 = useRef(new Image());
    const obsImg15 = useRef(new Image());
    // Level 16 (Mines)
    const bgImg16 = useRef(new Image());
    const obsImg16 = useRef(new Image());
    // Level 17 (Prehistoric) - Placeholder
    const bgImg17 = useRef(new Image());
    const obsImg17 = useRef(new Image());
    // Level 18 (Pirate) - Placeholder
    const bgImg18 = useRef(new Image());
    const obsImg18 = useRef(new Image());
    // Level 19 (Circus) - Placeholder
    const bgImg19 = useRef(new Image());
    const obsImg19 = useRef(new Image());
    // Level 20 (Dimension X) - Placeholder
    const bgImg20 = useRef(new Image());
    const obsImg20 = useRef(new Image());

    const heartImg = useRef(new Image());
    const boostImg = useRef(new Image());
    const coinImg = useRef(new Image());
    const shieldImg = useRef(new Image());
    const magnetImg = useRef(new Image());
    const batImg = useRef(new Image());
    const waspImg = useRef(new Image());
    const ghostImg = useRef(new Image());

    useEffect(() => {
        // 2. Background Loading Function
        const loadBackgroundAssets = () => {
            const levelAssets = [
                // Level 2 start
                { bg: '/sewer_bg.png', obs: '/sewer_obstacle.png' },
                { bg: '/space_bg.png', obs: '/space_obstacle.png' },
                { bg: '/underwater_bg.png', obs: '/underwater_obstacle.png' },
                { bg: '/volcano_bg.png', obs: '/volcano_obstacle.png' },
                { bg: '/forest_bg.png', obs: '/forest_obstacle.png' },
                { bg: '/ice_bg.png', obs: '/ice_obstacle.png' },
                { bg: '/cloud_bg.png', obs: '/cloud_obstacle.png' },
                { bg: '/desert_bg.png', obs: '/desert_obstacle.png' },
                { bg: '/temple_bg.png', obs: '/temple_obstacle.png' },
                { bg: '/crystal_bg.png', obs: '/crystal_obstacle.png' },
                { bg: '/factory_bg.png', obs: '/factory_obstacle.png' },
                { bg: '/graveyard_bg.png', obs: '/graveyard_obstacle.png' },
                { bg: '/swamp_bg.png', obs: '/swamp_obstacle.png' },
                { bg: '/castle_bg.png', obs: '/castle_obstacle.png' },
                { bg: '/mines_bg.png', obs: '/mines_obstacle.png' },
                { bg: '/prehistoric_bg.png', obs: '/prehistoric_obstacle.png' },
                { bg: '/pirate_bg.png', obs: '/pirate_obstacle.png' },
                { bg: '/circus_bg.png', obs: '/circus_obstacle.png' },
                { bg: '/dimension_x_bg.png', obs: '/dimension_x_obstacle.png' },
                { bg: '/wraith_woods_bg.png', obs: '/wraith_obstacle.png' },
                { bg: '/inferno_bg.png', obs: '/inferno_obstacle.png' },
                { bg: '/spider_cave_bg.png', obs: '/spider_obstacle.png' },
                { bg: '/ruined_city_bg.png', obs: '/rubble_obstacle.png' },
                { bg: '/fungal_forest_bg.png', obs: '/spore_obstacle.png' },
                // Reusing scary levels for 26-30 as placeholder/extension
                { bg: '/wraith_woods_bg.png', obs: '/wraith_obstacle.png' }, // 26
                { bg: '/inferno_bg.png', obs: '/inferno_obstacle.png' }, // 27
                { bg: '/spider_cave_bg.png', obs: '/spider_obstacle.png' }, // 28
                { bg: '/ruined_city_bg.png', obs: '/rubble_obstacle.png' }, // 29
                { bg: '/fungal_forest_bg.png', obs: '/spore_obstacle.png' }, // 30
            ];

            levelAssets.forEach((data, i) => {
                const targetIndex = i + 1;
                bgRefs.current[targetIndex].src = data.bg;
                obsRefs.current[targetIndex].src = data.obs;
            });
        };

        let loadedCount = 0;
        const coreImages = 9; // 7 core + 2 level 1

        const checkCoreLoaded = () => {
            loadedCount++;
            if (loadedCount >= coreImages) {
                setCoreLoaded(true);
                setImagesLoaded(true);
                loadBackgroundAssets();
            }
        };

        const handleError = (e) => {
            console.error("Error loading image:", e.target.src);
            checkCoreLoaded();
        };

        // 1. Load Core Assets
        const coreAssets = [
            { ref: runImg, src: '/player_run_sheet.png' },
            { ref: jumpImg, src: '/classic_player_jump.png' },
            { ref: heartImg, src: '/heart.png' },
            { ref: boostImg, src: '/boost.png' },
            { ref: coinImg, src: '/coin.png' },
            { ref: shieldImg, src: '/shield_powerup.png' },
            { ref: magnetImg, src: '/magnet_powerup.png' },
            { ref: bgImg1, src: '/classic_bg.png' },
            { ref: obsImg1, src: '/classic_obstacle.png' },
            { ref: batImg, src: '/bat_enemy.png' },
            { ref: waspImg, src: '/wasp_enemy.png' },
            { ref: ghostImg, src: '/ghost_enemy.png' }
        ];

        coreAssets.forEach(asset => {
            asset.ref.current.onload = checkCoreLoaded;
            asset.ref.current.onerror = handleError;
            asset.ref.current.src = asset.src;
        });

        // 3. Safety Timeout (iOS Fix)
        // Force start if assets take longer than 3 seconds (e.g. network glitch)
        const safetyTimeout = setTimeout(() => {
            if (loadedCount < coreImages) {
                console.warn("Asset loading timed out. Forcing start.");
                setCoreLoaded(true);
                setImagesLoaded(true);
                loadBackgroundAssets();
            }
        }, 3000);

        return () => clearTimeout(safetyTimeout);



    }, []);

    useEffect(() => {
        if (!imagesLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set initial dimension to Window
        // Use a fixed internal resolution height for performance on mobile (retina screens)
        const TARGET_HEIGHT = 600;

        const setCanvasSize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            canvas.height = TARGET_HEIGHT;
            canvas.width = TARGET_HEIGHT * aspect;
            // The CSS w-full h-full will scale this up to the screen size
        };
        setCanvasSize();

        // --- GAME CONSTANTS ---
        const GRAVITY = 0.6;
        const JUMP_POWER = -12;
        // Ground Y dynamic based on height
        let GROUND_Y = canvas.height - 40;

        // --- STATE ---
        // --- STATE (Anti-Cheat: Encapsulated Vault) ---
        let frameCount = 0;
        const vault = {
            _s: initialState?.score || 0, // score
            _c: initialState?.coins || 0, // coins
            _v: [], // verification log
            _t: Date.now() // start time
        };

        const recordEvent = (type, value) => {
            vault._v.push({ t: Date.now() - vault._t, type, val: value });
            // Keep log size manageable but sufficient for validation
            if (vault._v.length > 500) vault._v.shift();
        };

        let level = initialState?.level || 1;
        let gameSpeed = 6 + (level - 1) * 0.3; 
        let isGameOver = false;
        let lives = initialState?.lives || 3;
        let invincibilityTimer = 0;
        let boostTimer = 0;
        let magnetTimer = 0;
        let shieldActive = false;

        // --- PLAYER OBJECT ---
        let player = {
            x: 80,
            y: GROUND_Y - 80, // Increased size from 60
            width: 80, // Increased size from 60
            height: 80, // Increased size from 60
            dy: 0,
            grounded: true,
            state: 'idle',
            frameX: 0,
            frameY: 0,
            maxFrame: 7,
            frameTimer: 0,
            frameInterval: 5,
            jumpCount: 0,
            maxJumps: 2,
        };

        // --- ENTITIES ---
        let obstacles = [];
        let particles = [];
        let powerups = []; // Generic array for all powerups
        let coins = [];

        // --- BACKGROUND PARALLAX ---
        let bgX = 0;

        // --- RESIZE HANDLER ---
        const handleResize = () => {
            // Re-calc resolution on resize
            const aspect = window.innerWidth / window.innerHeight;
            canvas.height = TARGET_HEIGHT;
            canvas.width = TARGET_HEIGHT * aspect;

            GROUND_Y = canvas.height - 40;

            // Keep player on ground during resize if grounded
            if (player.grounded) {
                player.y = GROUND_Y - player.height;
            } else if (player.y > GROUND_Y - player.height) {
                player.y = GROUND_Y - player.height;
            }
            ctx.imageSmoothingEnabled = false;
        };
        window.addEventListener('resize', handleResize);
        ctx.imageSmoothingEnabled = false;

        // --- CLASSES/HELPERS ---
        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 2;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.life = 10; // Reduce life for performance (was 20)
                this.color = color || `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.5})`;
            }
            update() {
                this.x -= gameSpeed + this.speedX;
                this.y += this.speedY;
                this.life--;
                this.size *= 0.85; // Faster fade
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const jump = () => {
            if (isGameOver) return;
            if (!isStarted) {
                setIsStarted(true);
                audioManager.unlock();
            }

            if (player.grounded || player.jumpCount < player.maxJumps) {
                audioManager.playJump();
                player.dy = JUMP_POWER;
                player.grounded = false;
                player.state = 'jump';
                player.jumpCount++;

                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(player.x + 40, player.y + 75));
                }
            }
        };

        const handleKeydown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') jump();
        };

        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('touchstart', jump);

        // --- MAIN LOOP ---

        const update = () => {
            if (isGameOver) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. BACKGROUND
            let bgIndex = (level - 1) % 30;
            let currentBg = getBgRef(bgIndex) || bgImg1.current;
            // Ensuring currentBg is valid and actually loaded (naturalWidth > 0 checks for valid image data)
            if (!currentBg || !currentBg.complete || currentBg.naturalWidth === 0) currentBg = bgImg1.current;

            // Draw background (scaled to canvas)
            ctx.drawImage(currentBg, bgX, 0, canvas.width, canvas.height);
            ctx.drawImage(currentBg, bgX + canvas.width, 0, canvas.width, canvas.height);
            if (isStarted) bgX -= gameSpeed * 0.2;
            if (bgX <= -canvas.width) bgX = 0;


            // 2. PHYSICS & PLAYER
            if (isStarted) {
                player.dy += GRAVITY;
                player.y += player.dy;

                if (player.y + player.height > GROUND_Y) {
                    player.y = GROUND_Y - player.height;
                    player.dy = 0;
                    player.grounded = true;
                    player.jumpCount = 0;
                    player.state = 'run';
                } else {
                    player.state = 'jump';
                }

                if (invincibilityTimer > 0) invincibilityTimer--;
                if (boostTimer > 0) {
                    boostTimer--;
                    if (boostTimer === 0) gameSpeed -= 3;
                }
                if (magnetTimer > 0) magnetTimer--;
            }

            // 3. SPRITE ANIMATION
            if (isStarted && player.state === 'run') {
                const dynamicInterval = Math.max(2, Math.floor(20 / gameSpeed));
                player.frameTimer++;
                if (player.frameTimer > dynamicInterval) {
                    player.frameX++;
                    if (player.frameX > player.maxFrame) player.frameX = 0;
                    player.frameTimer = 0;
                    if (frameCount % 10 === 0) {
                        particles.push(new Particle(player.x + 20, player.y + 75));
                    }
                }
            }

            if (player.state === 'jump') {
                ctx.drawImage(jumpImg.current, player.x, player.y, player.width, player.height);
            } else {
                const cols = 8;
                const rows = 1;
                const frameWidth = runImg.current.width / cols;
                const frameHeight = runImg.current.height / rows;
                const col = player.frameX % cols;
                const row = 0;
                const sx = col * frameWidth;
                const sy = row * frameHeight;

                if (invincibilityTimer > 0 && Math.floor(frameCount / 4) % 2 === 0) {
                    ctx.globalAlpha = 0.5;
                }
                ctx.drawImage(runImg.current, sx, sy, frameWidth, frameHeight, player.x, player.y, player.width, player.height);
                ctx.globalAlpha = 1.0;
            }

            if (shieldActive) {
                // Draw shield overlay
                ctx.save();
                ctx.globalAlpha = 0.6 + Math.sin(frameCount * 0.1) * 0.2;
                ctx.drawImage(shieldImg.current, player.x - 10, player.y - 10, player.width + 20, player.height + 20);
                ctx.restore();
            }

            // 4. PARTICLES
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            // 5. OBSTACLES
            if (isStarted) {
                // Reduced interval for faster early action (100-200 frames instead of 150-250)
                const randomInterval = Math.floor(Math.random() * 100) + 100;
                if (frameCount % randomInterval === 0 || (obstacles.length === 0 && frameCount > 60)) {
                    if (obstacles.length === 0 || (canvas.width - obstacles[obstacles.length - 1].x > 350)) {
                        let height = 50;
                        let type = 'ground';
                        let yPos = GROUND_Y - height;

                        // Start spawning flyers much earlier (after score > 0)
                        if (vault._s > 0 && Math.random() < 0.35) {
                            const flyers = ['bat', 'wasp', 'ghost'];
                            type = flyers[Math.floor(Math.random() * flyers.length)];
                            height = 40; 
                            const heights = [GROUND_Y - 90, GROUND_Y - 140, GROUND_Y - 170];
                            yPos = heights[Math.floor(Math.random() * heights.length)];
                        }

                        obstacles.push({ x: canvas.width, y: yPos, width: 50, height: height, passed: false, type: type });
                    }
                }

                for (let i = 0; i < obstacles.length; i++) {
                    let obs = obstacles[i];
                    obs.x -= gameSpeed;

                    let obsIndex = (level - 1) % 30;
                    let currentObsImg = getObsRef(obsIndex) || obsImg1.current;
                    if (!currentObsImg || !currentObsImg.complete || currentObsImg.naturalWidth === 0) currentObsImg = obsImg1.current;

                    if (obs.type === 'bat') {
                        ctx.drawImage(batImg.current, obs.x, obs.y, obs.width, obs.height);
                    } else if (obs.type === 'wasp') {
                        ctx.drawImage(waspImg.current, obs.x, obs.y, obs.width, obs.height + 10); // slightly bigger visual
                    } else if (obs.type === 'ghost') {
                        ctx.save();
                        ctx.globalAlpha = 0.8;
                        ctx.drawImage(ghostImg.current, obs.x, obs.y, obs.width, obs.height);
                        ctx.restore();
                    } else {
                        ctx.drawImage(currentObsImg, obs.x, obs.y, obs.width, obs.height);
                    }

                    const hitX = player.x + 20;
                    const hitY = player.y + 13;
                    const hitW = player.width - 40;
                    const hitH = player.height - 20;

                    if (
                        hitX < obs.x + obs.width &&
                        hitX + hitW > obs.x &&
                        hitY < obs.y + obs.height &&
                        hitY + hitH > obs.y
                    ) {
                        if (invincibilityTimer === 0 && boostTimer === 0) {
                            if (shieldActive) {
                                shieldActive = false;
                                audioManager.playCollect(); // Sound for shield break?
                                invincibilityTimer = 60;
                                for (let k = 0; k < 10; k++) particles.push(new Particle(player.x, player.y, 'rgba(0,100,255,1)'));
                            } else {
                                lives--;
                                audioManager.playHit();
                                invincibilityTimer = 60;
                                obs.passed = true;

                                // NEW: Coin Penalty System
                                if (obs.type === 'bat') {
                                    vault._c = Math.max(0, vault._c - 100);
                                } else if (obs.type === 'wasp') {
                                    vault._c = Math.max(0, vault._c - 200);
                                } else if (obs.type === 'ghost') {
                                    vault._c = Math.floor(vault._c / 2);
                                }
                                recordEvent('hit', obs.type);

                                for (let k = 0; k < 10; k++) particles.push(new Particle(player.x, player.y));

                                if (lives <= 0) {
                                    audioManager.playGameOver();
                                    isGameOver = true;
                                    
                                    // Anti-Cheat: Generate a basic hash of the run
                                    const runDuration = Date.now() - vault._t;
                                    const validation = {
                                        s: vault._s,
                                        c: vault._c,
                                        d: runDuration,
                                        v: btoa(JSON.stringify(vault._v.slice(-20))) // Sample of recent events
                                    };
                                    
                                    onGameOver({ 
                                        score: vault._s, 
                                        coins: vault._c,
                                        level: level,
                                        validation
                                    });
                                }
                            }
                        }
                    }

                    if (obs.x + obs.width < player.x && !obs.passed) {
                        vault._s++;
                        recordEvent('obs', vault._s);
                        obs.passed = true;
                        onScoreUpdate(vault._s);
                        if (vault._s % 10 === 0) gameSpeed += 0.3;

                        const levelThreshold = 50; 
                        const calculatedLevel = Math.min(30, Math.floor(vault._s / levelThreshold) + 1);

                        if (calculatedLevel > level) {
                            level = calculatedLevel;
                            audioManager.playLevelUp();
                            gameSpeed += 0.3;
                        }
                    }

                    if (obs.x < -100) {
                        obstacles.splice(i, 1);
                        i--;
                    }
                }
            }

            // 6. POWER-UPS & COINS
            if (isStarted) {
                // Spawn Power-ups (random type)
                if (frameCount % (Math.floor(Math.random() * 500) + 600) === 0) {
                    const types = ['boost', 'shield', 'magnet'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    powerups.push({ x: canvas.width, y: GROUND_Y - 90, width: 40, height: 40, active: true, type: type });
                }

                // Spawn Coins
                if (frameCount % 40 === 0) {
                    // Random height pattern (Ground, Jump, High Jump)
                    const heights = [GROUND_Y - 40, GROUND_Y - 120, GROUND_Y - 180];
                    const y = heights[Math.floor(Math.random() * heights.length)];
                    coins.push({ x: canvas.width, y: y, width: 30, height: 30, active: true });
                }

                // Update Power-ups
                for (let i = 0; i < powerups.length; i++) {
                    let p = powerups[i];
                    p.x -= gameSpeed;

                    if (p.active) {
                        let img = boostImg.current;
                        if (p.type === 'shield') img = shieldImg.current;
                        if (p.type === 'magnet') img = magnetImg.current;

                        ctx.drawImage(img, p.x, p.y, p.width, p.height);

                        if (
                            player.x < p.x + p.width &&
                            player.x + player.width > p.x &&
                            player.y < p.y + p.height &&
                            player.y + player.height > p.y
                        ) {
                            p.active = false;
                            audioManager.playCollect();

                            // Effect
                            if (p.type === 'boost') {
                                if (boostTimer === 0) gameSpeed += 3;
                                boostTimer = 300;
                                invincibilityTimer = 300;
                            } else if (p.type === 'shield') {
                                shieldActive = true;
                            } else if (p.type === 'magnet') {
                                magnetTimer = 600; // 10 seconds
                            }

                            for (let k = 0; k < 10; k++) particles.push(new Particle(player.x + k * 2, player.y, '#FFD700'));
                        }
                    }

                    if (p.x < -50) {
                        powerups.splice(i, 1);
                        i--;
                    }
                }

                // Update Coins
                for (let i = 0; i < coins.length; i++) {
                    let c = coins[i];

                    // Magnet Effect
                    if (magnetTimer > 0 && c.active && c.x < canvas.width && c.x > 0) {
                        const dx = player.x - c.x;
                        const dy = player.y - c.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 400) {
                            c.x += dx * 0.1;
                            c.y += dy * 0.1;
                        } else {
                            c.x -= gameSpeed;
                        }
                    } else {
                        c.x -= gameSpeed;
                    }

                    if (c.active) {
                        // Spin animation (simple width pulse)
                        const widthScale = Math.abs(Math.sin(frameCount * 0.1));
                        ctx.drawImage(coinImg.current, c.x + (15 - 15 * widthScale), c.y, 30 * widthScale, 30);

                        if (
                            player.x < c.x + c.width &&
                            player.x + player.width > c.x &&
                            player.y < c.y + c.height &&
                            player.y + player.height > c.y
                        ) {
                            c.active = false;
                            // Update: 10 coins normally, 15 during boost
                            const points = boostTimer > 0 ? 15 : 10;
                            vault._c += points;
                            recordEvent('coin', vault._c);
                            audioManager.playCollect();
                        }
                    }

                    if (c.x < -50) {
                        coins.splice(i, 1);
                        i--;
                    }
                }
            }

            // 7. UI OVERLAY
            ctx.beginPath();
            ctx.moveTo(0, GROUND_Y);
            ctx.lineTo(canvas.width, GROUND_Y);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (!isStarted) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("TAP OR PRESS SPACE TO START", canvas.width / 2, canvas.height / 2);
                ctx.font = '20px Arial';
                ctx.fillText("(Audio Enabled)", canvas.width / 2, canvas.height / 2 + 40);
            } else {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'left';
                ctx.strokeStyle = '#000';

                // Level
                ctx.font = '20px Arial';
                ctx.strokeText(`LVL ${level}`, 20, 30);
                ctx.fillText(`LVL ${level}`, 20, 30);

                // Score
                ctx.lineWidth = 4;
                ctx.font = 'bold 30px Arial';
                ctx.strokeText(`Score: ${vault._s}`, 20, 65);
                ctx.fillText(`Score: ${vault._s}`, 20, 65);

                // Coin Count
                ctx.drawImage(coinImg.current, 20, 135, 25, 25);
                ctx.strokeText(`${vault._c}`, 50, 158);
                ctx.fillText(`${vault._c}`, 50, 158);

                // Lives
                for (let i = 0; i < lives; i++) {
                    ctx.drawImage(heartImg.current, 20 + (i * 40), 75, 30, 30);
                }

                // Power-up Bars
                let barY = 110;
                if (boostTimer > 0) {
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(20, barY, boostTimer / 3, 10);
                    ctx.strokeStyle = 'white';
                    ctx.strokeRect(20, barY, 100, 10);
                    barY += 15;
                }
                if (magnetTimer > 0) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(20, barY, magnetTimer / 6, 10);
                    ctx.strokeStyle = 'white';
                    ctx.strokeRect(20, barY, 100, 10);
                }
                if (shieldActive) {
                    ctx.drawImage(shieldImg.current, 150, 70, 30, 30);
                }
            }

            frameCount++;
            animationFrameId = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('touchstart', jump);
            window.removeEventListener('resize', handleResize);
        };
    }, [imagesLoaded, isStarted]);

    // Handle Auto-Start for Revive
    useEffect(() => {
        if (imagesLoaded && initialState && !isStarted) {
            setIsStarted(true);
        }
    }, [imagesLoaded, initialState]);

    if (!imagesLoaded) return <div className="text-white">Loading Assets...</div>;

    return (
        <div className="w-full h-screen overflow-hidden bg-black flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    );
};

export default Game;
