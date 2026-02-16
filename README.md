# Sky Fighter ✈️

Phaser.js로 만든 1인용 비행기 슈팅 아케이드 게임

## 🎮 게임 소개

하늘을 배경으로 적 전투기와 보스를 물리치며 5개의 스테이지를 클리어하는 슈팅 게임입니다.

### 특징
- **5종의 전투기** 선택 가능 (FALCON, THUNDER, PHANTOM, VIPER, RAPTOR)
- **5단계 스테이지** 시스템 (각 스테이지 보스전 포함)
- **탄약 관리** 시스템 (스테이지당 300발 제한)
- 풀스크린 지원
- 다양한 적 미사일 패턴 (직선, 대각선, 조준)

## 🕹️ 조작법

| 키 | 동작 |
|---|---|
| `↑` `↓` `←` `→` | 비행기 이동 |
| `SPACE` | 총알 발사 |

## 🚀 실행 방법

### 로컬 서버로 실행

```bash
# Python 사용
python3 -m http.server 3000

# 또는 Node.js (http-server)
npx http-server -p 3000

# 또는 live-server
npx live-server --port=3000
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
plane-shooting/
├── index.html              # 메인 HTML (스크립트 로딩)
├── style.css               # 게임 스타일
├── config.js               # 게임 설정 (비행기, 스테이지 데이터)
├── main.js                 # Phaser 초기화 및 설정
├── scenes/
│   ├── BootScene.js        # 에셋 생성 (텍스처)
│   ├── SelectScene.js      # 비행기 선택 화면
│   ├── GameScene.js        # 메인 게임 플레이
│   └── GameOverScene.js    # 게임 오버/승리 화면
└── README.md
```

## ✈️ 비행기 정보

| 이름 | 속도 | 화력 | 내구 | 특징 |
|---|---|---|---|---|
| FALCON | ★★★ | ★★ | ★★★ | 균형잡힌 전투기 |
| THUNDER | ★★ | ★★★ | ★★★★★ | 강력한 화력의 폭격기 |
| PHANTOM | ★★★★★ | ★ | ★★ | 빠른 경량 전투기 |
| VIPER | ★★★★ | ★★ | ★★ | 독사처럼 빠른 요격기 |
| RAPTOR | ★★★ | ★★★ | ★★★★ | 최신예 스텔스 전투기 |

## 🛠️ 기술 스택

- **게임 엔진**: [Phaser.js](https://phaser.io/) v3.60.0
- **언어**: JavaScript (ES6+)
- **스타일**: CSS3
- **폰트**: [Orbitron](https://fonts.google.com/specimen/Orbitron) (Google Fonts)

## 📋 게임 시스템

### 스테이지 구성
1. **Stage 1** - 정찰 구역 (입문)
2. **Stage 2** - 적 전초기지
3. **Stage 3** - 치열한 교전
4. **Stage 4** - 적 요새 돌파
5. **Stage 5** - 최종 결전

### 게임 규칙
- 일정 수의 적을 처치하면 **보스**가 등장합니다
- 보스를 물리치면 다음 스테이지로 진행됩니다
- 피격 시 남은 **라이프**가 감소하며, 0이 되면 게임 오버
- 피격 후 탄약이 리셋되고 짧은 무적 시간이 주어집니다
- 각 스테이지 시작 시 탄약이 300발로 리셋됩니다
