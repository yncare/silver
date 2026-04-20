// ==================== 초기화 ====================
        function selectGender(gender, btn) {
            userProfile.gender = gender;
            document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            checkFormComplete();
        }
        
        // 등록 시 난이도 선택
        let regDifficultyChoice = 'normal';
        
        function selectRegDifficulty(value) {
            regDifficultyChoice = value;
        }
        
        function getDifficultyByAge(age) {
            if (!Number.isInteger(age)) return 'normal';
            if (age >= 80) return 'very_easy';
            if (age >= 70) return 'easy';
            if (age >= 60) return 'normal';
            if (age >= 50) return 'hard';
            return 'very_hard';
        }
        
        function applyDifficultyFromAge(age) {
            const select = document.getElementById('difficultySelect');
            const hint = document.getElementById('difficultyAutoHint');
            const ageNumber = Number.isInteger(age) ? age : null;
            const diff = ageNumber ? getDifficultyByAge(ageNumber) : 'normal';
            
            regDifficultyChoice = diff;
            if (select) select.value = diff;
            if (hint) {
                if (ageNumber) {
                    const diffName = typeof getDifficultyName === 'function' ? getDifficultyName(diff) : diff;
                    hint.textContent = `나이에 따라 난이도가 "${diffName}"로 자동 설정되었습니다.`;
                } else {
                    hint.textContent = '나이를 입력하면 난이도가 자동으로 적용됩니다.';
                }
            }
        }
        
        function checkFormComplete() {
            const nameEl = document.getElementById('userName');
    const ageEl = document.getElementById('userAge');
            const registerBtn = document.getElementById('registerBtn');
            if (!nameEl || !registerBtn) return;
            
            const name = nameEl.value.trim();
    const age = ageEl ? parseInt(ageEl.value, 10) : null;
    const ageValid = Number.isInteger(age) && age >= 1 && age <= 120;
    registerBtn.disabled = !(name && userProfile.gender && ageValid);
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const nameEl = document.getElementById('userName');
    const ageEl = document.getElementById('userAge');
            if (nameEl) nameEl.addEventListener('input', checkFormComplete);
    if (ageEl) {
        ageEl.addEventListener('input', () => {
            const age = parseInt(ageEl.value, 10);
            if (Number.isNaN(age)) {
                applyDifficultyFromAge(null);
            } else {
                applyDifficultyFromAge(age);
            }
            checkFormComplete();
        });
    }
        });
        
        function showMainContent() {
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            document.getElementById('userNameDisplay').textContent = userProfile.name;
            document.getElementById('userGenderIcon').textContent = userProfile.gender === 'male' ? '👨' : '👩';
            
            const settings = difficultySettings[userProfile.difficulty];
            const badge = document.getElementById('difficultyBadge');
            badge.textContent = settings.name + ' ▼';
            badge.className = 'difficulty-badge clickable ' + settings.badgeClass;
            
            // 헤더 배지는 메인에서도 원래처럼 표시하되,
            // 배지 "획득 팝업(오버레이)"은 게임 플레이 중에만 뜨도록 차단 플래그를 둔다.
            document.getElementById('headerUserBadge').style.display = 'flex';
            window.__allowBadgeUnlockPopup = false;

            const headerScore = document.getElementById('headerScore');
            if (headerScore) headerScore.style.display = 'flex';
            
            // 마지막 사용자 ID 저장
            localStorage.setItem('lastUserId', userProfile.id);
            
            // TTS 설정 로드 (메인 화면이 표시된 후)
            loadTTSSettings();
            
            checkDayReset();
            updateUI();

            // 메인 진입 시 기본 "전체보기" 레이아웃(4개 대분류 2x2) 적용
            try {
                const cat = window.selectedMenuCategory || 'all';
                filterMenuCategory(cat, { scroll: false });
            } catch (e) { /* ignore */ }
        }
        
        function changeProfile() {
            // 현재 데이터 저장
            saveUserData();
            
            // 화면 전환
            document.getElementById('mainContent').classList.add('hidden');
            document.getElementById('welcomeScreen').classList.remove('hidden');
            
            // 헤더 사용자 배지 및 점수 숨김
            document.getElementById('headerUserBadge').style.display = 'none';
            const headerScore = document.getElementById('headerScore');
            if (headerScore) headerScore.style.display = 'none';
            
            // 폼 초기화
            document.getElementById('userName').value = '';
    document.getElementById('userAge').value = '';
            document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
            document.getElementById('registerBtn').disabled = true;
    applyDifficultyFromAge(null);
            document.getElementById('newUserForm').classList.remove('active');
            document.getElementById('existingUsersSection').style.display = 'block';
            document.getElementById('enterBtn').style.display = 'none';
            
    userProfile = { id: '', name: '', age: null, gender: null, difficulty: 'normal', userType: 'personal' };
            selectedUserId = null;
            
            // 사용자 목록 갱신
            renderExistingUsers();
        }

        // 홈으로 이동: 팝업 없이 저장 후 로그인(첫 화면)으로 이동
        function goHome() {
            try {
                // 데이터 저장
                if (typeof saveUserData === 'function') saveUserData();

                // 배지 획득 팝업 비활성화
                window.__allowBadgeUnlockPopup = false;

                // 첫 화면에서 사용자 리스트는 다시 숨김
                try { hasOpenedUserList = false; } catch (e) { /* ignore */ }

                // 화면 전환
                const main = document.getElementById('mainContent');
                const welcome = document.getElementById('welcomeScreen');
                if (main) main.classList.add('hidden');
                if (welcome) welcome.classList.remove('hidden');

                // 헤더 숨김
                const headerUserBadge = document.getElementById('headerUserBadge');
                if (headerUserBadge) headerUserBadge.style.display = 'none';
                const headerScore = document.getElementById('headerScore');
                if (headerScore) headerScore.style.display = 'none';

                // 신규 등록 폼 닫고 초기화
                const form = document.getElementById('newUserForm');
                if (form) form.classList.remove('active');
                const section = document.getElementById('existingUsersSection');
                if (section) section.style.display = 'block';

                const enterBtn = document.getElementById('enterBtn');
                if (enterBtn) enterBtn.style.display = 'none';

                const nameEl = document.getElementById('userName');
                if (nameEl) nameEl.value = '';
                const ageEl = document.getElementById('userAge');
                if (ageEl) ageEl.value = '';
                document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));

                const registerBtn = document.getElementById('registerBtn');
                if (registerBtn) registerBtn.disabled = true;
                try { applyDifficultyFromAge(null); } catch (e) { /* ignore */ }

                // 로그인 상태 초기화
                userProfile = { id: '', name: '', age: null, gender: null, difficulty: 'normal', userType: 'personal' };
                selectedUserId = null;

                // 사용자 목록 갱신
                if (typeof renderExistingUsers === 'function') renderExistingUsers();
            } catch (error) {
                console.error('홈 이동 중 오류:', error);
            }
        }

        // 헤더 로고/타이틀 클릭 시 메인 화면(메인 메뉴)으로 이동
        function goMainMenuFromHeader() {
            try {
                const mainContent = document.getElementById('mainContent');
                if (!mainContent || mainContent.classList.contains('hidden')) {
                    // 로그인 상태가 아니면(첫 화면) 아무 것도 하지 않음
                    return;
                }

                // 게임 화면이 열려있으면 뒤로가기 로직으로 메인 복귀
                const activeGame = document.querySelector('.game-screen.active');
                if (activeGame && typeof goBack === 'function') {
                    goBack();
                    return;
                }

                // 메인 메뉴가 숨겨져 있으면 다시 표시
                const mainMenu = document.getElementById('mainMenu');
                if (mainMenu) mainMenu.style.display = '';

                // 현재 선택 카테고리로 레이아웃 동기화
                if (typeof filterMenuCategory === 'function') {
                    const cat = window.selectedMenuCategory || 'all';
                    filterMenuCategory(cat, { scroll: false });
                }

                // 화면 상단으로 이동
                try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
            } catch (error) {
                console.error('헤더 메인 이동 중 오류:', error);
            }
        }
        
        // 앱 종료 (데이터 저장 후 종료)
        function exitApp() {
            // 기존 "종료"는 홈 이동으로 대체 (팝업 없음)
            goHome();
        }
        
        // 저장 완료 메시지 표시
        function showSaveCompleteMessage() {
            const overlay = document.getElementById('celebrationOverlay');
            const emoji = overlay.querySelector('.celebration-emoji');
            emoji.textContent = '💾';
            overlay.classList.add('active');
            
            setTimeout(() => {
                overlay.classList.remove('active');
                emoji.textContent = '🎉';
            }, 1500);
        }
        
        function init() {
            // 사용자 목록 표시
            renderExistingUsers();
            
            // TTS 설정 로드
            loadTTSSettings();
            
            // 마지막 로그인 사용자 확인
            const lastUserId = localStorage.getItem('lastUserId');
            if (lastUserId && allUsers[lastUserId]) {
                // 자동 로그인 하지 않고 선택 화면 표시
                // 원하면 아래 주석 해제하여 자동 로그인 가능
                // selectedUserId = lastUserId;
                // enterWithSelectedUser();
            }
        }
        
        function checkDayReset() {
            if (!userProfile.id) return;
            
            const lastDate = localStorage.getItem('lastDate_' + userProfile.id);
            const today = new Date().toDateString();
            if (lastDate !== today) {
                localStorage.setItem('lastDate_' + userProfile.id, today);
                gameState.gamesPlayed = gameState.correctAnswers = gameState.totalAnswers = gameState.trainTime = gameState.todayScore = 0;
            }
        }
        
        function updateUI() {
            const todayScoreEl = document.getElementById('todayScore');
            if (todayScoreEl) todayScoreEl.textContent = gameState.todayScore;

            const highScoreEl = document.getElementById('highScore');
            if (highScoreEl) highScoreEl.textContent = gameState.highScore;

            const gamesPlayedEl = document.getElementById('gamesPlayed');
            if (gamesPlayedEl) gamesPlayedEl.textContent = gameState.gamesPlayed;

            const correctAnswersEl = document.getElementById('correctAnswers');
            if (correctAnswersEl) correctAnswersEl.textContent = gameState.correctAnswers;
            const acc = gameState.totalAnswers > 0 ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100) : 0;
            const accuracyEl = document.getElementById('accuracy');
            if (accuracyEl) accuracyEl.textContent = acc + '%';

            const trainTimeEl = document.getElementById('trainTime');
            if (trainTimeEl) trainTimeEl.textContent = gameState.trainTime + '분';
        }

        // 새 게임 전용 점수 반영 (게임 완료 화면 없이 처리)
        function addScore(score) {
            gameState.gamesPlayed++;
            gameState.todayScore += score;
            if (gameState.todayScore > gameState.highScore) {
                gameState.highScore = gameState.todayScore;
            }
            
            if (typeof saveTrainingRecord === 'function' && gameState.currentGame) {
                saveTrainingRecord(gameState.currentGame, score);
            }
            
            const accuracy = gameState.totalAnswers > 0
                ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100)
                : 0;
            if (typeof updateBadgeStats === 'function' && gameState.currentGame) {
                updateBadgeStats(gameState.currentGame, { score, accuracy });
            }
            
            updateUI();
        }
        
        // 게임 화면 난이도 변경
        function changeGameDifficulty(diff) {
            userProfile.difficulty = diff;
            
            // 저장된 사용자 정보 업데이트
            const savedUsers = JSON.parse(localStorage.getItem('cognitiveUsers') || '[]');
            const userIndex = savedUsers.findIndex(u => u.id === userProfile.id);
            if (userIndex !== -1) {
                savedUsers[userIndex].difficulty = diff;
                localStorage.setItem('cognitiveUsers', JSON.stringify(savedUsers));
            }
            
            // allUsers도 업데이트
            if (allUsers[userProfile.id]) {
                allUsers[userProfile.id].profile.difficulty = diff;
            }
            
            // 메인 화면 배지도 업데이트
            const settings = difficultySettings[diff];
            const badge = document.getElementById('difficultyBadge');
            if (badge) {
                badge.textContent = settings.name + ' ▼';
                badge.className = 'difficulty-badge clickable ' + settings.badgeClass;
            }
            
            // 버튼 상태 업데이트
            updateGameDifficultyButtons(diff);
        }
        
        function updateGameDifficultyButtons(currentDiff) {
            document.querySelectorAll('.game-diff-btn').forEach(btn => {
                btn.classList.remove('active');
                // 긴 토큰(very-*)을 먼저 매칭 — 'hard'가 'very-hard'의 부분문자열로 잡히는 오류 방지
                const btnDiff = btn.className.match(/very-easy|very-hard|easy|normal|hard/)?.[0]?.replace(/-/g, '_');
                if (btnDiff === currentDiff) {
                    btn.classList.add('active');
                }
            });
        }

        // ==================== 게임 전체화면 (활성 .game-screen만 — 헤더/메뉴 제외) ====================
        function removeGameFullscreenExitOverlay() {
            document.querySelectorAll('#gameFullscreenExitBtn').forEach((b) => b.remove());
        }

        function ensureGameFullscreenExitOverlay(screen) {
            removeGameFullscreenExitOverlay();
            const el = document.createElement('button');
            el.id = 'gameFullscreenExitBtn';
            el.type = 'button';
            el.className = 'game-fullscreen-exit';
            el.setAttribute('aria-label', '전체화면 종료');
            el.textContent = '✕';
            el.addEventListener('click', () => exitGameFullscreen());
            screen.appendChild(el);
            return el;
        }

        function syncGameFullscreenExitVisibility() {
            const fs = document.fullscreenElement || document.webkitFullscreenElement
                || document.mozFullScreenElement || document.msFullscreenElement;
            const btn = document.getElementById('gameFullscreenExitBtn');
            if (!fs) {
                removeGameFullscreenExitOverlay();
            } else if (btn) {
                btn.style.display = 'flex';
            }
        }

        if (typeof document !== 'undefined') {
            document.addEventListener('fullscreenchange', syncGameFullscreenExitVisibility);
            document.addEventListener('webkitfullscreenchange', syncGameFullscreenExitVisibility);
        }

        function enterGameFullscreen() {
            const screen = document.querySelector('.game-screen.active');
            if (!screen) return;
            const req = screen.requestFullscreen || screen.webkitRequestFullscreen
                || screen.mozRequestFullScreen || screen.msRequestFullscreen;
            if (!req) {
                alert('이 브라우저에서는 전체화면을 지원하지 않습니다.');
                return;
            }
            ensureGameFullscreenExitOverlay(screen);
            req.call(screen).catch(() => {
                removeGameFullscreenExitOverlay();
            });
        }

        function exitGameFullscreen() {
            const ex = document.exitFullscreen || document.webkitExitFullscreen
                || document.mozCancelFullScreen || document.msExitFullscreen;
            if (!ex) return;
            if (document.fullscreenElement || document.webkitFullscreenElement
                || document.mozFullScreenElement || document.msFullscreenElement) {
                ex.call(document).catch(() => {});
            }
        }

        function exitGameFullscreenIfNeeded() {
            if (document.fullscreenElement || document.webkitFullscreenElement
                || document.mozFullScreenElement || document.msFullscreenElement) {
                exitGameFullscreen();
            }
        }

        function ensureGamePauseOverlay(screen) {
            let el = screen.querySelector('.game-pause-overlay');
            if (el) return el;
            el = document.createElement('div');
            el.className = 'game-pause-overlay';
            el.setAttribute('aria-hidden', 'true');
            el.innerHTML = ''
                + '<div class="game-pause-overlay-inner">'
                + '<p class="game-pause-title">일시정지</p>'
                + '<p class="game-pause-hint">계속하려면 <strong>일시정지</strong>를 다시 누르세요</p>'
                + '</div>';
            screen.appendChild(el);
            return el;
        }

        function setGamePaused(screen, paused) {
            if (!screen) return;
            ensureGamePauseOverlay(screen);
            screen.classList.toggle('game-paused', paused);
            const overlay = screen.querySelector('.game-pause-overlay');
            if (overlay) {
                overlay.setAttribute('aria-hidden', paused ? 'false' : 'true');
            }
            const pauseBtn = screen.querySelector('.btn-game-pause');
            if (pauseBtn) {
                pauseBtn.textContent = paused ? '▶ 계속' : '⏸ 일시정지';
                pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
            }
            if (paused && typeof stopSpeaking === 'function') stopSpeaking();
            window.dispatchEvent(new CustomEvent('appGamePause', { detail: { paused, screen } }));
        }

        function clearGamePauseAll() {
            document.querySelectorAll('.game-screen').forEach((s) => {
                s.classList.remove('game-paused');
                const o = s.querySelector('.game-pause-overlay');
                if (o) o.setAttribute('aria-hidden', 'true');
                const p = s.querySelector('.btn-game-pause');
                if (p) {
                    p.textContent = '⏸ 일시정지';
                    p.setAttribute('aria-pressed', 'false');
                }
            });
        }

        function attachGameFullscreenButton() {
            const screen = document.querySelector('.game-screen.active');
            if (!screen) return;

            const existingRow = screen.querySelector('.match-start-btn-row');
            if (existingRow) {
                const m = existingRow.querySelector('#matchStartBtn');
                if (m && existingRow.parentNode) {
                    existingRow.parentNode.insertBefore(m, existingRow);
                }
                existingRow.remove();
            }
            screen.querySelectorAll('.btn-game-fullscreen, .btn-game-pause, .btn-game-exit').forEach((b) => b.remove());

            const startBtn = screen.querySelector('button.btn-primary[id$="StartBtn"]');
            if (!startBtn) return;

            const fsBtn = document.createElement('button');
            fsBtn.type = 'button';
            fsBtn.className = 'btn btn-secondary btn-game-fullscreen';
            fsBtn.textContent = '⛶ 전체화면';
            fsBtn.title = '전체화면으로 보기 (해제: 화면 위 ✕ 또는 Esc)';
            fsBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                enterGameFullscreen();
            });

            const pauseBtn = document.createElement('button');
            pauseBtn.type = 'button';
            pauseBtn.className = 'btn btn-secondary btn-game-pause';
            pauseBtn.textContent = '⏸ 일시정지';
            pauseBtn.title = '게임을 잠시 멈춥니다';
            pauseBtn.setAttribute('aria-pressed', 'false');
            pauseBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                setGamePaused(screen, !screen.classList.contains('game-paused'));
            });

            const exitBtn = document.createElement('button');
            exitBtn.type = 'button';
            exitBtn.className = 'btn btn-danger btn-game-exit';
            exitBtn.textContent = '✕';
            exitBtn.title = '메인 화면으로 나가기';
            exitBtn.setAttribute('aria-label', '메인 화면으로 나가기');
            exitBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                if (confirm('게임을 종료하고 메인 화면으로 나갈까요?')) {
                    setGamePaused(screen, false);
                    goBack();
                }
            });

            if (startBtn.id === 'matchStartBtn') {
                const row = document.createElement('div');
                row.className = 'match-start-btn-row';
                startBtn.style.marginTop = '';
                row.style.marginTop = '15px';
                const parent = startBtn.parentNode;
                parent.insertBefore(row, startBtn);
                row.appendChild(startBtn);
                row.appendChild(fsBtn);
                row.appendChild(pauseBtn);
                row.appendChild(exitBtn);
            } else {
                startBtn.insertAdjacentElement('afterend', fsBtn);
                fsBtn.insertAdjacentElement('afterend', pauseBtn);
                pauseBtn.insertAdjacentElement('afterend', exitBtn);
            }

            ensureGamePauseOverlay(screen);
            setGamePaused(screen, false);
        }

        window.enterGameFullscreen = enterGameFullscreen;
        window.exitGameFullscreen = exitGameFullscreen;
        
        function startGame(game) {
            try {
                // 레벨업 후 자동 진행 타이머가 남아있으면 정리
                if (typeof clearAutoAdvanceAfterLevelUpTimer === 'function') {
                    clearAutoAdvanceAfterLevelUpTimer();
                }
                // 훈련 시작 시점부터 헤더 배지(중앙 메뉴) 표시
                const headerUserBadge = document.getElementById('headerUserBadge');
                if (headerUserBadge) headerUserBadge.style.display = 'flex';

                // 배지 획득 팝업은 게임 플레이 중에만 허용
                window.__allowBadgeUnlockPopup = true;

                // 시작한 카테고리를 기록해두었다가 돌아가기 시 복귀 (기본: 전체보기)
                try {
                    const cat = window.selectedMenuCategory || 'all';
                    if (typeof gameState === 'object' && gameState) {
                        gameState.menuCategoryBeforeGame = cat;
                    }
                } catch (e) { /* ignore */ }

                // 모든 게임 화면 비활성화 먼저 실행
                document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
                
                const mainMenu = document.getElementById('mainMenu');
                if (mainMenu) mainMenu.style.display = 'none';
                
                const todayStats = document.querySelector('.today-stats');
                const scoreDisplay = document.querySelector('.score-display');
                const userBadge = document.querySelector('.user-badge');
                const ttsToggle = document.querySelector('.tts-auto-toggle');
                
                if (todayStats) todayStats.style.display = 'none';
                if (scoreDisplay) scoreDisplay.style.display = 'none';
                if (userBadge && userBadge.parentElement) userBadge.parentElement.style.display = 'none';
                if (ttsToggle) ttsToggle.style.display = 'none';
                
                gameState.currentGame = game;
                gameState.startTime = Date.now();
                lastPlayedGame = game;
                saveLevel();
                
                // 해당 게임의 레벨 카운트만 초기화 (레벨 자체는 유지)
                gameLevelCounts[game] = 0;
                
                const gameMap = {
                    match: 'matchGame', sequence: 'sequenceGame', calc: 'calcGame', color: 'colorGame',
                    pattern: 'patternGame', reaction: 'reactionGame', findDiff: 'findDiffGame', sorting: 'sortingGame',
                    direction: 'directionGame', word: 'wordGame', counting: 'countingGame', pairing: 'pairingGame',
                    timing: 'timingGame', reverse: 'reverseGame', category: 'categoryGame', story: 'storyGame',
                    maze: 'mazeGame', melody: 'melodyGame', puzzle: 'puzzleGame', treasure: 'treasureGame',
                    shadow: 'shadowGame', focus: 'focusGame', palace: 'palaceGame', rotate: 'rotateGame', chain: 'chainGame'
                };
                
                const gameElement = document.getElementById(gameMap[game]);
                if (gameElement) {
                    gameElement.classList.add('active');
                } else {
                    console.error('게임 요소를 찾을 수 없습니다:', gameMap[game]);
                    return;
                }
                
                // 난이도 버튼 상태 업데이트
                if (userProfile && userProfile.difficulty) {
                    updateGameDifficultyButtons(userProfile.difficulty);
                }
                
                // 레벨 표시 업데이트
                updateLevelDisplay(game);
                
                // 게임 초기화 함수 호출
                const initFuncName = 'init' + game.charAt(0).toUpperCase() + game.slice(1) + 'Game';
                if (typeof window[initFuncName] === 'function') {
                    window[initFuncName]();
                } else {
                    console.error('초기화 함수를 찾을 수 없습니다:', initFuncName);
                }
                
                // 자동 음성 안내 (설정이 켜져있을 때)
                if (typeof ttsAutoEnabled !== 'undefined' && ttsAutoEnabled) {
                    console.log('자동 음성 안내 실행:', game);
                    setTimeout(() => {
                        if (typeof speakGameGuide === 'function') {
                            speakGameGuide(game);
                        }
                    }, 300);
                }

                attachGameFullscreenButton();
                syncGameFullscreenExitVisibility();
            } catch (error) {
                console.error('게임 시작 중 오류 발생:', error);
            }
        }
        
        function goBack() {
            try {
                clearGamePauseAll();
                exitGameFullscreenIfNeeded();
                // 레벨업 후 자동 진행 타이머가 남아있으면 정리
                if (typeof clearAutoAdvanceAfterLevelUpTimer === 'function') {
                    clearAutoAdvanceAfterLevelUpTimer();
                }
                if (gameState.startTime) {
                    gameState.trainTime += Math.round((Date.now() - gameState.startTime) / 60000);
                }
                if (typeof stopSpeaking === 'function') stopSpeaking(); // 음성 안내 중지
                document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
                
                const mainMenu = document.getElementById('mainMenu');
                // 홈 복귀 시 레이아웃(특히 전체보기 grid)이 CSS로 적용되도록 inline display는 제거
                if (mainMenu) mainMenu.style.display = '';
                
                const todayStats = document.querySelector('.today-stats');
                if (todayStats) todayStats.style.display = 'block';
                
                const scoreDisplay = document.querySelector('.score-display');
                if (scoreDisplay) scoreDisplay.style.display = 'flex';
                
                const userBadge = document.querySelector('.user-badge');
                if (userBadge && userBadge.parentElement) userBadge.parentElement.style.display = 'block';
                
                const ttsToggle = document.querySelector('.tts-auto-toggle');
                if (ttsToggle) ttsToggle.style.display = 'flex';
                
                clearAllTimers();
                if (typeof saveUserData === 'function') saveUserData(); // 사용자 데이터 저장
                if (typeof updateUI === 'function') updateUI();

                // 메인으로 돌아왔을 때는 배지 획득 팝업 비활성화
                window.__allowBadgeUnlockPopup = false;

                // 뒤로가기 후에도 "전체보기" 상태로 복귀
                if (typeof filterMenuCategory === 'function') {
                    const cat = (typeof gameState === 'object' && gameState && gameState.menuCategoryBeforeGame) ? gameState.menuCategoryBeforeGame : (window.selectedMenuCategory || 'all');
                    filterMenuCategory(cat, { scroll: false });
                }
            } catch (error) {
                console.error('뒤로가기 처리 중 오류:', error);
            }
        }

        // ==================== 메인 메뉴 카테고리 필터 ====================
        function filterMenuCategory(cat, opts = { scroll: true }) {
            try {
                const wrapper = document.getElementById('mainMenu');
                if (!wrapper) return;

                // "전체보기"일 때만 4개 대분류를 2x2 그리드로 배치
                wrapper.classList.toggle('all-view', cat === 'all');
                
                // 카테고리 섹션 표시/숨김
                const sections = wrapper.querySelectorAll('.menu-category');
                sections.forEach(sec => {
                    const secCat = sec.getAttribute('data-cat');
                    const show = (cat === 'all') || (secCat === cat);
                    sec.style.display = show ? '' : 'none';
                });
                
                const buttons = wrapper.querySelectorAll('.category-nav .cat-btn');
                buttons.forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
                });

                // 현재 선택 카테고리 저장 (게임 시작/복귀에 사용)
                window.selectedMenuCategory = cat;
                
                if (opts && opts.scroll && cat !== 'all') {
                    const target = document.getElementById('cat-' + cat);
                    if (target) {
                        const offset = 140;
                        const top = target.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                } else if (opts && opts.scroll && cat === 'all') {
                    const nav = document.getElementById('categoryNav');
                    if (nav) {
                        const offset = 140;
                        const top = nav.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                }
            } catch (e) {
                console.error('카테고리 필터 오류:', e);
            }
        }
        window.filterMenuCategory = filterMenuCategory;

        // ==================== 오늘의 추천 훈련 (일일 고정) ====================
        const DAILY_RECO_STORAGE_KEY = 'dailyRecommendations.v2';
        const DAILY_RECO_CATEGORIES = {
            memory: {
                label: '기억력 훈련',
                color: '#4CAF50',
                games: ['match', 'sequence', 'pattern', 'melody', 'palace', 'treasure']
            },
            calcLang: {
                label: '계산/언어 훈련',
                color: '#2196F3',
                games: ['calc', 'counting', 'word', 'reverse', 'story']
            },
            focusReaction: {
                label: '집중/반응 훈련',
                color: '#FF9800',
                games: ['reaction', 'findDiff', 'timing', 'focus', 'chain', 'color']
            },
            spatial: {
                label: '공간/지각 훈련',
                color: '#9C27B0',
                games: ['direction', 'maze', 'rotate', 'shadow', 'sorting', 'pairing']
            }
        };

        /** 메인 메뉴와 동일 — 추천 모달/DOM 조회 폴백용 */
        const MAIN_MENU_GAME_ICON_SRC = {
            match: 'assets/card_match.png',
            sequence: 'assets/game-icons/game_a1.png',
            pattern: 'assets/game-icons/game_a2.png',
            melody: 'assets/game-icons/game_a3.png',
            palace: 'assets/game-icons/game_a4.png',
            treasure: 'assets/game-icons/game_a5.png',
            calc: 'assets/game-icons/game_b1.png',
            counting: 'assets/game-icons/game_b2.png',
            word: 'assets/game-icons/game_b3.png',
            reverse: 'assets/game-icons/game_b4.png',
            story: 'assets/game-icons/game_b5.png',
            category: 'assets/game-icons/game_b6.png',
            reaction: 'assets/game-icons/game_c1.png',
            findDiff: 'assets/game-icons/game_c2.png',
            timing: 'assets/game-icons/game_c3.png',
            focus: 'assets/game-icons/game_c4.png',
            chain: 'assets/game-icons/game_c5.png',
            color: 'assets/game-icons/game_c6.png',
            direction: 'assets/game-icons/game_d1.png',
            maze: 'assets/game-icons/game_d2.png',
            rotate: 'assets/game-icons/game_d4.png',
            shadow: 'assets/game-icons/game_d5.png',
            sorting: 'assets/game-icons/game_d6.png',
            pairing: 'assets/game-icons/game_d7.png'
        };

        function getTodayKey() {
            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }

        function pickOne(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function loadDailyRecommendations() {
            try {
                const raw = localStorage.getItem(DAILY_RECO_STORAGE_KEY);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }

        function saveDailyRecommendations(data) {
            try {
                localStorage.setItem(DAILY_RECO_STORAGE_KEY, JSON.stringify(data));
            } catch {
                // ignore
            }
        }

        function ensureDailyRecommendations() {
            const today = getTodayKey();
            const existing = loadDailyRecommendations();
            if (existing && existing.date === today && existing.picks) return existing;
            
            const picks = {};
            Object.keys(DAILY_RECO_CATEGORIES).forEach(cat => {
                picks[cat] = pickOne(DAILY_RECO_CATEGORIES[cat].games);
            });
            const data = { date: today, picks };
            saveDailyRecommendations(data);
            return data;
        }

        function getCardInfo(gameId) {
            // 메뉴 카드에서 title/icon/desc를 최대한 가져온다.
            try {
                const cards = document.querySelectorAll('#mainMenu .menu-card');
                for (const card of cards) {
                    const onclick = card.getAttribute('onclick') || '';
                    const m = onclick.match(/startGame\(\s*(['"])([^'"]+)\1\s*\)/);
                    if (!m) continue;
                    if (m[2] !== gameId) continue;
                    
                    const h3 = card.querySelector('h3');
                    const p = card.querySelector('p');
                    const iconSpan = card.querySelector('.icon');
                    const img = card.querySelector('img');
                    const srcFromImg = img ? img.getAttribute('src') : '';
                    
                    return {
                        title: h3 ? h3.textContent.trim() : (img ? img.alt : gameId),
                        desc: p ? p.textContent.trim() : '',
                        iconText: iconSpan ? iconSpan.textContent.trim() : '',
                        imgSrc: srcFromImg || MAIN_MENU_GAME_ICON_SRC[gameId] || ''
                    };
                }
            } catch {
                // ignore
            }
            return { title: gameId, desc: '', iconText: '', imgSrc: MAIN_MENU_GAME_ICON_SRC[gameId] || '' };
        }

        function getMenuCardPreviewHtml(gameId) {
            try {
                const cards = document.querySelectorAll('#mainMenu .menu-card');
                for (const card of cards) {
                    const onclick = card.getAttribute('onclick') || '';
                    const m = onclick.match(/startGame\(\s*(['"])([^'"]+)\1\s*\)/);
                    if (!m) continue;
                    if (m[2] !== gameId) continue;

                    // cloneNode/outerHTML 방식이 일부 환경에서 누락되는 케이스가 있어,
                    // 원본 카드의 style + innerHTML을 그대로 재구성한다.
                    const styleAttr = card.getAttribute('style');
                    const styleHtml = styleAttr ? ` style="${styleAttr.replace(/"/g, '&quot;')}"` : '';
                    return `<div class="menu-card rec-menu-card"${styleHtml}>${card.innerHTML}</div>`;
                }
            } catch {
                // ignore
            }
            const src = MAIN_MENU_GAME_ICON_SRC[gameId];
            if (!src) return '';
            const info = getCardInfo(gameId);
            const alt = (info && info.title) ? info.title : gameId;
            return `<div class="menu-card rec-menu-card" style="padding:0;overflow:hidden;"><img src="${src}" alt="${alt}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;"></div>`;
        }

        function buildFallbackMenuCardHtml(gameId, meta) {
            const info = getCardInfo(gameId);
            const safeTitle = (info && info.title) ? info.title : (meta && meta.label ? meta.label : gameId);
            const img = (info && info.imgSrc) ? `<img src="${info.imgSrc}" alt="${safeTitle}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">` : '';
            // 아이콘/영문 제거: 이미지가 없으면 제목만 크게 보여준다.
            return `
                <div class="menu-card rec-menu-card" style="border-color: rgba(0,0,0,0.08);">
                    ${img || `<h3 style="margin:0;color:var(--cat-color);font-weight:900;">${safeTitle}</h3>`}
                </div>
            `;
        }

        function applyRecommendationBadges(reco) {
            try {
                document.querySelectorAll('#mainMenu .menu-card.is-recommended').forEach(el => el.classList.remove('is-recommended'));
                const picks = (reco && reco.picks) ? reco.picks : {};
                const pickedIds = new Set(Object.values(picks));
                document.querySelectorAll('#mainMenu .menu-card').forEach(card => {
                    const onclick = card.getAttribute('onclick') || '';
                    const m = onclick.match(/startGame\(\s*(['"])([^'"]+)\1\s*\)/);
                    if (m && pickedIds.has(m[2])) card.classList.add('is-recommended');
                });
            } catch {
                // ignore
            }
        }

        function openTodayRecommendations() {
            const reco = ensureDailyRecommendations();
            applyRecommendationBadges(reco);
            
            const modal = document.getElementById('recommendModal');
            const list = document.getElementById('recommendList');
            if (!modal || !list) return;
            
            const itemsHtml = Object.keys(DAILY_RECO_CATEGORIES).map(cat => {
                const meta = DAILY_RECO_CATEGORIES[cat];
                const gameId = reco.picks[cat];
                const previewHtml = getMenuCardPreviewHtml(gameId);
                
                return `
                    <div class="recommend-item" style="--cat-color:${meta.color}" onclick="startGame('${gameId}'); closeTodayRecommendations();">
                        <div class="recommend-preview">
                            ${previewHtml || buildFallbackMenuCardHtml(gameId, meta)}
                        </div>
                        <div class="recommend-category-label">${meta.label}</div>
                    </div>
                `;
            }).join('');
            
            list.innerHTML = itemsHtml;
            modal.style.display = 'flex';
            
            // 외부 클릭 닫기(1회 바인딩)
            if (!modal.dataset.bound) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeTodayRecommendations();
                });
                modal.dataset.bound = '1';
            }
        }

        function closeTodayRecommendations() {
            const modal = document.getElementById('recommendModal');
            if (modal) modal.style.display = 'none';
        }

        window.openTodayRecommendations = openTodayRecommendations;
        window.closeTodayRecommendations = closeTodayRecommendations;

        document.addEventListener('DOMContentLoaded', () => {
            // 오늘의 추천을 미리 생성 + 카드 배지 표시(랜덤은 하루 고정)
            const reco = ensureDailyRecommendations();
            applyRecommendationBadges(reco);
        });
        
        function clearAllTimers() {
            try {
                // 각 타이머 변수가 존재하고 값이 있으면 정리
                if (typeof seqTimer !== 'undefined' && seqTimer) { clearInterval(seqTimer); seqTimer = null; }
                if (typeof calcTimer !== 'undefined' && calcTimer) { clearInterval(calcTimer); calcTimer = null; }
                if (typeof colorTimer !== 'undefined' && colorTimer) { clearInterval(colorTimer); colorTimer = null; }
                if (typeof findDiffTimer !== 'undefined' && findDiffTimer) { clearInterval(findDiffTimer); findDiffTimer = null; }
                if (typeof sortTimer !== 'undefined' && sortTimer) { clearInterval(sortTimer); sortTimer = null; }
                if (typeof dirTimer !== 'undefined' && dirTimer) { clearInterval(dirTimer); dirTimer = null; }
                if (typeof wordTimer !== 'undefined' && wordTimer) { clearInterval(wordTimer); wordTimer = null; }
                if (typeof countTimer !== 'undefined' && countTimer) { clearInterval(countTimer); countTimer = null; }
                if (typeof reverseTimer !== 'undefined' && reverseTimer) { clearInterval(reverseTimer); reverseTimer = null; }
                if (typeof timingInterval !== 'undefined' && timingInterval) { clearInterval(timingInterval); timingInterval = null; }
            } catch (error) {
                console.error('타이머 정리 중 오류:', error);
            }
        }
        
        // 게임별 추가 데이터 저장용
        let currentGameData = {};

        // 레벨업 후 자동 다음 단계(재시작) 타이머
        let autoAdvanceAfterLevelUpTimer = null;
        function clearAutoAdvanceAfterLevelUpTimer() {
            if (autoAdvanceAfterLevelUpTimer) {
                clearTimeout(autoAdvanceAfterLevelUpTimer);
                autoAdvanceAfterLevelUpTimer = null;
            }
        }
        
        function endGame(game, score) {
            try {
                clearGamePauseAll();
                clearAutoAdvanceAfterLevelUpTimer();
                clearAllTimers();
                gameState.gamesPlayed++;
                gameState.todayScore += score;
                if (gameState.todayScore > gameState.highScore) {
                    gameState.highScore = gameState.todayScore;
                }
                
                // 사용자별 기록 저장
                if (typeof saveTrainingRecord === 'function') {
                    saveTrainingRecord(game, score);
                }
                
                // 배지 통계 업데이트
                const accuracy = gameState.totalAnswers > 0 ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100) : 0;
                if (typeof updateBadgeStats === 'function') {
                    updateBadgeStats(game, {
                        score: score,
                        accuracy: accuracy,
                        ...currentGameData
                    });
                }
                currentGameData = {}; // 초기화
                
                // 게임 종료 시 레벨업 체크 (1게임 완료 후 레벨업)
                const leveledUp = checkLevelUpOnGameEnd(game);
                
                document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
                
                // 현재 레벨 표시 업데이트
                const completeLevelNum = document.getElementById('completeLevelNum');
                if (completeLevelNum) completeLevelNum.textContent = getGameLevel(game);
                
                const finalScore = document.getElementById('finalScore');
                if (finalScore) finalScore.textContent = score + '점';
                
                // 점수/정답률에 따른 메시지와 효과 분기
                const isGoodScore = accuracy >= 50 || score >= 50;
                const gameCompleteTitle = document.querySelector('#gameComplete h2');
                const completeMessage = document.getElementById('completeMessage');
                
                if (isGoodScore) {
                    // 좋은 점수: 축하 메시지 + 축포
                    const successMsgs = ['정말 잘하셨어요! 👏', '두뇌가 건강해지고 있어요! 🧠', '오늘도 열심히 훈련했네요! 💪', '대단해요! 화이팅! 🌟', '최고예요! 🎉'];
                    if (gameCompleteTitle) gameCompleteTitle.textContent = '🎉 훌륭합니다!';
                    if (completeMessage) completeMessage.textContent = successMsgs[Math.floor(Math.random() * successMsgs.length)];
                    
                    // 축하 효과 실행
                    if (typeof showCelebration === 'function') showCelebration();
                    if (typeof launchConfetti === 'function') launchConfetti();
                    if (typeof playApplause === 'function') playApplause();
                } else {
                    // 낮은 점수: 격려 메시지만 (축포 없음)
                    const encourageMsgs = [
                        '괜찮아요! 다음엔 더 잘할 수 있어요! 💪',
                        '포기하지 마세요! 연습하면 늘어요! 🌱',
                        '조금씩 나아지고 있어요! 힘내세요! 😊',
                        '다시 도전해보세요! 응원합니다! 🙌',
                        '천천히 해도 괜찮아요! 화이팅! 💖',
                        '오늘도 수고하셨어요! 내일 또 만나요! 🌈'
                    ];
                    if (gameCompleteTitle) gameCompleteTitle.textContent = '😊 수고하셨어요!';
                    if (completeMessage) completeMessage.textContent = encourageMsgs[Math.floor(Math.random() * encourageMsgs.length)];
                }
                
                const playAgainBtn = document.getElementById('playAgainBtn');
                if (playAgainBtn) playAgainBtn.onclick = () => playAgain(game);
                
                // 레벨업 알림 표시 (버튼은 항상 표시)
                const levelUpNotice = document.getElementById('levelUpNotice');
                const completeButtons = document.getElementById('completeButtons');
                
                if (leveledUp) {
                    if (levelUpNotice) levelUpNotice.style.display = 'block';
                } else {
                    if (levelUpNotice) levelUpNotice.style.display = 'none';
                }
                // 버튼은 항상 표시
                if (completeButtons) completeButtons.style.display = 'flex';
                
                const gameComplete = document.getElementById('gameComplete');
                if (gameComplete) gameComplete.classList.add('active');
                
                // 능력 리포트 생성
                generateAbilityReport(game, score, accuracy);

                // 레벨업이 발생한 경우: 팝업 없이 자동으로 다음 단계(같은 게임 재시작)로 진행
                if (leveledUp) {
                    autoAdvanceAfterLevelUpTimer = setTimeout(() => {
                        try {
                            const gc = document.getElementById('gameComplete');
                            // 사용자가 이미 메뉴로 나간 경우에는 자동 진행하지 않음
                            if (!gc || !gc.classList.contains('active')) return;
                            playAgain(game);
                        } catch (e) {
                            console.error('레벨업 후 자동 진행 중 오류:', e);
                        }
                    }, 1900); // 레벨업 오버레이(약 1.8s) 표시 이후 진행
                }
            } catch (error) {
                console.error('게임 종료 처리 중 오류:', error);
            }
        }
        
        // 능력 리포트 생성
        function generateAbilityReport(game, score, accuracy) {
            // 게임별 능력 분류
            const gameAbilities = {
                match: { memory: 90, reaction: 30, focus: 70, motor: 50 },
                sequence: { memory: 100, reaction: 20, focus: 80, motor: 30 },
                calc: { memory: 40, reaction: 50, focus: 90, motor: 20 },
                color: { memory: 30, reaction: 70, focus: 100, motor: 20 },
                pattern: { memory: 100, reaction: 20, focus: 80, motor: 40 },
                reaction: { memory: 10, reaction: 100, focus: 60, motor: 80 },
                findDiff: { memory: 40, reaction: 50, focus: 100, motor: 30 },
                sorting: { memory: 50, reaction: 40, focus: 70, motor: 90 },
                direction: { memory: 30, reaction: 80, focus: 90, motor: 60 },
                word: { memory: 70, reaction: 30, focus: 80, motor: 40 },
                counting: { memory: 50, reaction: 40, focus: 90, motor: 20 },
                pairing: { memory: 60, reaction: 30, focus: 70, motor: 80 },
                timing: { memory: 20, reaction: 100, focus: 80, motor: 70 },
                reverse: { memory: 90, reaction: 30, focus: 80, motor: 40 },
                category: { memory: 60, reaction: 40, focus: 90, motor: 30 },
                story: { memory: 80, reaction: 30, focus: 90, motor: 50 }
            };
            
            const abilities = gameAbilities[game] || { memory: 50, reaction: 50, focus: 50, motor: 50 };
            const scoreMultiplier = Math.min(accuracy / 100, 1) * 0.5 + 0.5; // 0.5 ~ 1.0
            
            // 각 능력 수치 계산 (게임 기본값 * 점수 배율)
            const memoryScore = Math.round(abilities.memory * scoreMultiplier);
            const reactionScore = Math.round(abilities.reaction * scoreMultiplier);
            const focusScore = Math.round(abilities.focus * scoreMultiplier);
            const motorScore = Math.round(abilities.motor * scoreMultiplier);
            
            // 리포트 UI 업데이트
            updateAbilityBar('memory', memoryScore);
            updateAbilityBar('reaction', reactionScore);
            updateAbilityBar('focus', focusScore);
            updateAbilityBar('motor', motorScore);
            
            // 개선 팁 생성
            const tips = generateImprovementTip(game, accuracy, { memoryScore, reactionScore, focusScore, motorScore });
            const tipText = document.getElementById('tipText');
            if (tipText) tipText.textContent = tips;
        }
        
        function updateAbilityBar(ability, value) {
            const fill = document.getElementById(ability + 'Fill');
            const valueEl = document.getElementById(ability + 'Value');
            
            if (fill) {
                fill.style.width = value + '%';
                fill.className = 'ability-fill';
                if (value < 40) fill.classList.add('low');
                else if (value >= 70) fill.classList.add('high');
            }
            if (valueEl) {
                if (value >= 80) valueEl.textContent = '매우 좋음';
                else if (value >= 60) valueEl.textContent = '좋음';
                else if (value >= 40) valueEl.textContent = '보통';
                else valueEl.textContent = '향상 필요';
            }
        }
        
        function generateImprovementTip(game, accuracy, scores) {
            const gameTips = {
                match: { good: '기억력이 향상되고 있어요! 더 어려운 레벨에 도전해보세요.', bad: '카드 위치를 천천히 기억해보세요. 규칙적인 패턴을 찾으면 도움이 됩니다.' },
                sequence: { good: '숫자 기억력이 좋아지고 있어요! 일상에서도 전화번호를 외워보세요.', bad: '숫자를 소리내어 읽으면 기억에 도움이 됩니다. 천천히 연습해보세요.' },
                calc: { good: '암산 능력이 훌륭해요! 계속 훈련하면 더 빨라질 거예요.', bad: '작은 숫자부터 시작해보세요. 10단위로 묶어서 계산하면 쉬워요.' },
                color: { good: '집중력이 좋아지고 있어요! 색상 인지 능력도 향상되었어요.', bad: '글자가 아닌 색상에만 집중해보세요. 천천히 읽으면 덜 헷갈려요.' },
                pattern: { good: '패턴 인식 능력이 좋아요! 더 많은 칸에 도전해보세요.', bad: '켜진 칸을 순서대로 기억해보세요. 이야기를 만들면 도움이 됩니다.' },
                reaction: { good: '반응 속도가 빨라지고 있어요! 손가락 운동도 함께 해보세요.', bad: '화면을 주시하며 준비하세요. 매일 조금씩 연습하면 빨라져요.' },
                findDiff: { good: '관찰력이 뛰어나요! 세부 사항을 잘 구분하고 있어요.', bad: '한 줄씩 천천히 살펴보세요. 급하지 않게 비교하면 찾기 쉬워요.' },
                sorting: { good: '순서 정렬 능력이 좋아요! 손가락 조작도 정확해지고 있어요.', bad: '작은 숫자부터 차례로 누르세요. 손가락 힘 조절 연습이 도움됩니다.' },
                direction: { good: '방향 인지 능력이 향상되었어요! 길찾기에도 도움이 될 거예요.', bad: '화살표 방향을 먼저 확인하고 누르세요. 천천히 해도 괜찮아요.' },
                word: { good: '어휘력이 좋아지고 있어요! 책 읽기도 함께 해보세요.', bad: '빈칸 앞뒤 글자를 보며 유추해보세요. 평소 단어를 많이 접해보세요.' },
                counting: { good: '개수 세기가 정확해요! 집중력도 좋아지고 있어요.', bad: '손가락으로 짚으며 세면 정확해요. 그룹으로 나눠서 세보세요.' },
                pairing: { good: '연결 능력이 좋아요! 관계 파악 능력도 향상되었어요.', bad: '관련 있는 단어를 먼저 찾아보세요. 천천히 생각하면 찾을 수 있어요.' },
                timing: { good: '시간 감각이 좋아지고 있어요! 정확도가 높아지고 있어요.', bad: '마음속으로 초를 세어보세요. 규칙적인 리듬이 도움됩니다.' },
                reverse: { good: '언어 처리 능력이 좋아요! 두뇌 활성화에 매우 효과적이에요.', bad: '글자를 하나씩 읽으며 뒤에서부터 눌러보세요. 연습하면 익숙해져요.' },
                category: { good: '분류 능력이 좋아요! 체계적 사고력이 향상되고 있어요.', bad: '카테고리를 먼저 확인하고 해당하는 것만 선택하세요.' },
                story: { good: '순서 파악 능력이 뛰어나요! 논리적 사고력도 좋아지고 있어요.', bad: '이야기의 흐름을 생각하며 순서를 정해보세요. 일상 순서를 떠올려보세요.' }
            };
            
            const tip = gameTips[game] || { good: '잘하고 있어요!', bad: '연습하면 늘어요!' };
            return accuracy >= 50 ? tip.good : tip.bad;
        }
        
        // 훈련 기록 저장
        function saveTrainingRecord(game, score) {
            if (!userProfile.id) return;
            
            const today = new Date().toISOString().split('T')[0];
            
            // 오늘 기록 찾기 또는 새로 생성
            let todayRecord = trainingHistory.find(r => r.date === today);
            if (!todayRecord) {
                todayRecord = {
                    date: today,
                    name: userProfile.name,
                    totalScore: 0,
                    gamesPlayed: 0,
                    correctAnswers: 0,
                    totalAnswers: 0,
                    games: {}
                };
                trainingHistory.push(todayRecord);
            }
            
            todayRecord.totalScore += score;
            todayRecord.gamesPlayed++;
            todayRecord.correctAnswers = gameState.correctAnswers;
            todayRecord.totalAnswers = gameState.totalAnswers;
            
            // 게임별 통계
            if (!todayRecord.games[game]) {
                todayRecord.games[game] = { count: 0, totalScore: 0 };
            }
            todayRecord.games[game].count++;
            todayRecord.games[game].totalScore += score;
            
            // 전체 게임 통계
            if (!gameStats[game]) {
                gameStats[game] = { count: 0, totalScore: 0, details: [] };
            }
            gameStats[game].count++;
            gameStats[game].totalScore += score;
            
            // 상세 기록 저장 (최대 50개)
            const detailRecord = {
                date: new Date().toISOString(),
                score: score,
                accuracy: gameState.totalAnswers > 0 ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100) : 0,
                ...currentGameData
            };
            if (!gameStats[game].details) gameStats[game].details = [];
            gameStats[game].details.unshift(detailRecord);
            if (gameStats[game].details.length > 50) gameStats[game].details.pop();
            
            // 사용자별 데이터 저장
            saveUserData();
            
            // 마지막 사용자 ID 저장
            localStorage.setItem('lastUserId', userProfile.id);
        }
        
        function playAgain(game) {
            document.getElementById('gameComplete').classList.remove('active');
            startGame(game || gameState.currentGame);
        }

        init();
