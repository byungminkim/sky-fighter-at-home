// ============================================================
// GameScene - 메인 게임 (5단계 스테이지)
// ============================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLANE_DATA, STAGE_CONFIG } from '../config';
import type { EnemySprite, GameSceneInitData, PlaneKey, StageConfig } from '../types';

interface CloudObj {
    sprite: Phaser.GameObjects.Image;
    speed: number;
}

interface IslandObj {
    sprite: Phaser.GameObjects.Image;
    speed: number;
}

export class GameScene extends Phaser.Scene {
    // ---- 선택 데이터 ----
    private selectedPlane: PlaneKey = 'falcon';

    // ---- 배경 ----
    private background!: Phaser.GameObjects.TileSprite;
    private clouds: CloudObj[] = [];
    private islands: IslandObj[] = [];
    private fog1!: Phaser.GameObjects.TileSprite;
    private fog2!: Phaser.GameObjects.TileSprite;

    // ---- 게임 상태 ----
    private score: number = 0;
    private lives: number = 3;
    private currentStage: number = 0;
    private stageKills: number = 0;
    private isTransitioning: boolean = false;
    private bossActive: boolean = false;
    private isBossDefeating: boolean = false;  // ★ 보스 처치 중복 호출 방지 가드
    private boss: EnemySprite | null = null;
    private bossHPBar: Phaser.GameObjects.Rectangle | null = null;
    private bossHPBarBg: Phaser.GameObjects.Rectangle | null = null;
    private bossNameText: Phaser.GameObjects.Text | null = null;
    private maxAmmo: number = 300;
    private ammo: number = 300;

    // ---- 물리 그룹 ----
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private enemyMissiles!: Phaser.Physics.Arcade.Group;

    // ---- 플레이어 ----
    private player!: Phaser.Physics.Arcade.Sprite;
    private engineParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private engineParticles2!: Phaser.GameObjects.Particles.ParticleEmitter;

    // ---- 입력 ----
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey!: Phaser.Input.Keyboard.Key;

    // ---- 플레이어 스탯 ----
    private playerSpeed: number = 450;
    private fireRate: number = 160;
    private bulletCount: number = 2;
    private bulletSpeed: number = -550;
    private lastFired: number = 0;

    // ---- 타이머 ----
    private enemySpawnTimer: Phaser.Time.TimerEvent | null = null;
    private missileTimer: Phaser.Time.TimerEvent | null = null;

    // ---- UI ----
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;
    private killBarFill!: Phaser.GameObjects.Rectangle;
    private ammoText!: Phaser.GameObjects.Text;
    private isInvincible: boolean = false;

    constructor() {
        super('GameScene');
    }

    init(data: GameSceneInitData): void {
        this.selectedPlane = data.selectedPlane || 'falcon';
    }

