// ============================================================
// Sky Fighter - 타입 정의
// ============================================================

export interface PlaneColor {
    body: number;
    highlight: number;
    cockpit: number;
    wing: number;
    engine: number;
}

export interface PlaneData {
    name: string;
    desc: string;
    speed: number;
    fireRate: number;
    lives: number;
    bulletSpeed: number;
    bulletCount: number;
    color: PlaneColor;
}

export interface StageConfig {
    enemySpawnDelay: number;
    missileDelay: number;
    enemySpeed: [number, number];
    enemyHP: number;
    missileSpeed: [number, number];
    missileChance: number;
    diagonalChance: number;
    aimedChance: number;
    killsToAdvance: number;
    bossHP: number;
    label: string;
    subtitle: string;
}

export type PlaneKey = 'falcon' | 'thunder' | 'phantom' | 'viper' | 'raptor';

export interface GameSceneInitData {
    selectedPlane: PlaneKey;
}

export interface GameOverSceneInitData {
    score: number;
    stage: number;
    cleared?: boolean;
}

/** Physics.Arcade.Sprite에 게임용 커스텀 프로퍼티를 추가한 타입 */
export interface EnemySprite extends Phaser.Physics.Arcade.Sprite {
    hp: number;
    maxHP?: number;
    isBoss?: boolean;
}
