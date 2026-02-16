// ============================================================
// Sky Fighter - Phaser.js 1인용 비행기 슈팅 게임
// 기능: 비행기 3종 선택, 5단계 스테이지 시스템
// ============================================================

const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

// 비행기 스탯 정의
const PLANE_DATA = {
    falcon: {
        name: 'FALCON',
        desc: '균형잡힌 전투기',
        speed: 450,
        fireRate: 160,
        lives: 3,
        bulletSpeed: -550,
        bulletCount: 2,
        color: { body: 0x4466aa, highlight: 0x7799cc, cockpit: 0x66ddff, wing: 0x3355aa, engine: 0x00ff66 },
    },
    thunder: {
        name: 'THUNDER',
        desc: '강력한 화력의 폭격기',
        speed: 350,
        fireRate: 220,
        lives: 5,
        bulletSpeed: -450,
        bulletCount: 3,
        color: { body: 0x886633, highlight: 0xaa8844, cockpit: 0xffcc44, wing: 0x775522, engine: 0xff8800 },
    },
    phantom: {
        name: 'PHANTOM',
        desc: '빠른 경량 전투기',
        speed: 600,
        fireRate: 100,
        lives: 2,
        bulletSpeed: -700,
        bulletCount: 1,
        color: { body: 0x664488, highlight: 0x8866aa, cockpit: 0xcc66ff, wing: 0x553377, engine: 0xcc44ff },
    },
    viper: {
        name: 'VIPER',
        desc: '독사처럼 빠른 요격기',
        speed: 550,
        fireRate: 130,
        lives: 2,
        bulletSpeed: -650,
        bulletCount: 2,
        color: { body: 0x228844, highlight: 0x44aa66, cockpit: 0x44ff88, wing: 0x116633, engine: 0x00ff44 },
    },
    raptor: {
        name: 'RAPTOR',
        desc: '최신예 스텔스 전투기',
        speed: 480,
        fireRate: 140,
        lives: 4,
        bulletSpeed: -580,
        bulletCount: 3,
        color: { body: 0x555555, highlight: 0x888888, cockpit: 0xaaddff, wing: 0x444444, engine: 0x44aaff },
    },
};

// 스테이지 설정
const STAGE_CONFIG = [
    { // Stage 1 - 입문
        enemySpawnDelay: 1600,
        missileDelay: 2200,
        enemySpeed: [140, 220],
        enemyHP: 1,
        missileSpeed: [220, 320],
        missileChance: 0.4,
        diagonalChance: 0.2,
        aimedChance: 0.1,
        killsToAdvance: 12,
        bossHP: 30,
        label: 'STAGE 1',
        subtitle: '정찰 구역',
    },
    { // Stage 2 - 전초전
        enemySpawnDelay: 1200,
        missileDelay: 1800,
        enemySpeed: [170, 260],
        enemyHP: 2,
        missileSpeed: [250, 370],
        missileChance: 0.5,
        diagonalChance: 0.35,
        aimedChance: 0.2,
        killsToAdvance: 15,
        bossHP: 40,
        label: 'STAGE 2',
        subtitle: '적 전초기지',
    },
    { // Stage 3 - 격전
        enemySpawnDelay: 950,
        missileDelay: 1400,
        enemySpeed: [200, 300],
        enemyHP: 2,
        missileSpeed: [280, 420],
        missileChance: 0.6,
        diagonalChance: 0.45,
        aimedChance: 0.3,
        killsToAdvance: 18,
        bossHP: 50,
        label: 'STAGE 3',
        subtitle: '치열한 교전',
    },
    { // Stage 4 - 돌파
        enemySpawnDelay: 750,
        missileDelay: 1100,
        enemySpeed: [230, 340],
        enemyHP: 3,
        missileSpeed: [320, 460],
        missileChance: 0.7,
        diagonalChance: 0.5,
        aimedChance: 0.4,
        killsToAdvance: 20,
        bossHP: 60,
        label: 'STAGE 4',
        subtitle: '적 요새 돌파',
    },
    { // Stage 5 - 최종결전
        enemySpawnDelay: 600,
        missileDelay: 900,
        enemySpeed: [260, 380],
        enemyHP: 3,
        missileSpeed: [350, 500],
        missileChance: 0.8,
        diagonalChance: 0.6,
        aimedChance: 0.5,
        killsToAdvance: 999,
        bossHP: 80,
        label: 'STAGE 5',
        subtitle: '최종 결전',
    },
];

