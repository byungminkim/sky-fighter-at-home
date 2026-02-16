// ============================================================
// Phaser 설정 & 게임 초기화
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
