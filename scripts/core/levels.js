// ==================== 레벨 시스템 (게임별 개별 레벨) ====================
        const MAX_LEVEL = 10;
        const CORRECT_FOR_LEVEL_UP = 2; // 레벨 업에 필요한 연속 정답 수
        const ALL_GAMES = ['match', 'sequence', 'calc', 'color', 'pattern', 'reaction', 'findDiff', 'sorting', 'direction', 'word', 'counting', 'pairing', 'timing', 'reverse', 'category', 'story', 'maze', 'melody', 'puzzle', 'treasure', 'shadow', 'focus', 'palace', 'rotate', 'chain'];
        
        // 각 게임별 레벨 저장 객체
        let gameLevels = {};
        let gameLevelCounts = {};
        let lastPlayedGame = null;
        
        // 게임별 레벨 초기화
        ALL_GAMES.forEach(game => {
            gameLevels[game] = 1;
            gameLevelCounts[game] = 0;
        });
        
        // 레벨 데이터 로드 (안전하게)
        try {
            const savedLevels = localStorage.getItem('gameLevels');
            const savedCounts = localStorage.getItem('gameLevelCounts');
            const savedGame = localStorage.getItem('lastPlayedGame');
            if (savedLevels) {
                const parsed = JSON.parse(savedLevels);
                ALL_GAMES.forEach(game => {
                    if (parsed[game]) gameLevels[game] = parseInt(parsed[game]) || 1;
                });
            }
            if (savedCounts) {
                const parsed = JSON.parse(savedCounts);
                ALL_GAMES.forEach(game => {
                    if (parsed[game]) gameLevelCounts[game] = parseInt(parsed[game]) || 0;
                });
            }
            if (savedGame) lastPlayedGame = savedGame;
        } catch (e) {
            console.warn('레벨 데이터 로드 실패:', e);
        }
        
        // 게임별 레벨 가져오기
        function getGameLevel(gameId) {
            return gameLevels[gameId] || 1;
        }
        
        // 레벨 저장
        function saveLevel() {
            try {
                localStorage.setItem('gameLevels', JSON.stringify(gameLevels));
                localStorage.setItem('gameLevelCounts', JSON.stringify(gameLevelCounts));
                if (lastPlayedGame) {
                    localStorage.setItem('lastPlayedGame', lastPlayedGame);
                }
            } catch (error) {
                console.error('레벨 저장 중 오류:', error);
            }
        }
        
        // 레벨 표시 업데이트
        function updateLevelDisplay(gameId) {
            const levelDisplay = document.getElementById(gameId + 'LevelDisplay');
            const gameLevel = getGameLevel(gameId);
            if (levelDisplay) {
                levelDisplay.innerHTML = `
                    <span class="level-label">레벨</span>
                    <span class="level-number">${gameLevel} / ${MAX_LEVEL}</span>
                    <div class="level-progress">
                        ${Array.from({length: MAX_LEVEL}, (_, i) => {
                            let cls = 'level-dot';
                            if (i < gameLevel - 1) cls += ' completed';
                            else if (i === gameLevel - 1) cls += ' current';
                            return `<span class="${cls}"></span>`;
                        }).join('')}
                    </div>
                `;
            }
        }
        
        // 레벨 업 체크 (게임 중 정답 카운트만 누적)
        function checkLevelUp(isCorrect, gameId) {
            if (isCorrect) {
                gameLevelCounts[gameId] = (gameLevelCounts[gameId] || 0) + 1;
            } else {
                gameLevelCounts[gameId] = 0;
            }
            return false; // 게임 중에는 레벨업 안함
        }
        
        // 게임 종료 시 레벨 업 체크
        function checkLevelUpOnGameEnd(gameId) {
            try {
                lastPlayedGame = gameId;
                const gameLevel = getGameLevel(gameId);
                const levelCount = gameLevelCounts[gameId] || 0;
                
                if (levelCount >= CORRECT_FOR_LEVEL_UP && gameLevel < MAX_LEVEL) {
                    gameLevels[gameId] = gameLevel + 1;
                    gameLevelCounts[gameId] = 0;
                    saveLevel();
                    updateLevelDisplay(gameId);
                    showLevelUpMessage(gameId);
                    return true;
                }
                gameLevelCounts[gameId] = 0; // 게임 종료 후 카운트 리셋
                saveLevel();
                return false;
            } catch (error) {
                console.error('레벨업 체크 중 오류:', error);
                return false;
            }
        }
        
        // 레벨 업 메시지 표시
        function showLevelUpMessage(gameId) {
            try {
                const gameLevel = getGameLevel(gameId);
                const overlay = document.createElement('div');
                overlay.className = 'level-up-overlay';
                overlay.innerHTML = `
                    <div class="level-up-message">
                        <div class="level-up-icon">⬆️</div>
                        <div class="level-up-text">레벨 UP!</div>
                        <div class="level-up-number">Level ${gameLevel}</div>
                    </div>
                `;
                document.body.appendChild(overlay);
                
                setTimeout(() => overlay.classList.add('show'), 50);
                setTimeout(() => {
                    overlay.classList.remove('show');
                    setTimeout(() => {
                        if (overlay.parentNode) {
                            overlay.remove();
                        }
                    }, 300);
                }, 1500);
            } catch (error) {
                console.error('레벨업 메시지 표시 중 오류:', error);
            }
        }
        
        // 레벨에 따른 난이도 배율 (1.0 ~ 2.0) - 게임별
        function getLevelMultiplier(gameId) {
            const gameLevel = gameId ? getGameLevel(gameId) : 1;
            return 1 + (gameLevel - 1) * 0.11; // 레벨 1: 1.0, 레벨 10: 2.0
        }
        
        // 레벨에 따른 시간 배율 (1.0 ~ 0.5) - 게임별
        function getLevelTimeMultiplier(gameId) {
            const gameLevel = gameId ? getGameLevel(gameId) : 1;
            return 1 - (gameLevel - 1) * 0.05; // 레벨 1: 1.0, 레벨 10: 0.55
        }
        
        // 특정 게임 레벨 초기화
        function resetLevel(gameId) {
            if (gameId) {
                gameLevels[gameId] = 1;
                gameLevelCounts[gameId] = 0;
            }
            saveLevel();
        }
        
        // 현재 게임 레벨 초기화 (게임 완료 화면에서 사용)
        function resetCurrentGameLevel() {
            if (lastPlayedGame) {
                gameLevels[lastPlayedGame] = 1;
                gameLevelCounts[lastPlayedGame] = 0;
                saveLevel();
                alert('이 게임의 레벨이 초기화되었습니다!');
                goBack();
            }
        }
        
        // 레벨 완전 초기화 (모든 게임 레벨 삭제)
        function clearLevelData() {
            ALL_GAMES.forEach(game => {
                gameLevels[game] = 1;
                gameLevelCounts[game] = 0;
            });
            lastPlayedGame = null;
            localStorage.removeItem('gameLevels');
            localStorage.removeItem('gameLevelCounts');
            localStorage.removeItem('lastPlayedGame');
        }
