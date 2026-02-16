// ============================================================
// GameOverScene - 게임 오버 / 게임 클리어 화면
// ============================================================
class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalStage = data.stage || 1;
        this.cleared = data.cleared || false;
    }

    create() {
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0520, 0.92);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 170, 300, 2, 0x4466aa, 0.4);

        const titleText = this.cleared ? 'VICTORY!' : 'GAME OVER';
        const titleColor = this.cleared ? '#00ff88' : '#ff4444';
        const titleStroke = this.cleared ? '#003322' : '#330000';

        const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, titleText, {
            fontFamily: 'Orbitron, monospace', fontSize: '44px', fontStyle: 'bold',
            color: titleColor, stroke: titleStroke, strokeThickness: 3,
        }).setOrigin(0.5);
        this.tweens.add({ targets: gameOverText, alpha: 0.5, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, 300, 2, 0x4466aa, 0.4);

        // 도달 스테이지
        const stageMessage = this.cleared
            ? '모든 스테이지를 클리어했습니다!'
            : `도달 스테이지: ${this.finalStage}`;
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, stageMessage, {
            fontFamily: 'Orbitron, monospace', fontSize: '14px',
            color: this.cleared ? '#00ff88' : '#00ccff',
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
