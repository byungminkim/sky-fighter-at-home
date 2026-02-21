// ============================================================
// Phaser 설정 & 게임 초기화
// ============================================================
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { SelectScene } from './scenes/SelectScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
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
    input: {
        activePointers: 3, // 멀티터치 지원
    },
};

new Phaser.Game(config);
