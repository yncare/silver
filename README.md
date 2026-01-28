## 프로젝트 검증/정리 결과

### 실행(권장)
- **첫 렌딩 페이지**: `index.html`
  - 메인 앱이 바로 실행됩니다.

### 구조 요약
- **메인 앱**: `brain-training.html`
- **모듈**
  - 스타일: `styles/app.css`
  - 스크립트: `scripts/core/*`, `scripts/games/*`
- **이미지**
  - 메뉴 이미지: `assets/` (예: `assets/card_match.png`, `assets/sequence.png`)
  - 로고 이미지: `assets/logo.png`
- **임시/백업**
  - 이전 파일/백업: `temp/legacy/*`, `temp/backups/brain-training/*`
  - 미사용 리소스: `temp/unused/*`
  - 배포 워크플로우 백업: `temp/legacy-github/workflows/*`

### 적용한 수정(표준화/정규화/모듈화)
- **모듈화**: HTML 내부 CSS/JS를 파일로 분리(`styles/`, `scripts/`)
- **표준화**: 리소스 경로를 `assets/`로 통일
- **정리**: 불필요/백업 파일을 `temp/`로 이동

### 추가로 권장(선택)
- GitHub Pages 배포를 유지하려면 `temp/legacy-github/workflows`를 `.github/workflows`로 되돌리세요.

---

## GitHub에 올리기(커밋/푸시)

원격 저장소: `https://github.com/yncare/silver.git`

아래 명령은 **프로젝트 폴더(이 README가 있는 폴더)** 에서 실행하세요.

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit: static site + GitHub Pages workflow"
git remote add origin https://github.com/yncare/silver.git
git push -u origin main
```

> 참고: 만약 `git` 명령이 인식되지 않으면, 새 터미널을 다시 열거나 **Git Bash**에서 동일 명령을 실행하세요.

## GitHub Pages로 배포

이 프로젝트는 정적 사이트라서 빌드 없이 바로 배포합니다.
이미 `.github/workflows/pages.yml`이 포함되어 있어, `main` 브랜치에 푸시되면 자동으로 배포됩니다.

1) GitHub 저장소에서 **Settings → Pages**로 이동  
2) **Build and deployment → Source**를 **GitHub Actions**로 선택  
3) `main`에 푸시하면 Actions가 실행되고, 배포 URL이 생성됩니다.


