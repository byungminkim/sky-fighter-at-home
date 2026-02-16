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