// ============================================================
// BootScene - 에셋 생성
// ============================================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    create() {
        // 모든 비행기 텍스처 생성
        Object.keys(PLANE_DATA).forEach((key) => {
            this.createPlaneTexture(key, PLANE_DATA[key].color, key === 'thunder' || key === 'raptor');
        });
        this.createEnemyTexture();
        this.createBossTexture();
        this.createBulletTexture();
        this.createMissileTexture();
        this.createParticleTexture();
        this.createBackgroundTexture();
        this.createCloudTextures();
        this.createFloatingIslandTexture();
        this.createExplosionTexture();

        this.scene.start('SelectScene');
    }

    // 범용 플레이어 비행기 텍스처 생성
    createPlaneTexture(key, c, isHeavy) {
        const w = 64, h = 72;
        const gfx = this.make.graphics({ add: false });

        // 그림자
        gfx.fillStyle(0x000033, 0.3);
        gfx.fillEllipse(32, 40, 50, 20);

        // 동체
        gfx.fillStyle(c.body, 1);
        gfx.beginPath();
        gfx.moveTo(32, 4);
        gfx.lineTo(38, 20);
        gfx.lineTo(40, 50);
        gfx.lineTo(36, 64);
        gfx.lineTo(28, 64);
        gfx.lineTo(24, 50);
        gfx.lineTo(26, 20);
        gfx.closePath();
        gfx.fillPath();

        // 하이라이트
        gfx.fillStyle(c.highlight, 1);
        gfx.beginPath();
        gfx.moveTo(32, 6);
        gfx.lineTo(35, 20);
        gfx.lineTo(36, 48);
        gfx.lineTo(32, 60);
        gfx.lineTo(30, 48);
        gfx.lineTo(29, 20);
        gfx.closePath();
        gfx.fillPath();

        // 콕핏
        gfx.fillStyle(c.cockpit, 1);
        gfx.fillEllipse(32, 22, 6, 8);

        // 날개 (heavy면 더 넓게)
        const wingSpread = isHeavy ? 5 : 0;
        gfx.fillStyle(c.wing, 1);
        gfx.beginPath();
        gfx.moveTo(24, 30);
        gfx.lineTo(2 - wingSpread, 48);
        gfx.lineTo(2 - wingSpread, 52);
        gfx.lineTo(8, 50);
        gfx.lineTo(22, 44);
        gfx.closePath();
        gfx.fillPath();

        gfx.beginPath();
        gfx.moveTo(40, 30);
        gfx.lineTo(62 + wingSpread, 48);
        gfx.lineTo(62 + wingSpread, 52);
        gfx.lineTo(56, 50);
        gfx.lineTo(42, 44);
        gfx.closePath();
        gfx.fillPath();

        // 꼬리 날개
        gfx.fillStyle(c.wing, 1);
        gfx.beginPath();
        gfx.moveTo(28, 54); gfx.lineTo(16, 66); gfx.lineTo(18, 68); gfx.lineTo(28, 62);
        gfx.closePath(); gfx.fillPath();
        gfx.beginPath();
        gfx.moveTo(36, 54); gfx.lineTo(48, 66); gfx.lineTo(46, 68); gfx.lineTo(36, 62);
        gfx.closePath(); gfx.fillPath();

        // 엔진
        gfx.fillStyle(c.engine, 1);
        gfx.fillCircle(28, 66, 3);
        gfx.fillCircle(36, 66, 3);
        gfx.fillStyle(0xffffff, 0.6);
        gfx.fillCircle(28, 66, 1.5);
        gfx.fillCircle(36, 66, 1.5);

        // 기수 팁
        gfx.fillStyle(0xccddff, 1);
        gfx.fillCircle(32, 6, 2);

        gfx.generateTexture(`plane_${key}`, w, h);
    }

    createEnemyTexture() {
        const w = 48, h = 48;
        const gfx = this.make.graphics({ add: false });
        gfx.fillStyle(0x443333, 1);
        gfx.beginPath();
        gfx.moveTo(24, 44); gfx.lineTo(30, 28); gfx.lineTo(32, 10);
        gfx.lineTo(28, 4); gfx.lineTo(20, 4); gfx.lineTo(16, 10); gfx.lineTo(18, 28);
        gfx.closePath(); gfx.fillPath();
        gfx.fillStyle(0x664444, 1);
        gfx.beginPath();
        gfx.moveTo(24, 42); gfx.lineTo(28, 28); gfx.lineTo(28, 12);
        gfx.lineTo(24, 6); gfx.lineTo(22, 12); gfx.lineTo(20, 28);
        gfx.closePath(); gfx.fillPath();
        gfx.fillStyle(0xff2222, 1);
        gfx.fillEllipse(24, 14, 6, 5);
        gfx.fillStyle(0x553333, 1);
        gfx.beginPath();
        gfx.moveTo(16, 16); gfx.lineTo(2, 8); gfx.lineTo(0, 12); gfx.lineTo(4, 14); gfx.lineTo(14, 24);
        gfx.closePath(); gfx.fillPath();
        gfx.beginPath();
        gfx.moveTo(32, 16); gfx.lineTo(46, 8); gfx.lineTo(48, 12); gfx.lineTo(44, 14); gfx.lineTo(34, 24);
        gfx.closePath(); gfx.fillPath();
        gfx.fillStyle(0xff6600, 0.9);
        gfx.fillCircle(22, 4, 2.5); gfx.fillCircle(26, 4, 2.5);
        gfx.fillStyle(0xff0000, 0.8);
        gfx.fillCircle(2, 10, 1.5); gfx.fillCircle(46, 10, 1.5);
        gfx.generateTexture('enemy', w, h);
    }

    createBossTexture() {
        const w = 128, h = 120;
        const gfx = this.make.graphics({ add: false });
        // 본체 (큰 삼각형)
        gfx.fillStyle(0x882222, 1);
        gfx.beginPath();
        gfx.moveTo(64, 110); gfx.lineTo(78, 60); gfx.lineTo(80, 20);
        gfx.lineTo(72, 6); gfx.lineTo(56, 6); gfx.lineTo(48, 20); gfx.lineTo(50, 60);
        gfx.closePath(); gfx.fillPath();
        // 하이라이트
        gfx.fillStyle(0xaa4444, 1);
        gfx.beginPath();
        gfx.moveTo(64, 105); gfx.lineTo(74, 60); gfx.lineTo(74, 22);
        gfx.lineTo(64, 10); gfx.lineTo(58, 22); gfx.lineTo(54, 60);
        gfx.closePath(); gfx.fillPath();
        // 콕핏 (빨간 빛)
        gfx.fillStyle(0xff0000, 1);
        gfx.fillEllipse(64, 28, 10, 8);
        gfx.fillStyle(0xff4444, 0.8);
        gfx.fillEllipse(64, 28, 6, 5);
        // 왼쪽 큰 날개
        gfx.fillStyle(0x772222, 1);
        gfx.beginPath();
        gfx.moveTo(48, 35); gfx.lineTo(4, 50); gfx.lineTo(0, 58);
        gfx.lineTo(6, 62); gfx.lineTo(20, 58); gfx.lineTo(44, 50);
        gfx.closePath(); gfx.fillPath();
        // 오른쪽 큰 날개
        gfx.beginPath();
        gfx.moveTo(80, 35); gfx.lineTo(124, 50); gfx.lineTo(128, 58);
        gfx.lineTo(122, 62); gfx.lineTo(108, 58); gfx.lineTo(84, 50);
        gfx.closePath(); gfx.fillPath();
        // 꼬리 날개 (좌우)
        gfx.fillStyle(0x661111, 1);
        gfx.beginPath();
        gfx.moveTo(50, 80); gfx.lineTo(24, 108); gfx.lineTo(30, 112); gfx.lineTo(52, 95);
        gfx.closePath(); gfx.fillPath();
        gfx.beginPath();
        gfx.moveTo(78, 80); gfx.lineTo(104, 108); gfx.lineTo(98, 112); gfx.lineTo(76, 95);
        gfx.closePath(); gfx.fillPath();
        // 엔진 4개
        gfx.fillStyle(0xff6600, 1);
        gfx.fillCircle(54, 108, 4); gfx.fillCircle(74, 108, 4);
        gfx.fillCircle(32, 110, 3); gfx.fillCircle(96, 110, 3);
        gfx.fillStyle(0xffaa00, 0.8);
        gfx.fillCircle(54, 108, 2); gfx.fillCircle(74, 108, 2);
        // 무기 강조
        gfx.fillStyle(0xff0000, 0.9);
        gfx.fillCircle(4, 55, 3); gfx.fillCircle(124, 55, 3);
        gfx.fillCircle(24, 108, 2); gfx.fillCircle(104, 108, 2);
        // 장갑 디테일
        gfx.lineStyle(1, 0xcc3333, 0.5);
        gfx.lineBetween(64, 15, 64, 100);
        gfx.lineBetween(48, 40, 80, 40);
        gfx.generateTexture('boss', w, h);
    }

    createBulletTexture() {
        const gfx = this.make.graphics({ add: false });
        gfx.fillStyle(0xffcc00, 0.3);
        gfx.fillEllipse(5, 8, 10, 16);
        gfx.fillStyle(0xffdd44, 1);
        gfx.fillRect(3, 2, 4, 12);
        gfx.fillStyle(0xffeeaa, 1);
        gfx.fillRect(4, 3, 2, 10);
        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(5, 2, 2);
        gfx.generateTexture('bullet', 10, 16);
    }

    createMissileTexture() {
        const gfx = this.make.graphics({ add: false });
        gfx.fillStyle(0xff3300, 0.3);
        gfx.fillEllipse(5, 8, 10, 16);
        gfx.fillStyle(0xff4400, 1);
        gfx.fillRect(3, 2, 4, 14);
        gfx.fillStyle(0xff7744, 1);
        gfx.fillRect(4, 3, 2, 12);
        gfx.fillStyle(0xffaa00, 1);
        gfx.fillCircle(5, 14, 2);
        gfx.generateTexture('missile', 10, 16);
    }

    createParticleTexture() {
        const gfx = this.make.graphics({ add: false });
        gfx.fillStyle(0xffaa00, 1);
        gfx.fillCircle(6, 6, 6);
        gfx.fillStyle(0xffdd66, 0.7);
        gfx.fillCircle(5, 5, 3);
        gfx.generateTexture('particle', 12, 12);
    }

    createExplosionTexture() {
        const gfx = this.make.graphics({ add: false });
        gfx.fillStyle(0xff6600, 0.6); gfx.fillCircle(24, 24, 24);
        gfx.fillStyle(0xff9900, 0.7); gfx.fillCircle(24, 24, 16);
        gfx.fillStyle(0xffcc00, 0.9); gfx.fillCircle(24, 24, 8);
        gfx.fillStyle(0xffffcc, 1); gfx.fillCircle(24, 24, 4);
        gfx.generateTexture('explosion', 48, 48);
    }

    createBackgroundTexture() {
        const bgCanvas = this.textures.createCanvas('bg', GAME_WIDTH, GAME_HEIGHT);
        const ctx = bgCanvas.getContext();
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#1a0a3e');
        gradient.addColorStop(0.2, '#2a1560');
        gradient.addColorStop(0.4, '#3a2080');
        gradient.addColorStop(0.6, '#3a3098');
        gradient.addColorStop(0.8, '#3050a8');
        gradient.addColorStop(1, '#1a0a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * GAME_WIDTH;
            const y = Math.random() * GAME_HEIGHT;
            const r = Math.random() * 1.2 + 0.2;
            ctx.globalAlpha = Math.random() * 0.6 + 0.2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * GAME_WIDTH;
            const y = Math.random() * GAME_HEIGHT;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#aabbff';
            ctx.fillRect(x - 3, y - 0.5, 6, 1);
            ctx.fillRect(x - 0.5, y - 3, 1, 6);
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        bgCanvas.refresh();
    }

    createCloudTextures() {
        [['cloud_big', 240, 80, 100, 35, 0.25],
        ['cloud_med', 160, 60, 70, 25, 0.2],
        ['cloud_small', 100, 40, 40, 15, 0.15]].forEach(([name, w, h, rx, ry, alpha]) => {
            const c = this.textures.createCanvas(name, w, h);
            const ctx = c.getContext();
            this.drawCloud(ctx, w / 2, h / 2, rx, ry, alpha);
            c.refresh();
        });
        const fogCanvas = this.textures.createCanvas('fog', GAME_WIDTH, 120);
        const fctx = fogCanvas.getContext();
        const fogGrad = fctx.createLinearGradient(0, 0, 0, 120);
        fogGrad.addColorStop(0, 'rgba(180, 200, 240, 0)');
        fogGrad.addColorStop(0.5, 'rgba(180, 200, 240, 0.08)');
        fogGrad.addColorStop(1, 'rgba(180, 200, 240, 0)');
        fctx.fillStyle = fogGrad;
        fctx.fillRect(0, 0, GAME_WIDTH, 120);
        fogCanvas.refresh();
    }

    drawCloud(ctx, cx, cy, rx, ry, alpha) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#c8d8f0';
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dde8f8';
        ctx.beginPath(); ctx.ellipse(cx - rx * 0.3, cy - ry * 0.3, rx * 0.5, ry * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + rx * 0.25, cy - ry * 0.2, rx * 0.45, ry * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#eef4ff';
        ctx.beginPath(); ctx.ellipse(cx - rx * 0.15, cy - ry * 0.4, rx * 0.3, ry * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    }

    createFloatingIslandTexture() {
        const w = 120, h = 100;
        const canvas = this.textures.createCanvas('island', w, h);
        const ctx = canvas.getContext();
        ctx.fillStyle = '#3a4577';
        ctx.beginPath();
        ctx.moveTo(10, 40); ctx.lineTo(110, 35); ctx.lineTo(100, 45);
        ctx.lineTo(80, 90); ctx.lineTo(60, 95); ctx.lineTo(40, 85); ctx.lineTo(20, 50);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#4a5588';
        ctx.beginPath();
        ctx.moveTo(10, 40);
        ctx.quadraticCurveTo(30, 28, 50, 32);
        ctx.quadraticCurveTo(70, 25, 90, 30);
        ctx.quadraticCurveTo(105, 32, 110, 35);
        ctx.lineTo(100, 45); ctx.lineTo(20, 50);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(20, 50); ctx.lineTo(40, 85); ctx.lineTo(60, 95);
        ctx.lineTo(80, 90); ctx.lineTo(100, 45); ctx.stroke();
        ctx.globalAlpha = 0.8; ctx.fillStyle = '#ff6633';
        ctx.fillRect(35, 70, 8, 4); ctx.fillRect(75, 60, 6, 3);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#5566aa';
        ctx.beginPath(); ctx.moveTo(45, 32); ctx.lineTo(48, 14); ctx.lineTo(52, 32); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6677bb';
        ctx.beginPath(); ctx.moveTo(80, 28); ctx.lineTo(83, 10); ctx.lineTo(86, 28); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.moveTo(48, 14); ctx.lineTo(52, 32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(83, 10); ctx.lineTo(86, 28); ctx.stroke();
        ctx.globalAlpha = 1;
        canvas.refresh();
    }
}

// ============================================================
// SelectScene - 비행기 선택 화면
// ============================================================
class SelectScene extends Phaser.Scene {
    constructor() { super('SelectScene'); }

    create() {
        // 배경
        this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg').setOrigin(0, 0);

        // 타이틀
        this.add.text(GAME_WIDTH / 2, 70, 'SKY FIGHTER', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#00ccff',
            stroke: '#002244',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // 서브타이틀
        this.add.text(GAME_WIDTH / 2, 120, '전투기를 선택하세요', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '18px',
            color: '#8899bb',
        }).setOrigin(0.5);

        // 구분선
        this.add.rectangle(GAME_WIDTH / 2, 148, 500, 2, 0x4466aa, 0.5);

        const planes = Object.keys(PLANE_DATA);
        const maxCardW = Math.min(200, (GAME_WIDTH - 80) / planes.length - 20);
        const cardWidth = Math.max(140, maxCardW);
        const cardSpacing = Math.max(10, Math.min(25, (GAME_WIDTH - planes.length * cardWidth) / (planes.length + 1)));
        const totalWidth = planes.length * cardWidth + (planes.length - 1) * cardSpacing;
        const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;

        this.planeCards = [];

        planes.forEach((key, i) => {
            const data = PLANE_DATA[key];
            const cx = startX + i * (cardWidth + cardSpacing);
            const cy = 350;

            // 카드 배경
            const cardBg = this.add.rectangle(cx, cy, cardWidth, 320, 0x111133, 0.7)
                .setStrokeStyle(2, 0x3355aa, 0.6)
                .setInteractive({ useHandCursor: true });

            // 비행기 이미지
            const plane = this.add.image(cx, cy - 90, `plane_${key}`).setScale(2);

            // 이름
            this.add.text(cx, cy - 30, data.name, {
                fontFamily: 'Orbitron, monospace',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#ffffff',
            }).setOrigin(0.5);

            // 설명
            this.add.text(cx, cy, data.desc, {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                color: '#8899bb',
            }).setOrigin(0.5);

            // 스탯 바
            const statY = cy + 35;
            this.drawStatBar(cx, statY, '속도', data.speed / 600, cardWidth);
            this.drawStatBar(cx, statY + 35, '화력', data.bulletCount / 3, cardWidth);
            this.drawStatBar(cx, statY + 70, '내구', data.lives / 5, cardWidth);

            // 호버 & 클릭
            const glow = this.add.rectangle(cx, cy, cardWidth + 4, 324, 0x00ccff, 0)
                .setStrokeStyle(2, 0x00ccff, 0);

            cardBg.on('pointerover', () => {
                glow.setStrokeStyle(3, 0x00ccff, 0.8);
                cardBg.setFillStyle(0x1a1a44, 0.9);
                plane.setScale(2.2);
            });
            cardBg.on('pointerout', () => {
                glow.setStrokeStyle(2, 0x00ccff, 0);
                cardBg.setFillStyle(0x111133, 0.7);
                plane.setScale(2);
            });
            cardBg.on('pointerdown', () => {
                this.tweens.add({
                    targets: [cardBg, glow],
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150,
                    yoyo: true,
                    onComplete: () => {
                        this.scene.start('GameScene', { selectedPlane: key });
                    },
                });
            });

            this.planeCards.push({ cardBg, glow, plane });
        });

        // 조작법 안내
        const helpY = 550;
        this.add.rectangle(GAME_WIDTH / 2, helpY, 500, 2, 0x4466aa, 0.3);

        this.add.text(GAME_WIDTH / 2, helpY + 25, '조작법', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#66aacc',
        }).setOrigin(0.5);

        const controls = [
            ['↑ ↓ ← →', '비행기 이동'],
            ['SPACE', '총알 발사'],
        ];
        controls.forEach(([key, desc], i) => {
            const y = helpY + 55 + i * 32;
            this.add.text(GAME_WIDTH / 2 - 60, y, key, {
                fontFamily: 'Orbitron, monospace',
                fontSize: '15px',
                color: '#00ccff',
            }).setOrigin(1, 0.5);
            this.add.text(GAME_WIDTH / 2 - 40, y, desc, {
                fontFamily: 'sans-serif',
                fontSize: '15px',
                color: '#8899bb',
            }).setOrigin(0, 0.5);
        });
    }

    drawStatBar(cx, y, label, ratio, cardWidth) {
        const barW = Math.min(140, cardWidth - 10);
        this.add.text(cx - barW / 2, y, label, {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#6688aa',
        }).setOrigin(0, 0.5);
        // 배경
        this.add.rectangle(cx + 25, y, barW - 50, 8, 0x222244, 0.8).setStrokeStyle(1, 0x334466, 0.5);
        // 채움
        const fillW = Math.max(2, (barW - 52) * ratio);
        const color = ratio > 0.7 ? 0x00ff88 : ratio > 0.4 ? 0xffcc00 : 0xff6644;
        this.add.rectangle(cx + 25 - (barW - 52) / 2 + fillW / 2, y, fillW, 6, color, 1);
    }
}

// ============================================================
// GameScene - 메인 게임 (5단계 스테이지)
// ============================================================
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.selectedPlane = data.selectedPlane || 'falcon';
    }

    create() {
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
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ---- 플레이어 스탯 ----
        this.playerSpeed = planeData.speed;
        this.fireRate = planeData.fireRate;
        this.bulletCount = planeData.bulletCount;
        this.bulletSpeed = planeData.bulletSpeed;
        this.lastFired = 0;

        // ---- 스테이지 타이머 (create 후 설정) ----
        this.setupStage(0);

        // ---- 충돌 ----
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyMissiles, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHitByEnemy, null, this);

        // ---- UI ----
        this.createUI();

        // ---- 상태 ----
        this.isInvincible = false;

        // 스테이지 시작 연출
        this.showStageAnnouncement(0);
    }

    setupStage(stageIndex) {
        this.currentStage = stageIndex;
        this.stageKills = 0;
        this.ammo = this.maxAmmo;
        if (this.ammoText) this.ammoText.setText(`${this.ammo}/${this.maxAmmo}`);
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
    }

    showStageAnnouncement(stageIndex) {
        const cfg = STAGE_CONFIG[stageIndex];
        this.isTransitioning = true;

        // 어두운 오버레이
        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000011, 0.6)
            .setDepth(30);

        // 라인
        const line1 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 0, 2, 0x00ccff, 0.8).setDepth(31);
        const line2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 0, 2, 0x00ccff, 0.8).setDepth(31);

        // 스테이지 텍스트
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

        // 애니메이션 시퀀스
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

    showStageClear() {
        this.isTransitioning = true;

        // 모든 적과 미사일 제거
        this.enemies.clear(true, true);
        this.enemyMissiles.clear(true, true);

        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000033, 0.5)
            .setDepth(30);

        const clearText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'STAGE CLEAR!', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#00ff88',
            stroke: '#003322',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(31).setAlpha(0).setScale(0.5);

        const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, '+2500 BONUS', {
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
            this.score += 500;
            this.scoreText.setText(this.score.toString());
        });

        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [overlay, clearText, bonusText],
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    overlay.destroy();
                    clearText.destroy();
                    bonusText.destroy();
                    const nextStage = this.currentStage + 1;
                    this.setupStage(nextStage);
                    this.showStageAnnouncement(nextStage);
                    if (this.stageText) this.stageText.setText(STAGE_CONFIG[nextStage].label);
                },
            });
        });
    }

    createUI() {
        // 상단 UI 배경
        this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 30, 50, 0x000022, 0.5)
            .setDepth(20).setStrokeStyle(1, 0x4466aa, 0.3);

        // SCORE
        this.add.text(30, 12, 'SCORE:', {
            fontFamily: 'Orbitron, monospace', fontSize: '16px', color: '#8899bb',
        }).setDepth(21);
        this.scoreText = this.add.text(110, 8, '0', {
            fontFamily: 'Orbitron, monospace', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
        }).setDepth(21);

        // LIVES
        this.add.text(GAME_WIDTH - 130, 12, 'LIVES:', {
            fontFamily: 'Orbitron, monospace', fontSize: '16px', color: '#8899bb',
        }).setDepth(21);
        this.livesText = this.add.text(GAME_WIDTH - 55, 8, this.lives.toString(), {
            fontFamily: 'Orbitron, monospace', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
        }).setDepth(21);

        // STAGE 표시 (중앙)
        this.stageText = this.add.text(GAME_WIDTH / 2, 18, STAGE_CONFIG[0].label, {
            fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#6688aa',
        }).setOrigin(0.5, 0.5).setDepth(21);

        // 킬 진행 바
        const barW = 200;
        this.killBarBg = this.add.rectangle(GAME_WIDTH / 2, 38, barW, 6, 0x222244, 0.8)
            .setDepth(21).setStrokeStyle(1, 0x334466, 0.3);
        this.killBarFill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2 + 1, 38, 1, 4, 0x00ccff, 1)
            .setDepth(22).setOrigin(0, 0.5);

        // AMMO 표시
        this.add.text(GAME_WIDTH / 2 + barW / 2 + 15, 30, 'AMMO:', {
            fontFamily: 'Orbitron, monospace', fontSize: '11px', color: '#8899bb',
        }).setDepth(21).setOrigin(0, 0.5);
        this.ammoText = this.add.text(GAME_WIDTH / 2 + barW / 2 + 65, 30, `${this.ammo}/${this.maxAmmo}`, {
            fontFamily: 'Orbitron, monospace', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
        }).setDepth(21).setOrigin(0, 0.5);
    }

    spawnInitialClouds() {
        const types = ['cloud_big', 'cloud_med', 'cloud_small'];
        for (let i = 0; i < 6; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const cloud = this.add.image(
                Math.random() * (GAME_WIDTH + 100) - 50,
                Math.random() * GAME_HEIGHT,
                type
            ).setDepth(1).setAlpha(0.4 + Math.random() * 0.3);
            this.clouds.push({ sprite: cloud, speed: Phaser.Math.Between(15, 40) });
        }
    }

    spawnInitialIslands() {
        for (let i = 0; i < 2; i++) {
            const x = Math.random() < 0.5 ? Phaser.Math.Between(-20, 80) : Phaser.Math.Between(GAME_WIDTH - 120, GAME_WIDTH + 20);
            const island = this.add.image(x, Phaser.Math.Between(100, GAME_HEIGHT - 200), 'island')
                .setDepth(1).setAlpha(0.5);
            this.islands.push({ sprite: island, speed: Phaser.Math.Between(20, 35) });
        }
    }

    update(time) {
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

        // 플레이어 이동 (상하좌우)
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
        this.enemies.getChildren().forEach((e) => { if (e.y > GAME_HEIGHT + 50) e.destroy(); });
        this.enemyMissiles.getChildren().forEach((m) => { if (m.y > GAME_HEIGHT + 20) m.destroy(); });
        this.bullets.getChildren().forEach((b) => {
            if (b.active && b.y < -20) { b.setActive(false).setVisible(false); b.body.stop(); }
        });
    }

    fireBullet() {
        let shotsUsed = 0;
        if (this.bulletCount === 1) {
            const b = this.bullets.get(this.player.x, this.player.y - 30);
            if (b) { b.setActive(true).setVisible(true); b.body.enable = true; b.setVelocityY(this.bulletSpeed); b.setDepth(5); shotsUsed = 1; }
        } else if (this.bulletCount === 2) {
            [-8, 8].forEach((ox) => {
                const b = this.bullets.get(this.player.x + ox, this.player.y - 30);
                if (b) { b.setActive(true).setVisible(true); b.body.enable = true; b.setVelocityY(this.bulletSpeed); b.setDepth(5); shotsUsed++; }
            });
        } else if (this.bulletCount === 3) {
            const offsets = [
                { x: 0, vx: 0, vy: this.bulletSpeed },
                { x: -10, vx: -60, vy: this.bulletSpeed },
                { x: 10, vx: 60, vy: this.bulletSpeed },
            ];
            offsets.forEach(({ x, vx, vy }) => {
                const b = this.bullets.get(this.player.x + x, this.player.y - 30);
                if (b) { b.setActive(true).setVisible(true); b.body.enable = true; b.setVelocity(vx, vy); b.setDepth(5); shotsUsed++; }
            });
        }
        this.ammo = Math.max(0, this.ammo - shotsUsed);
        if (this.ammoText) this.ammoText.setText(`${this.ammo}/${this.maxAmmo}`);
        // 탄약 색상 업데이트
        if (this.ammoText) {
            if (this.ammo <= 50) this.ammoText.setColor('#ff4444');
            else if (this.ammo <= 100) this.ammoText.setColor('#ffaa00');
            else this.ammoText.setColor('#ffffff');
        }
    }

    spawnEnemy() {
        if (this.isTransitioning) return;
        const cfg = STAGE_CONFIG[this.currentStage];
        const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
        const enemy = this.enemies.create(x, -40, 'enemy');
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

    enemyFire() {
        if (this.isTransitioning) return;
        const cfg = STAGE_CONFIG[this.currentStage];
        const activeEnemies = this.enemies.getChildren().filter(e => e.active && e.y > 0 && e.y < GAME_HEIGHT - 100);
        activeEnemies.forEach((enemy) => {
            if (Math.random() < cfg.missileChance) {
                this.fireEnemyMissile(enemy.x, enemy.y + 24, cfg);
            }
        });
        // 보스 사격
        if (this.bossActive && this.boss && this.boss.active) {
            this.fireBossMissiles(cfg);
        }
    }

    fireEnemyMissile(x, y, cfg) {
        const missile = this.enemyMissiles.get(x, y);
        if (!missile) return;
        missile.setActive(true).setVisible(true);
        missile.body.enable = true;
        missile.setDepth(5);
        const speed = Phaser.Math.Between(cfg.missileSpeed[0], cfg.missileSpeed[1]);
        const roll = Math.random();
        if (roll < cfg.aimedChance && this.player.active) {
            // 조준 미사일: 플레이어를 향해 발사
            const angle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
            missile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        } else if (roll < cfg.aimedChance + cfg.diagonalChance) {
            // 대각선 미사일
            const vx = Phaser.Math.Between(-180, 180);
            missile.setVelocity(vx, speed);
        } else {
            // 직선 미사일
            missile.setVelocityY(speed);
        }
    }

    fireBossMissiles(cfg) {
        const boss = this.boss;
        const speed = Phaser.Math.Between(cfg.missileSpeed[0], cfg.missileSpeed[1]) * 1.1;
        // 5~7발 부채꼴 발사
        const bulletCount = 5 + Math.floor(this.currentStage / 2);
        const spread = 60 + this.currentStage * 10;
        const startAngle = 90 - spread / 2;
        for (let i = 0; i < bulletCount; i++) {
            const angleDeg = startAngle + (spread / (bulletCount - 1)) * i;
            const angleRad = Phaser.Math.DegToRad(angleDeg);
            const missile = this.enemyMissiles.get(boss.x, boss.y + 50);
            if (missile) {
                missile.setActive(true).setVisible(true);
                missile.body.enable = true;
                missile.setDepth(5);
                missile.setVelocity(Math.cos(angleRad) * speed, Math.sin(angleRad) * speed);
            }
        }
        // 추가: 가끔 조준탄
        if (Math.random() < 0.4 && this.player.active) {
            const aimed = this.enemyMissiles.get(boss.x, boss.y + 50);
            if (aimed) {
                aimed.setActive(true).setVisible(true);
                aimed.body.enable = true;
                aimed.setDepth(5);
                const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
                aimed.setVelocity(Math.cos(angle) * speed * 1.2, Math.sin(angle) * speed * 1.2);
            }
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false).setVisible(false);
        bullet.body.stop(); bullet.body.enable = false;
        enemy.hp--;

        // 보스 피격 처리
        if (enemy.isBoss) {
            this.updateBossHPBar();
            // 피격 플래시
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

            // 스테이지 킬 카운트
            if (!this.bossActive) {
                this.stageKills++;
                const cfg = STAGE_CONFIG[this.currentStage];
                const ratio = Math.min(1, this.stageKills / cfg.killsToAdvance);
                this.killBarFill.setSize(Math.max(1, ratio * 198), 4);

                // 킬 목표 달성 → 보스 소환
                if (this.stageKills >= cfg.killsToAdvance && this.currentStage < STAGE_CONFIG.length - 1) {
                    this.spawnBoss();
                }
            }
        } else {
            this.tweens.add({ targets: enemy, alpha: 0.3, duration: 60, yoyo: true, repeat: 1 });
        }
    }

    spawnBoss() {
        this.bossActive = true;
        const cfg = STAGE_CONFIG[this.currentStage];

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

        // 보스 생성 (위에서 등장)
        this.time.delayedCall(1500, () => {
            this.boss = this.enemies.create(GAME_WIDTH / 2, -80, 'boss');
            this.boss.hp = cfg.bossHP;
            this.boss.maxHP = cfg.bossHP;
            this.boss.isBoss = true;
            this.boss.setDepth(8);
            this.boss.setScale(1.3);

            // 등장 애니메이션
            this.tweens.add({
                targets: this.boss, y: 120, duration: 2000, ease: 'Power2',
                onComplete: () => {
                    // 좌우 이동
                    this.tweens.add({
                        targets: this.boss,
                        x: { from: GAME_WIDTH * 0.25, to: GAME_WIDTH * 0.75 },
                        duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                    });
                },
            });

            // 보스 HP 바 (화면 상단)
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

    updateBossHPBar() {
        if (!this.boss || !this.bossHPBar) return;
        const ratio = Math.max(0, this.boss.hp / this.boss.maxHP);
        this.bossHPBar.setSize(Math.max(1, ratio * 298), 8);
        // 체력에 따라 색 변경
        if (ratio < 0.3) this.bossHPBar.setFillStyle(0xff0000, 1);
        else if (ratio < 0.6) this.bossHPBar.setFillStyle(0xff6600, 1);
    }

    bossDefeated() {
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
                // 추가 대형 폭발
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
            this.bossActive = false;
            this.score += 2000;
            this.scoreText.setText(this.score.toString());
            this.showStageClear();
        });
    }

    playerHit(player, missile) {
        if (this.isInvincible || this.isTransitioning) return;
        missile.setActive(false).setVisible(false);
        missile.body.stop(); missile.body.enable = false;
        this.takeDamage();
    }

    playerHitByEnemy(player, enemy) {
        if (this.isInvincible || this.isTransitioning) return;
        this.createExplosion(enemy.x, enemy.y);
        enemy.destroy();
        this.takeDamage();
    }

    takeDamage() {
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
            // 탄약 리셋
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

    createExplosion(x, y) {
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

// ============================================================
// GameOverScene
// ============================================================
class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalStage = data.stage || 1;
    }

    create() {
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0520, 0.92);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 170, 300, 2, 0x4466aa, 0.4);

        const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, 'GAME OVER', {
            fontFamily: 'Orbitron, monospace', fontSize: '44px', fontStyle: 'bold',
            color: '#ff4444', stroke: '#330000', strokeThickness: 3,
        }).setOrigin(0.5);
        this.tweens.add({ targets: gameOverText, alpha: 0.5, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, 300, 2, 0x4466aa, 0.4);

        // 도달 스테이지
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, `도달 스테이지: ${this.finalStage}`, {
            fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#00ccff',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'FINAL SCORE', {
            fontFamily: 'Orbitron, monospace', fontSize: '16px', color: '#6688aa',
        }).setOrigin(0.5);

        const scoreDisplay = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, '0', {
            fontFamily: 'Orbitron, monospace', fontSize: '60px', fontStyle: 'bold',
            color: '#ffffff', stroke: '#223355', strokeThickness: 3,
        }).setOrigin(0.5);

        this.tweens.addCounter({
            from: 0, to: this.finalScore, duration: 1500, ease: 'Power2',
            onUpdate: (tween) => { scoreDisplay.setText(Math.round(tween.getValue()).toString()); },
        });

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 300, 2, 0x4466aa, 0.4);

        // 재시작 버튼
        const btnBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 200, 50, 0x223366, 0.8)
            .setStrokeStyle(2, 0x4488cc, 0.8).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 'RESTART', {
            fontFamily: 'Orbitron, monospace', fontSize: '22px', fontStyle: 'bold', color: '#00ccff',
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => { btnBg.setFillStyle(0x334488, 1); btnText.setColor('#66eeff'); btnBg.setScale(1.05); btnText.setScale(1.05); });
        btnBg.on('pointerout', () => { btnBg.setFillStyle(0x223366, 0.8); btnText.setColor('#00ccff'); btnBg.setScale(1); btnText.setScale(1); });
        btnBg.on('pointerdown', () => this.scene.start('SelectScene'));

        // 비행기 선택으로 버튼
        const selectBtnBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 175, 200, 40, 0x112233, 0.6)
            .setStrokeStyle(1, 0x3366aa, 0.5).setInteractive({ useHandCursor: true });
        const selectBtnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 175, '비행기 선택', {
            fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#6699cc',
        }).setOrigin(0.5);

        selectBtnBg.on('pointerover', () => { selectBtnBg.setFillStyle(0x223344, 0.8); selectBtnText.setColor('#88bbdd'); });
        selectBtnBg.on('pointerout', () => { selectBtnBg.setFillStyle(0x112233, 0.6); selectBtnText.setColor('#6699cc'); });
        selectBtnBg.on('pointerdown', () => this.scene.start('SelectScene'));

        this.input.keyboard.once('keydown-SPACE', () => this.scene.start('SelectScene'));

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 220, 'Press SPACE to continue', {
            fontFamily: 'Orbitron, monospace', fontSize: '11px', color: '#445566',
        }).setOrigin(0.5);
    }
}

// ============================================================
// Phaser 설정
// ============================================================
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a0a3e',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [BootScene, SelectScene, GameScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
    },
};

const game = new Phaser.Game(config);
