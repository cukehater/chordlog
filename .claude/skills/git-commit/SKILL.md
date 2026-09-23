---
name: git-commit
description: Stage all changes and write a commit message in this repo's actual convention (type(scope): 한국어 설명, single line, no body). Use whenever the user asks to commit, "커밋해줘", "커밋 메시지 작성해줘", "변경사항 커밋", or wants staged/unstaged changes turned into a commit — don't invent a generic Conventional Commits message, follow the rules below derived from this repo's history.
---

# git-commit

## 커밋 전 확인

1. `git status`로 스테이징 안 된 파일, untracked 파일 확인.
2. `git diff` / `git diff --staged`로 실제 변경 내용 파악 (타입·스코프 판단 근거).
3. 의심스러운 파일(.env, credentials, key 등) 있으면 스테이징 전에 내용 확인하고 사용자에게 경고.
4. 전부 의도된 변경이면 `git add -A` (아니면 관련 파일만 개별 add).

## 메시지 규칙 (최근 20개 커밋 실측)

포맷: `type(scope): 설명` 또는 스코프 없으면 `type: 설명`

- **type**: `feat` `fix` `chore` `refactor` 중 하나. 새 기능=feat, 버그 수정=fix, 포맷팅/설정/제거 등 코드 동작과 무관=chore, 동작 유지한 채 구조 변경=refactor.
- **scope**: 변경이 `apps/{앱}/` 한 곳에 국한되면 그 앱 이름(roz, www, member, login, getporing). 여러 앱에 걸치거나 레포 전역 변경(gitignore, prettier 설정 등)이면 스코프 생략.
- **설명**: 한국어, 명사형 종결("~추가", "~처리", "~수정"), 마침표 없음, 한 줄로 끝. 이 레포 커밋엔 본문(body)이나 footer가 없음 — 추가하지 마라.

실제 예시:
```
chore(roz): ALLOWED_PATHS에 아기상어 이벤트 경로 추가
fix(roz): 아기상어 게임 클라이언트 다운로드 로직 추가 및 코드 포매팅
feat(roz): 아기상어 이벤트 페이지 작업
feat: 충전 페이지 상단 아기상어 배너 교체
chore(www): 오픈 전 잔재 /preview 라우트 및 고아 코드 제거
refactor: Prettier 설정 업데이트, Tailwind CSS 플러그인 추가, 전체 코드 포매팅
```

## 실행

1. 위 규칙으로 메시지 작성.
2. `git commit -m "type(scope): 설명"` — heredoc이나 footer 없이 한 줄 메시지 그대로.
3. `git status`로 커밋 성공 확인.
4. hook 실패 시 원인 고치고 새로 커밋 (amend 금지, 이 레포 정책과 무관하게 항상 지킬 것).

여러 논리적 변경이 섞여 있으면(예: 기능 추가 + 무관한 설정 변경) 사용자에게 분리 커밋할지 먼저 확인 — 위 20개 커밋도 대부분 커밋 하나 = 변경 하나 원칙을 지킴.
