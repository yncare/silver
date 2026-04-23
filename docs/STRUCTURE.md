# Directory Structure Review

## Current Intent

이 프로젝트는 빌드 단계가 없는 정적 웹앱입니다. 따라서 배포 가능한 파일과 로컬 작업 산출물을 분리하는 것이 가장 중요합니다.

## Production Boundary

`public/`만 배포 대상입니다.

```text
public/
├── index.html
├── assets/
├── scripts/
└── styles/
```

`_local/`, `temp/`, `docs/`, `.github/`는 서비스 런타임에 필요하지 않으므로 GitHub Pages 산출물에 포함하지 않습니다.

## Internal Folder Assessment

- `scripts/core/`: 공통 기능이 모여 있어 방향은 좋습니다. 다만 `app.js`, `profile.js`, `graphs.js`가 커지고 있어 다음 리팩터링 때 상태 관리, 화면 전환, 추천 훈련, 리포트 렌더링을 더 잘게 분리하는 것이 좋습니다.
- `scripts/games/`: 게임 로직이 별도 폴더에 있어 유지보수에 유리합니다. 현재는 `basic`, `extended`, `advanced` 그룹 파일이 커서, 장기적으로는 `games/match.js`, `games/sequence.js`처럼 게임 단위 분리를 권장합니다.
- `styles/`: 단일 CSS 파일로 운영되고 있습니다. 규모가 커졌으므로 `base.css`, `layout.css`, `components.css`, `games.css`, `print.css`, `accessibility.css` 같은 책임 기반 분리가 다음 개선 후보입니다.
- `assets/`: 런타임 이미지가 잘 모여 있습니다. 대용량 PNG는 WebP/AVIF 변환과 사이즈 최적화를 검토해야 합니다.

## Follow-up Recommendations

- 인라인 `onclick` 기반 전역 함수 호출을 점진적으로 `addEventListener` 기반 초기화 코드로 옮깁니다.
- `innerHTML` 사용 구간은 외부 입력이 섞이지 않도록 `textContent` 또는 DOM 생성 방식으로 줄입니다.
- `CLAUDE.md`와 기존 문서의 문자 인코딩을 UTF-8로 복구합니다.
