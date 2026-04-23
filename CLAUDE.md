# Claude 글로벌 작업 원칙

모든 작업 전, 실제 문서 및 업계표준을 **실제 표준 자료 및 공식 자료를 검색/확인**한 뒤 진행해라.

> 아래 작업 원칙을 철저히 숙지하고, 이는 모든 대화에서 기본 전제로 반영해라.
> 모든 문제의 원인을 근본적으로 파악하여, 표준적이며 근본적인 해결을 해라(견고성)

## 현재 날짜
- 04.2026

## 작업 위치
- 모든 작업은 **로컬** 에서 작업한다.
- 다른 위치에서 문제가 발생하여 코드를 수정, 개선하는 등의 작업을 할 때에는 로컬에서 작업하고 동기화 시키는 것을 원칙으로 한다.

## 승인 정책
- **삭제 작업**: 반드시 사용자 확인 후 진행
- **중요한 변경/개선**: 옵션을 제시하고 사용자와 함께 결정한다
- **그 외 모든 작업**: 질문 없이 즉시 진행

## 설계 원칙
- **표준화**: 업계 표준과 공식 문서를 따른다
- **모듈화**: 기능별로 독립적인 모듈로 분리한다
- **정규화**: 데이터 중복을 최소화하고 일관성을 유지한다

## 개발 및 수정 원칙
0. **표준 문서 기반**: docs/standard 에 위치한 표준 문서를 엄격히 지키되, 수정이 불가피할 경우에는 물어보고 진행하며 표준 문서도 이에 맞게 수정해야한다.
1. **공식 문서 기반**: 설계 전 공식 문서를 확인해라.
2. **근본적 해결**: 임시 조치가 아닌 원인을 해결한다
3. **변수 최소화**: 불확실성과 외부 의존성을 줄여 재현 가능한 설계를 한다
4. **설계 선행**: 개발 전 상세한 설계도를 작성한다
5. **결과 보고**: 개발 완료 후 구현 방식과 변경 사항을 명확히 나열한다
6. **재현률 확보**: 재구현 및 배포시 재현률을 확보해라. (의존성 버전 고정 등)
7. **최소 복잡성**: 스파게티 코드를 지양해야한다. 설계원칙을 따르되, 최대한 단순한 설계를 유지해라.
8. **동적 코딩**: 동적 변수에 대응할 수 있도록 하드 코딩은 엄격히 지양한다.
9. **배포 고려**: 추후 배포시에도 올바르게 동작할 수 있도록 iso builder 를 올바르게 업데이트 해라.
10. **필수 고려 사항**: 최대한 다양한 변수 및 예외 시나리오를 상정하여 다양한 환경에서도 올바르게 동작할 수 있도록 해라 
11. **장애 대응**: 다양한 변수에서 비롯한 장애 대응이 올바르게 동작해야만 한다.
12. **업계 표준 지향**: 로직 및 아키텍쳐 모두 최신 업계 표준을 지향한다.

## 품질 고려사항
- **라이센스**: 상업적 용도를 고려하여 라이센스 문제를 인지한다
- **UX 우선**: 초보 사용자 기준으로 설계하되, 고급 옵션도 제공한다
- **UI 통일성**: 일관된 사용자 경험을 유지한다

## Regression test 원칙
- 프로덕션을 고려한, 심층 test를 수행해라.
- host-central 간 정보 교환은 예외없이 외부망(gleezor.com) 을 통할 것
- 최대한 다양한 변수 및 예외, 시나리오를 상정하여 테스트 목록 구성
- 장애 대응이 올바르게 동작해야만 한다
- 발견한 모든 이슈는, 위 원칙에 따라 는 모두 올바르게 수정. (추후 배포를 위해 iso builder 및 standard 문서도 올바르게 업데이트)
- 전체 시스템 연동이 올바르게 동작하는지 확인한다
- **독립적 검증**: 이전 결과를 신뢰하지 않고 매번 새로 검증한다
- **엣지 케이스 검토**: 다양한 시나리오와 예외 상황을 테스트한다
- **장애 대응 테스트**: 다양한 케이스에서 발생 가능한 또는 예상하지 못한 장애에 올바르게 대응하는지 검증해라.


## Git 배포
- SemVer 표준 엄격 준수 (MAJOR.MINOR.PATCH)
- **매 커밋마다 VERSION 파일의 PATCH 버전을 반드시 올릴 것** (변경사항이 하나라도 있으면 버전 증가)
- 커밋 메시지에 상세 수정 내용 명시 (이전 커밋 메시지 참고)



# 서버 아키텍처

## 배포 파이프라인 (Progressive Delivery)

```
git push → CI Server (193) → Build → Staging (194, 자동) → Production (88, 수동승인)
```

- **Artifact Promotion**: 동일 이미지가 Staging → Production 승격 (재빌드 없음)
- **GitHub Environment Protection**: `production` 환경에 수동 승인 필수
- Ref: `docs/design/central-and-external-access/08-cicd-pipeline-v2.md`




# SSH 접근

> **접근 방식** (Phase 1 이후): ed25519-sk SSH key 전용 — password 인증 비활성.
> **자격증명 위치**: password manager (Bitwarden vault: `Gleezor Servers`) 의
>                    각 server entry. ssh key + recovery passphrase 포함.
> **표준**: [docs/standard/SSH_STANDARD.md](docs/standard/SSH_STANDARD.md)
> **Phase 1 재적용 스크립트**: `bash tools/infra/apply-tier2-phase1.sh`

## Host server (gleezor agent)
- ip: 192.168.30.230
- id: root
- credentials: Bitwarden `Gleezor Servers / Host test (.230)`

## Client (user)
- ip: 192.168.30.240
- id: root
- credentials: Bitwarden `Gleezor Servers / Client test (.240)`

## Live Central (Production)
- ip: 192.168.30.88
- id: root
- credentials: Bitwarden `Gleezor Servers / Live Central (.88)`
- 역할: 프로덕션 Central Server
- Cloudflare Tunnel: api.gleezor.com

## Staging Server
- ip: 192.168.30.194
- id: root
- credentials: Bitwarden `Gleezor Servers / Staging (.194)`
- 역할: Staging 환경 (CI/CD 자동 배포 대상, 검증 후 Production 승격)

## CI Server
- ip: 192.168.30.193
- id: root
- credentials: Bitwarden `Gleezor Servers / CI (.193)`
- 역할: 빌드 전용 (Docker Registry, ISO 빌드, 패키지 빌드)

## AI Server
- ip: 192.168.30.37
- id: root
- credentials: Bitwarden `Gleezor Servers / AI Server (.37)`