    create(): void {
        const planeData = PLANE_DATA[this.selectedPlane];

        // ---- 배경 ----
        this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg').setOrigin(0, 0).setDepth(0);
        this.clouds = [];
        this.spawnInitialClouds();
        this.islands = [];
        this.spawnInitialIslands();
        this.fog1 = this.add.tileSprite(0, GAME_HEIGHT - 150, GAME_WIDTH, 120, 'fog').setOrigin(0, 0).setDepth(2).setAlpha(0.5);
        this.fog2 = this.add.tileSprite(0, GAME_HEIGHT - 80, GAME_WIDTH, 120, 'fog').setOrigin(0, 0).setDepth(2).setAlpha(0.3);

        // ---- 게임 상태 ----
        this.score = 0;
        this.lives = planeData.lives;
        this.currentStage = 0;
        this.stageKills = 0;
        this.isTransitioning = false;
        this.bossActive = false;
        this.isBossDefeating = false;
        this.boss = null;
        this.bossHPBar = null;
        this.bossHPBarBg = null;
        this.bossNameText = null;
        this.maxAmmo = 300;
        this.ammo = this.maxAmmo;

        // ---- 물리 그룹 ----
        this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 60 });
        this.enemies = this.physics.add.group();
        this.enemyMissiles = this.physics.add.group({ defaultKey: 'missile', maxSize: 100 });

        // ---- 플레이어 ----
        this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 100, `plane_${this.selectedPlane}`);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.setScale(1.1);

        // 엔진 파티클
        const engineTint = [planeData.color.engine, 0xffffff];
        this.engineParticles = this.add.particles(0, 0, 'particle', {
            follow: this.player, followOffset: { x: -4, y: 36 },
            speed: { min: 30, max: 80 }, angle: { min: 80, max: 100 },
            scale: { start: 0.4, end: 0 }, lifespan: 300,
            tint: engineTint, frequency: 20, quantity: 1,
        }).setDepth(9);
        this.engineParticles2 = this.add.particles(0, 0, 'particle', {
            follow: this.player, followOffset: { x: 4, y: 36 },
            speed: { min: 30, max: 80 }, angle: { min: 80, max: 100 },
            scale: { start: 0.4, end: 0 }, lifespan: 300,
            tint: engineTint, frequency: 20, quantity: 1,
        }).setDepth(9);

        // ---- 입력 ----
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ---- 플레이어 스탯 ----
        this.playerSpeed = planeData.speed;
        this.fireRate = planeData.fireRate;
        this.bulletCount = planeData.bulletCount;
        this.bulletSpeed = planeData.bulletSpeed;
        this.lastFired = 0;

        // ---- UI (setupStage보다 먼저 생성해야 재시작 시 파괴된 참조 문제 방지) ----
        this.createUI();

        // ---- 스테이지 타이머 ----
        this.setupStage(0);

        // ---- 충돌 ----
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.overlap(this.player, this.enemyMissiles, this.playerHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHitByEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        // ---- 상태 ----
        this.isInvincible = false;

        // 스테이지 시작 연출
        this.showStageAnnouncement(0);
    }

    // ============================================================
    // 스테이지 관리
    // ============================================================

    private setupStage(stageIndex: number): void {
        this.currentStage = stageIndex;
        this.stageKills = 0;
        this.bossActive = false;
        this.isBossDefeating = false;
        this.ammo = this.maxAmmo;
        if (this.ammoText) {
            this.ammoText.setText(`${this.ammo}/${this.maxAmmo}`);
            this.ammoText.setColor('#ffffff');
        }
        const cfg = STAGE_CONFIG[stageIndex];

        // 기존 타이머 제거
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.missileTimer) this.missileTimer.remove();

        this.enemySpawnTimer = this.time.addEvent({
            delay: cfg.enemySpawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        this.missileTimer = this.time.addEvent({
            delay: cfg.missileDelay,
            callback: this.enemyFire,
            callbackScope: this,
            loop: true,
        });

        // 킬 바 초기화
        if (this.killBarFill) {
            this.killBarFill.setSize(1, 4);
        }
        // 스테이지 텍스트 UI 업데이트
        if (this.stageText) {
            this.stageText.setText(cfg.label);
        }

        // 플레이어 위치를 중앙 하단으로 리셋
        if (this.player && this.player.active) {
            this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 100);
            this.player.setVelocity(0);
        }
    }

    private showStageAnnouncement(stageIndex: number): void {
        const cfg = STAGE_CONFIG[stageIndex];
        this.isTransitioning = true;

        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000011, 0.6)
            .setDepth(30);

        const line1 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 0, 2, 0x00ccff, 0.8).setDepth(31);
        const line2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 0, 2, 0x00ccff, 0.8).setDepth(31);

        const stageLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, cfg.label, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#002244',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(31).setAlpha(0);

        const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, cfg.subtitle, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '16px',
            color: '#00ccff',
        }).setOrigin(0.5).setDepth(31).setAlpha(0);

        this.tweens.add({
            targets: [line1, line2],
            width: 500,
            duration: 400,
            ease: 'Power2',
        });

        this.time.delayedCall(300, () => {
            this.tweens.add({
                targets: [stageLabel, subtitle],
                alpha: 1,
                duration: 300,
            });
        });

        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [overlay, stageLabel, subtitle, line1, line2],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    stageLabel.destroy();
                    subtitle.destroy();
                    line1.destroy();
                    line2.destroy();
                    this.isTransitioning = false;
                },
            });
        });
    }

    private showStageClear(): void {
        this.isTransitioning = true;

        // 적 스폰/미사일 타이머 중지
        if (this.enemySpawnTimer) this.enemySpawnTimer.paused = true;
        if (this.missileTimer) this.missileTimer.paused = true;

        // 모든 적과 미사일 완전 제거
        this.enemies.getChildren().slice().forEach((e) => {
            if (e && e.active) e.destroy();
        });
        this.enemyMissiles.getChildren().slice().forEach((m) => {
            if (m && m.active) m.destroy();
        });

        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000033, 0.5)
            .setDepth(30);

        const isLastStage = this.currentStage >= STAGE_CONFIG.length - 1;

        const clearText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20,
            isLastStage ? 'MISSION COMPLETE!' : 'STAGE CLEAR!', {
            fontFamily: 'Orbitron, monospace',
            fontSize: isLastStage ? '36px' : '42px',
            fontStyle: 'bold',
            color: isLastStage ? '#ffdd00' : '#00ff88',
            stroke: isLastStage ? '#332200' : '#003322',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(31).setAlpha(0).setScale(0.5);

        const bonusAmount = isLastStage ? 5000 : 2500;
        const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30,
            `+${bonusAmount} BONUS`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '22px',
            color: '#ffcc00',
        }).setOrigin(0.5).setDepth(31).setAlpha(0);

        this.tweens.add({
            targets: clearText,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
        });

        this.time.delayedCall(400, () => {
            this.tweens.add({
                targets: bonusText,
                alpha: 1,
                y: GAME_HEIGHT / 2 + 20,
                duration: 400,
            });
            this.score += bonusAmount;
            this.scoreText.setText(this.score.toString());
        });

        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: [overlay, clearText, bonusText],
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    overlay.destroy();
                    clearText.destroy();
                    bonusText.destroy();

                    if (isLastStage) {
                        this.scene.start('GameOverScene', {
                            score: this.score,
                            stage: this.currentStage + 1,
                            cleared: true,
                        });
                    } else {
                        const nextStage = this.currentStage + 1;
                        this.setupStage(nextStage);
                        this.showStageAnnouncement(nextStage);
                    }
                },
            });
        });
    }

    // ============================================================
    // UI
    // ============================================================

    private createUI(): void {
        this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 30, 50, 0x000022, 0.5)
            .setDepth(20).setStrokeStyle(1, 0x4466aa, 0.3);

        this.add.text(30, 12, 'SCORE:', {
            fontFamily: 'Orbitron, monospace', fontSize: '16px', color: '#8899bb',
        }).setDepth(21);
        this.scoreText = this.add.text(110, 8, '0', {
            fontFamily: 'Orbitron, monospace', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
        }).setDepth(21);

        this.add.text(GAME_WIDTH - 130, 12, 'LIVES:', {
            fontFamily: 'Orbitron, monospace', fontSize: '16px', color: '#8899bb',
        }).setDepth(21);
        this.livesText = this.add.text(GAME_WIDTH - 55, 8, this.lives.toString(), {
            fontFamily: 'Orbitron, monospace', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
        }).setDepth(21);

        this.stageText = this.add.text(GAME_WIDTH / 2, 18, STAGE_CONFIG[0].label, {
            fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#6688aa',
        }).setOrigin(0.5, 0.5).setDepth(21);

        const barW = 200;
        this.add.rectangle(GAME_WIDTH / 2, 38, barW, 6, 0x222244, 0.8)
            .setDepth(21).setStrokeStyle(1, 0x334466, 0.3);
        this.killBarFill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2 + 1, 38, 1, 4, 0x00ccff, 1)
            .setDepth(22).setOrigin(0, 0.5);

        this.add.text(GAME_WIDTH / 2 + barW / 2 + 15, 30, 'AMMO:', {
            fontFamily: 'Orbitron, monospace', fontSize: '11px', color: '#8899bb',
        }).setDepth(21).setOrigin(0, 0.5);
        this.ammoText = this.add.text(GAME_WIDTH / 2 + barW / 2 + 65, 30, `${this.ammo}/${this.maxAmmo}`, {
            fontFamily: 'Orbitron, monospace', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
        }).setDepth(21).setOrigin(0, 0.5);
    }

    // ============================================================
    // 배경
    // ============================================================

    private spawnInitialClouds(): void {
        const types = ['cloud_big', 'cloud_med', 'cloud_small'];
        for (let i = 0; i < 6; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const cloud = this.add.image(
                Math.random() * (GAME_WIDTH + 100) - 50,
                Math.random() * GAME_HEIGHT,
                type,
            ).setDepth(1).setAlpha(0.4 + Math.random() * 0.3);
            this.clouds.push({ sprite: cloud, speed: Phaser.Math.Between(15, 40) });
        }
    }

    private spawnInitialIslands(): void {
        for (let i = 0; i < 2; i++) {
            const x = Math.random() < 0.5 ? Phaser.Math.Between(-20, 80) : Phaser.Math.Between(GAME_WIDTH - 120, GAME_WIDTH + 20);
            const island = this.add.image(x, Phaser.Math.Between(100, GAME_HEIGHT - 200), 'island')
                .setDepth(1).setAlpha(0.5);
            this.islands.push({ sprite: island, speed: Phaser.Math.Between(20, 35) });
        }
    }

    // ============================================================
    // 메인 루프
    // ============================================================

    update(time: number): void {
        // 배경 스크롤
        this.background.tilePositionY -= 1.5;
        this.clouds.forEach((c) => {
            c.sprite.y += c.speed * 0.016;
            if (c.sprite.y > GAME_HEIGHT + 60) {
                c.sprite.y = -60;
                c.sprite.x = Math.random() * (GAME_WIDTH + 100) - 50;
            }
        });
        this.islands.forEach((isl) => {
            isl.sprite.y += isl.speed * 0.016;
            if (isl.sprite.y > GAME_HEIGHT + 80) {
                isl.sprite.y = -80;
                isl.sprite.x = Math.random() < 0.5 ? Phaser.Math.Between(-20, 80) : Phaser.Math.Between(GAME_WIDTH - 120, GAME_WIDTH + 20);
            }
        });
        this.fog1.tilePositionX += 0.3;
        this.fog2.tilePositionX -= 0.2;

        if (!this.player.active || this.isTransitioning) return;

        // 플레이어 이동
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-this.playerSpeed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(this.playerSpeed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-this.playerSpeed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(this.playerSpeed);

        // 총알 발사
        if (this.spaceKey.isDown && time > this.lastFired && this.ammo > 0) {
            this.fireBullet();
            this.lastFired = time + this.fireRate;
        }

        // 정리
        this.enemies.getChildren().slice().forEach((e) => { const s = e as EnemySprite; if (s.y > GAME_HEIGHT + 50) s.destroy(); });
        this.enemyMissiles.getChildren().slice().forEach((m) => { const s = m as Phaser.Physics.Arcade.Sprite; if (s.y > GAME_HEIGHT + 20) s.destroy(); });
        this.bullets.getChildren().slice().forEach((b) => {
            const sprite = b as Phaser.Physics.Arcade.Sprite;
            if (sprite.active && sprite.y < -20) {
                sprite.setActive(false).setVisible(false);
                sprite.body?.stop();
            }
        });
    }

    // ============================================================
    // 전투 로직
    // ============================================================

    private fireBullet(): void {
        let shotsUsed = 0;
        if (this.bulletCount === 1) {
            const b = this.bullets.get(this.player.x, this.player.y - 30) as Phaser.Physics.Arcade.Sprite | null;
            if (b) { b.setActive(true).setVisible(true); b.body!.enable = true; b.setVelocityY(this.bulletSpeed); b.setDepth(5); shotsUsed = 1; }
        } else if (this.bulletCount === 2) {
            [-8, 8].forEach((ox) => {
                const b = this.bullets.get(this.player.x + ox, this.player.y - 30) as Phaser.Physics.Arcade.Sprite | null;
                if (b) { b.setActive(true).setVisible(true); b.body!.enable = true; b.setVelocityY(this.bulletSpeed); b.setDepth(5); shotsUsed++; }
            });
        } else if (this.bulletCount === 3) {
            const offsets = [
                { x: 0, vx: 0, vy: this.bulletSpeed },
                { x: -10, vx: -60, vy: this.bulletSpeed },
                { x: 10, vx: 60, vy: this.bulletSpeed },
            ];
            offsets.forEach(({ x, vx, vy }) => {
                const b = this.bullets.get(this.player.x + x, this.player.y - 30) as Phaser.Physics.Arcade.Sprite | null;
                if (b) { b.setActive(true).setVisible(true); b.body!.enable = true; b.setVelocity(vx, vy); b.setDepth(5); shotsUsed++; }
            });
        }
        this.ammo = Math.max(0, this.ammo - shotsUsed);
        if (this.ammoText) this.ammoText.setText(`${this.ammo}/${this.maxAmmo}`);
        if (this.ammoText) {
            if (this.ammo <= 50) this.ammoText.setColor('#ff4444');
            else if (this.ammo <= 100) this.ammoText.setColor('#ffaa00');
            else this.ammoText.setColor('#ffffff');
        }
    }

    private spawnEnemy(): void {
        if (this.isTransitioning || this.bossActive) return;
        const cfg = STAGE_CONFIG[this.currentStage];
        const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
        const enemy = this.enemies.create(x, -40, 'enemy') as EnemySprite;
        enemy.setVelocityY(Phaser.Math.Between(cfg.enemySpeed[0], cfg.enemySpeed[1]));
        enemy.hp = cfg.enemyHP;
        enemy.setDepth(5);
        this.tweens.add({
            targets: enemy,
            x: enemy.x + Phaser.Math.Between(-40, 40),
            duration: Phaser.Math.Between(1000, 2000),
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
    }

    private enemyFire(): void {
        if (this.isTransitioning) return;
        const cfg = STAGE_CONFIG[this.currentStage];
        const activeEnemies = (this.enemies.getChildren() as EnemySprite[]).filter(
            (e) => e.active && !e.isBoss && e.y > 0 && e.y < GAME_HEIGHT - 100,
        );
        activeEnemies.forEach((enemy) => {
            if (Math.random() < cfg.missileChance) {
                this.fireEnemyMissile(enemy.x, enemy.y + 24, cfg);
            }
        });
        if (this.bossActive && this.boss && this.boss.active) {
            this.fireBossMissiles(cfg);
        }
    }

    private fireEnemyMissile(x: number, y: number, cfg: StageConfig): void {
        const missile = this.enemyMissiles.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
        if (!missile) return;
        missile.setActive(true).setVisible(true);
        missile.body!.enable = true;
        missile.setDepth(5);
        const speed = Phaser.Math.Between(cfg.missileSpeed[0], cfg.missileSpeed[1]);
        const roll = Math.random();
        if (roll < cfg.aimedChance && this.player.active) {
            const angle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
            missile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        } else if (roll < cfg.aimedChance + cfg.diagonalChance) {
            const vx = Phaser.Math.Between(-180, 180);
            missile.setVelocity(vx, speed);
        } else {
            missile.setVelocityY(speed);
        }
    }

    private fireBossMissiles(cfg: StageConfig): void {
        if (!this.boss) return;
        const boss = this.boss;
        const speed = Phaser.Math.Between(cfg.missileSpeed[0], cfg.missileSpeed[1]) * 1.1;
        const bulletCount = 5 + Math.floor(this.currentStage / 2);
        const spread = 60 + this.currentStage * 10;
        const startAngle = 90 - spread / 2;
        for (let i = 0; i < bulletCount; i++) {
            const angleDeg = startAngle + (spread / (bulletCount - 1)) * i;
            const angleRad = Phaser.Math.DegToRad(angleDeg);
            const missile = this.enemyMissiles.get(boss.x, boss.y + 50) as Phaser.Physics.Arcade.Sprite | null;
            if (missile) {
                missile.setActive(true).setVisible(true);
                missile.body!.enable = true;
                missile.setDepth(5);
                missile.setVelocity(Math.cos(angleRad) * speed, Math.sin(angleRad) * speed);
            }
        }
        if (Math.random() < 0.4 && this.player.active) {
            const aimed = this.enemyMissiles.get(boss.x, boss.y + 50) as Phaser.Physics.Arcade.Sprite | null;
            if (aimed) {
                aimed.setActive(true).setVisible(true);
                aimed.body!.enable = true;
                aimed.setDepth(5);
                const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
                aimed.setVelocity(Math.cos(angle) * speed * 1.2, Math.sin(angle) * speed * 1.2);
            }
        }
    }

    // ============================================================
    // 충돌 처리
    // ============================================================

    private hitEnemy(_bullet: Phaser.GameObjects.GameObject, _enemy: Phaser.GameObjects.GameObject): void {
        const bullet = _bullet as Phaser.Physics.Arcade.Sprite;
        const enemy = _enemy as EnemySprite;

        bullet.setActive(false).setVisible(false);
        bullet.body?.stop();
        if (bullet.body) bullet.body.enable = false;
        enemy.hp--;

        // 보스 피격 처리
        if (enemy.isBoss) {
            this.updateBossHPBar();
            this.tweens.add({ targets: enemy, alpha: 0.4, duration: 40, yoyo: true });
            this.cameras.main.shake(80, 0.003);
            if (enemy.hp <= 0) {
                this.bossDefeated();
            }
            return;
        }

        if (enemy.hp <= 0) {
            this.createExplosion(enemy.x, enemy.y);
            enemy.destroy();
            this.score += 100;
            this.scoreText.setText(this.score.toString());

            if (!this.bossActive) {
                this.stageKills++;
                const cfg = STAGE_CONFIG[this.currentStage];
                const ratio = Math.min(1, this.stageKills / cfg.killsToAdvance);
                this.killBarFill.setSize(Math.max(1, ratio * 198), 4);

                if (this.stageKills >= cfg.killsToAdvance) {
                    this.spawnBoss();
                }
            }
        } else {
            this.tweens.add({ targets: enemy, alpha: 0.3, duration: 60, yoyo: true, repeat: 1 });
        }
    }

    // ============================================================
    // 보스 관리
    // ============================================================

    private spawnBoss(): void {
        this.bossActive = true;
        const cfg = STAGE_CONFIG[this.currentStage];

        // 기존 적 제거
        this.enemies.getChildren().slice().forEach((e) => {
            const enemy = e as EnemySprite;
            if (enemy && enemy.active && !enemy.isBoss) {
                this.createExplosion(enemy.x, enemy.y);
                enemy.destroy();
            }
        });

        // WARNING 텍스트
        const warning = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '⚠ WARNING ⚠', {
            fontFamily: 'Orbitron, monospace', fontSize: '40px', fontStyle: 'bold',
            color: '#ff2222', stroke: '#440000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(25).setAlpha(0);
        this.tweens.add({
            targets: warning, alpha: 1, duration: 200, yoyo: true, repeat: 3,
            onComplete: () => warning.destroy(),
        });
        this.cameras.main.shake(400, 0.008);

        // 보스 생성
        this.time.delayedCall(1500, () => {
            this.boss = this.enemies.create(GAME_WIDTH / 2, -80, 'boss') as EnemySprite;
            this.boss.hp = cfg.bossHP;
            this.boss.maxHP = cfg.bossHP;
            this.boss.isBoss = true;
            this.boss.setDepth(8);
            this.boss.setScale(1.3);

            this.tweens.add({
                targets: this.boss, y: 120, duration: 2000, ease: 'Power2',
                onComplete: () => {
                    if (this.boss && this.boss.active) {
                        this.tweens.add({
                            targets: this.boss,
                            x: { from: GAME_WIDTH * 0.25, to: GAME_WIDTH * 0.75 },
                            duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                        });
                    }
                },
            });

            // 보스 HP 바
            this.bossNameText = this.add.text(GAME_WIDTH / 2, 65, `BOSS - ${cfg.subtitle}`, {
                fontFamily: 'Orbitron, monospace', fontSize: '12px', color: '#ff6666',
            }).setOrigin(0.5).setDepth(21);
            const barW = 300;
            this.bossHPBarBg = this.add.rectangle(GAME_WIDTH / 2, 80, barW, 10, 0x330000, 0.8)
                .setDepth(21).setStrokeStyle(1, 0xff3333, 0.5);
            this.bossHPBar = this.add.rectangle(GAME_WIDTH / 2 - barW / 2 + 1, 80, barW - 2, 8, 0xff2222, 1)
                .setDepth(22).setOrigin(0, 0.5);
        });
    }

    private updateBossHPBar(): void {
        if (!this.boss || !this.bossHPBar) return;
        const ratio = Math.max(0, this.boss.hp / (this.boss.maxHP ?? 1));
        this.bossHPBar.setSize(Math.max(1, ratio * 298), 8);
        if (ratio < 0.3) this.bossHPBar.setFillStyle(0xff0000, 1);
        else if (ratio < 0.6) this.bossHPBar.setFillStyle(0xff6600, 1);
    }

    private bossDefeated(): void {
        // ★ 가드: 이미 보스 처치 시퀀스가 진행 중이면 중복 호출 무시
        if (this.isBossDefeating) return;
        this.isBossDefeating = true;
        this.isTransitioning = true;  // 플레이어 액션 차단 (사격/이동)
        this.bossActive = false;

        // 타이머 일시 중지
        if (this.enemySpawnTimer) this.enemySpawnTimer.paused = true;
        if (this.missileTimer) this.missileTimer.paused = true;

        // 큰 폭발 연출
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 200, () => {
                if (this.boss && this.boss.active) {
                    const ox = Phaser.Math.Between(-40, 40);
                    const oy = Phaser.Math.Between(-30, 30);
                    this.createExplosion(this.boss.x + ox, this.boss.y + oy);
                }
            });
        }
        this.time.delayedCall(1000, () => {
            if (this.boss) {
                this.createExplosion(this.boss.x, this.boss.y);
                const bigExp = this.add.image(this.boss.x, this.boss.y, 'explosion').setDepth(15).setScale(1);
                this.tweens.add({ targets: bigExp, scale: 4, alpha: 0, duration: 800, onComplete: () => bigExp.destroy() });
                this.cameras.main.shake(500, 0.02);
                this.cameras.main.flash(300, 255, 100, 0);
                this.boss.destroy();
                this.boss = null;
            }
            // HP바 제거
            if (this.bossHPBar) { this.bossHPBar.destroy(); this.bossHPBar = null; }
            if (this.bossHPBarBg) { this.bossHPBarBg.destroy(); this.bossHPBarBg = null; }
            if (this.bossNameText) { this.bossNameText.destroy(); this.bossNameText = null; }
            this.score += 2000;
            this.scoreText.setText(this.score.toString());
            this.showStageClear();
        });
    }

    // ============================================================
    // 플레이어 피격
    // ============================================================

    private playerHit(_player: Phaser.GameObjects.GameObject, _missile: Phaser.GameObjects.GameObject): void {
        if (this.isInvincible || this.isTransitioning) return;
        const missile = _missile as Phaser.Physics.Arcade.Sprite;
        missile.setActive(false).setVisible(false);
        missile.body?.stop();
        if (missile.body) missile.body.enable = false;
        this.takeDamage();
    }

    private playerHitByEnemy(_player: Phaser.GameObjects.GameObject, _enemy: Phaser.GameObjects.GameObject): void {
        if (this.isInvincible || this.isTransitioning) return;
        const enemy = _enemy as EnemySprite;
        if (enemy.isBoss) return;
        this.createExplosion(enemy.x, enemy.y);
        enemy.destroy();
        this.takeDamage();
    }

    private takeDamage(): void {
        this.lives--;
        this.livesText.setText(this.lives.toString());
        this.cameras.main.shake(200, 0.01);

        const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0.3).setDepth(50);
        this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });

        if (this.lives <= 0) {
            this.createExplosion(this.player.x, this.player.y);
            this.player.setActive(false).setVisible(false);
            this.engineParticles.stop();
            this.engineParticles2.stop();
            this.time.delayedCall(1200, () => {
                this.scene.start('GameOverScene', { score: this.score, stage: this.currentStage + 1 });
            });
        } else {
            this.isInvincible = true;
            this.ammo = this.maxAmmo;
            if (this.ammoText) {
                this.ammoText.setText(`${this.ammo}/${this.maxAmmo}`);
                this.ammoText.setColor('#ffffff');
            }
            this.tweens.add({
                targets: this.player, alpha: 0.2, duration: 80, yoyo: true, repeat: 9,
                onComplete: () => { this.isInvincible = false; this.player.setAlpha(1); },
            });
        }
    }

    // ============================================================
    // 이펙트
    // ============================================================

    private createExplosion(x: number, y: number): void {
        const exp = this.add.image(x, y, 'explosion').setDepth(15).setScale(0.5);
        this.tweens.add({ targets: exp, scale: 1.8, alpha: 0, duration: 400, onComplete: () => exp.destroy() });
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 60, max: 250 }, angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 }, lifespan: 500,
            tint: [0xff6600, 0xff3300, 0xffaa00, 0xffcc00], quantity: 20, emitting: false,
        }).setDepth(15);
        particles.explode();
        this.time.delayedCall(600, () => particles.destroy());
    }
}
