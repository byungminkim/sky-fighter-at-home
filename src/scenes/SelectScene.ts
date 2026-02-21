// ============================================================
// SelectScene - 비행기 선택 화면
// ============================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLANE_DATA, updateGameSize } from '../config';
import type { PlaneKey } from '../types';

interface PlaneCard {
    cardBg: Phaser.GameObjects.Rectangle;
    glow: Phaser.GameObjects.Rectangle;
    plane: Phaser.GameObjects.Image;
}

export class SelectScene extends Phaser.Scene {
    private planeCards: PlaneCard[] = [];

    constructor() {
        super('SelectScene');
    }

    create(): void {
        updateGameSize(this);

        // 배경
        this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg').setOrigin(0, 0);

        const isMobile = GAME_WIDTH < 500;

        // 타이틀
        this.add.text(GAME_WIDTH / 2, isMobile ? 50 : 70, 'SKY FIGHTER', {
            fontFamily: 'Orbitron, monospace',
            fontSize: isMobile ? '28px' : '52px',
            fontStyle: 'bold',
            color: '#00ccff',
            stroke: '#002244',
            strokeThickness: isMobile ? 2 : 4,
        }).setOrigin(0.5);

        // 서브타이틀
        this.add.text(GAME_WIDTH / 2, isMobile ? 85 : 120, '전투기를 선택하세요', {
            fontFamily: 'Orbitron, monospace',
            fontSize: isMobile ? '13px' : '18px',
            color: '#8899bb',
        }).setOrigin(0.5);

        // 구분선
        this.add.rectangle(GAME_WIDTH / 2, isMobile ? 100 : 148, Math.min(500, GAME_WIDTH - 40), 2, 0x4466aa, 0.5);

        const planes = Object.keys(PLANE_DATA) as PlaneKey[];
        const mobileRows = isMobile ? 2 : 1;
        const mobileCols = isMobile ? Math.ceil(planes.length / mobileRows) : planes.length;
        const maxCardW = Math.min(190, (GAME_WIDTH - 32) / mobileCols - 6);
        const cardWidth = Math.max(56, maxCardW);
        const cardSpacing = Math.max(6, Math.min(18, (GAME_WIDTH - mobileCols * cardWidth) / (mobileCols + 1)));
        const totalWidth = mobileCols * cardWidth + (mobileCols - 1) * cardSpacing;
        const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
        const cardH = isMobile ? 190 : 320;
        const rowGap = isMobile ? 12 : 0;
        const topY = isMobile ? 130 : 0;

        this.planeCards = [];

        planes.forEach((key, i) => {
            const data = PLANE_DATA[key];
            const col = isMobile ? i % mobileCols : i;
            const row = isMobile ? Math.floor(i / mobileCols) : 0;
            const cx = startX + col * (cardWidth + cardSpacing);
            const cy = isMobile
                ? topY + cardH / 2 + row * (cardH + rowGap)
                : 350;

            const cardBg = this.add.rectangle(cx, cy, cardWidth, cardH, 0x111133, 0.7)
                .setStrokeStyle(2, 0x3355aa, 0.6)
                .setInteractive({ useHandCursor: true });

            const planeScale = isMobile ? 1.2 : 2;
            const plane = this.add.image(cx, cy - (isMobile ? 60 : 90), `plane_${key}`).setScale(planeScale);

            this.add.text(cx, cy - (isMobile ? 25 : 30), data.name, {
                fontFamily: 'Orbitron, monospace',
                fontSize: isMobile ? '12px' : '22px',
                fontStyle: 'bold',
                color: '#ffffff',
            }).setOrigin(0.5);

            this.add.text(cx, cy - (isMobile ? 10 : 0), data.desc, {
                fontFamily: 'sans-serif',
                fontSize: isMobile ? '8px' : '14px',
                color: '#8899bb',
            }).setOrigin(0.5);

            const statY = cy + (isMobile ? 10 : 35);
            const statGap = isMobile ? 22 : 35;
            this.drawStatBar(cx, statY, '속도', data.speed / 600, cardWidth);
            this.drawStatBar(cx, statY + statGap, '화력', data.bulletCount / 3, cardWidth);
            this.drawStatBar(cx, statY + statGap * 2, '내구', data.lives / 5, cardWidth);

            const glow = this.add.rectangle(cx, cy, cardWidth + 4, cardH + 4, 0x00ccff, 0)
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

        // 조작법 안내 (모바일에서는 숨김)
        if (!isMobile) {
            const helpY = 550;
            this.add.rectangle(GAME_WIDTH / 2, helpY, 500, 2, 0x4466aa, 0.3);

            this.add.text(GAME_WIDTH / 2, helpY + 25, '조작법', {
                fontFamily: 'Orbitron, monospace',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#66aacc',
            }).setOrigin(0.5);

            const controls: [string, string][] = [
                ['↑ ↓ ← →', '비행기 이동'],
                ['SPACE', '총알 발사'],
            ];
            controls.forEach(([keyLabel, desc], i) => {
                const y = helpY + 55 + i * 32;
                this.add.text(GAME_WIDTH / 2 - 60, y, keyLabel, {
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
    }

    private drawStatBar(cx: number, y: number, label: string, ratio: number, cardWidth: number): void {
        const barW = Math.min(140, cardWidth - 10);
        this.add.text(cx - barW / 2, y, label, {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#6688aa',
        }).setOrigin(0, 0.5);
        this.add.rectangle(cx + 25, y, barW - 50, 8, 0x222244, 0.8).setStrokeStyle(1, 0x334466, 0.5);
        const fillW = Math.max(2, (barW - 52) * ratio);
        const color = ratio > 0.7 ? 0x00ff88 : ratio > 0.4 ? 0xffcc00 : 0xff6644;
        this.add.rectangle(cx + 25 - (barW - 52) / 2 + fillW / 2, y, fillW, 6, color, 1);
    }
}
