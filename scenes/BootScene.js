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
