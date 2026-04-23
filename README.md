# Good Silver Brain Training

정적 HTML/CSS/JavaScript 기반의 시니어 두뇌 훈련 웹앱입니다.

## Project Structure

```text
.
├── public/                 # GitHub Pages에 배포되는 정적 사이트 루트
│   ├── index.html
│   ├── assets/
│   ├── scripts/
│   │   ├── core/           # 프로필, 접근성, TTS, 레벨, 리포트 등 공통 로직
│   │   └── games/          # 게임별 실행 로직
│   └── styles/
├── docs/                   # 프로젝트 문서
├── .github/workflows/      # CI/CD 워크플로
├── temp/                   # 임시/백업 파일, Git 추적 제외
├── _local/                 # 로컬 원본/압축 산출물, Git 추적 제외
├── CLAUDE.md
└── README.md
```

## Run Locally

정적 사이트이므로 `public/index.html`을 브라우저에서 열면 실행됩니다.

로컬 서버로 확인하려면:

```bash
cd public
python -m http.server 8000
```

그 다음 브라우저에서 `http://localhost:8000`으로 접속합니다.

## Deployment

GitHub Pages 배포 워크플로는 `.github/workflows/deploy.yml`에 있으며, `public/` 디렉토리만 배포 산출물로 업로드합니다.

## Production Notes

- `public/` 아래에는 실제 서비스에 필요한 파일만 둡니다.
- 대용량 압축 파일, 원본 이미지, 실험 파일은 `_local/` 또는 외부 스토리지에 보관합니다.
- 새 게임을 추가할 때는 HTML 마크업, `scripts/games/`, 공통 등록 로직의 책임을 분리해 유지합니다.
- 배포 전에는 JS 구문 검증, 주요 이미지/스크립트 경로 검증, 모바일 화면 확인을 수행합니다.
