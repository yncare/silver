// ==================== 난이도 선택 ====================
        let selectedDifficulty = null;
        
        function showDifficultyModal() {
            selectedDifficulty = userProfile.difficulty;
            
            // 현재 선택된 난이도 표시
            document.querySelectorAll('.difficulty-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.diff === selectedDifficulty) {
                    opt.classList.add('selected');
                }
            });
            
            document.getElementById('difficultyModal').classList.add('active');
        }
        
        function closeDifficultyModal() {
            document.getElementById('difficultyModal').classList.remove('active');
        }
        
        function selectDifficulty(diff, element) {
            selectedDifficulty = diff;
            document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');
        }
        
        function applyDifficulty() {
            if (selectedDifficulty && selectedDifficulty !== userProfile.difficulty) {
                userProfile.difficulty = selectedDifficulty;
                
                // 저장된 사용자 정보 업데이트
                const savedUsers = JSON.parse(localStorage.getItem('cognitiveUsers') || '[]');
                const userIndex = savedUsers.findIndex(u => u.id === userProfile.id);
                if (userIndex !== -1) {
                    savedUsers[userIndex].difficulty = selectedDifficulty;
                    localStorage.setItem('cognitiveUsers', JSON.stringify(savedUsers));
                }
                
                // 화면 배지 업데이트
                const settings = difficultySettings[selectedDifficulty];
                const badge = document.getElementById('difficultyBadge');
                badge.textContent = settings.name + ' ▼';
                badge.className = 'difficulty-badge clickable ' + settings.badgeClass;
                
                // TTS로 알려주기
                if (ttsAutoEnabled) {
                    speak(`난이도가 ${settings.name}(으)로 변경되었습니다.`);
                }
            }
            
            closeDifficultyModal();
        }
        
        // 배지 그리드 렌더링
        function renderBadgeGrid() {
            const grid = document.getElementById('badgeGrid');
            const earnedCount = Object.keys(earnedBadges).length;
            
            document.getElementById('badgeCountDisplay').textContent = `${earnedCount} / 20`;
            
            grid.innerHTML = badgeDefinitions.map(badge => {
                const isEarned = !!earnedBadges[badge.id];
                const earnedDate = isEarned ? new Date(earnedBadges[badge.id].earnedAt).toLocaleDateString('ko-KR') : '';
                
                return `
                    <div class="badge-card ${isEarned ? 'earned' : 'locked'}">
                        ${!isEarned ? '<span class="badge-lock-icon">🔒</span>' : ''}
                        <span class="badge-icon">${badge.icon}</span>
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-desc">${badge.desc}</div>
                        ${isEarned ? `<div class="badge-earned-date">획득: ${earnedDate}</div>` : ''}
                    </div>
                `;
            }).join('');
        }
        
        // 게임별 통계 업데이트 함수
        function updateBadgeStats(gameType, data) {
            // 총 게임 수
            badgeStats.totalGames++;
            
            // 고유 게임 종류 추적
            badgeStats.playedGameTypes[gameType] = true;
            badgeStats.uniqueGamesPlayed = Object.keys(badgeStats.playedGameTypes).length;
            
            // 최고 점수
            if (data.score && data.score > badgeStats.maxSingleScore) {
                badgeStats.maxSingleScore = data.score;
            }
            
            // 정확도 100%
            if (data.accuracy === 100) {
                badgeStats.hasPerfectAccuracy = true;
            }
            
            // 게임별 특수 통계
            switch(gameType) {
                case 'match':
                    if (data.level && data.level > badgeStats.maxMatchLevel) {
                        badgeStats.maxMatchLevel = data.level;
                    }
                    if (data.consecutive && data.consecutive > badgeStats.matchConsecutive) {
                        badgeStats.matchConsecutive = data.consecutive;
                    }
                    break;
                case 'pattern':
                    if (data.patternLevel && data.patternLevel > badgeStats.maxPatternLevel) {
                        badgeStats.maxPatternLevel = data.patternLevel;
                    }
                    break;
                case 'sequence':
                    if (data.sequenceLength && data.sequenceLength > badgeStats.maxSequenceLength) {
                        badgeStats.maxSequenceLength = data.sequenceLength;
                    }
                    break;
                case 'calculation':
                    if (data.consecutive && data.consecutive > badgeStats.calcConsecutive) {
                        badgeStats.calcConsecutive = data.consecutive;
                    }
                    break;
                case 'color':
                    if (data.consecutive && data.consecutive > badgeStats.colorConsecutive) {
                        badgeStats.colorConsecutive = data.consecutive;
                    }
                    break;
                case 'sort':
                    if (data.items && data.items > badgeStats.maxSortItems) {
                        badgeStats.maxSortItems = data.items;
                    }
                    break;
                case 'reaction':
                    if (data.reactionTime && data.reactionTime < badgeStats.fastestReaction) {
                        badgeStats.fastestReaction = data.reactionTime;
                    }
                    break;
                case 'timing':
                    if (data.accuracy !== undefined && data.accuracy < badgeStats.bestTimingAccuracy) {
                        badgeStats.bestTimingAccuracy = data.accuracy;
                    }
                    break;
                case 'reverse':
                    if (data.consecutive && data.consecutive > badgeStats.reverseConsecutive) {
                        badgeStats.reverseConsecutive = data.consecutive;
                    }
                    break;
                case 'findDiff':
                    if (data.consecutive && data.consecutive > badgeStats.findDiffConsecutive) {
                        badgeStats.findDiffConsecutive = data.consecutive;
                    }
                    break;
                case 'pairing':
                    if (data.score && data.score > badgeStats.maxPairingScore) {
                        badgeStats.maxPairingScore = data.score;
                    }
                    break;
            }
            
            // 일일 최고 점수
            if (gameState.todayScore > badgeStats.maxDailyScore) {
                badgeStats.maxDailyScore = gameState.todayScore;
            }
            
            // 연속 출석일 계산
            updateConsecutiveDays();
            
            saveBadgeData();
            checkAndAwardBadges();
        }
        
        // 연속 출석일 업데이트
        function updateConsecutiveDays() {
            const today = new Date().toISOString().split('T')[0];
            const lastPlayDate = localStorage.getItem('lastPlayDate_' + userProfile.id);
            
            if (!lastPlayDate) {
                badgeStats.consecutiveDays = 1;
            } else {
                const last = new Date(lastPlayDate);
                const now = new Date(today);
                const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    // 같은 날
                } else if (diffDays === 1) {
                    badgeStats.consecutiveDays++;
                } else {
                    badgeStats.consecutiveDays = 1;
                }
            }
            
            localStorage.setItem('lastPlayDate_' + userProfile.id, today);
        }
        
        // 5단계 난이도 설정
        const difficultySettings = {
            very_easy: {
                name: '매우 쉬움', badgeClass: 'very-easy',
                match: { basePairs: 3 },
                sequence: { startDigits: 2, showTime: 5000, inputTime: 20000 },
                calc: { maxNum: 10, operators: ['+'] },
                color: { timeLimit: 20000, mismatchRate: 0.2 },
                pattern: { gridSize: 3, patternCount: 2 },
                reaction: { minDelay: 2000, maxDelay: 4000 },
                findDiff: { gridSize: 9, timeLimit: 15000 },
                sorting: { count: 4, timeLimit: 20000 },
                direction: { timeLimit: 8000 },
                word: { wordLength: 2, timeLimit: 20000 },
                counting: { gridSize: 12, maxCount: 5, timeLimit: 20000 },
                pairing: { pairs: 3 },
                timing: { tolerance: 0.5 },
                reverse: { wordLength: 2, timeLimit: 20000 },
                category: { itemCount: 6, correctCount: 2, timeLimit: 30000 },
                story: { cardCount: 3, timeLimit: 40000 }
            },
            easy: {
                name: '쉬움', badgeClass: 'easy',
                match: { basePairs: 4 },
                sequence: { startDigits: 2, showTime: 4000, inputTime: 15000 },
                calc: { maxNum: 20, operators: ['+'] },
                color: { timeLimit: 15000, mismatchRate: 0.3 },
                pattern: { gridSize: 3, patternCount: 3 },
                reaction: { minDelay: 1500, maxDelay: 3500 },
                findDiff: { gridSize: 12, timeLimit: 12000 },
                sorting: { count: 5, timeLimit: 18000 },
                direction: { timeLimit: 6000 },
                word: { wordLength: 2, timeLimit: 15000 },
                counting: { gridSize: 16, maxCount: 7, timeLimit: 15000 },
                pairing: { pairs: 4 },
                timing: { tolerance: 0.4 },
                reverse: { wordLength: 2, timeLimit: 15000 },
                category: { itemCount: 8, correctCount: 3, timeLimit: 25000 },
                story: { cardCount: 3, timeLimit: 35000 }
            },
            normal: {
                name: '보통', badgeClass: 'normal',
                match: { basePairs: 5 },
                sequence: { startDigits: 3, showTime: 3000, inputTime: 12000 },
                calc: { maxNum: 50, operators: ['+', '-'] },
                color: { timeLimit: 12000, mismatchRate: 0.5 },
                pattern: { gridSize: 4, patternCount: 4 },
                reaction: { minDelay: 1000, maxDelay: 3000 },
                findDiff: { gridSize: 16, timeLimit: 10000 },
                sorting: { count: 6, timeLimit: 15000 },
                direction: { timeLimit: 5000 },
                word: { wordLength: 3, timeLimit: 12000 },
                counting: { gridSize: 20, maxCount: 9, timeLimit: 12000 },
                pairing: { pairs: 5 },
                timing: { tolerance: 0.3 },
                reverse: { wordLength: 3, timeLimit: 12000 },
                category: { itemCount: 9, correctCount: 3, timeLimit: 20000 },
                story: { cardCount: 4, timeLimit: 30000 }
            },
            hard: {
                name: '어려움', badgeClass: 'hard',
                match: { basePairs: 6 },
                sequence: { startDigits: 4, showTime: 2500, inputTime: 10000 },
                calc: { maxNum: 99, operators: ['+', '-', '×'] },
                color: { timeLimit: 8000, mismatchRate: 0.7 },
                pattern: { gridSize: 4, patternCount: 5 },
                reaction: { minDelay: 800, maxDelay: 2500 },
                findDiff: { gridSize: 20, timeLimit: 8000 },
                sorting: { count: 8, timeLimit: 12000 },
                direction: { timeLimit: 4000 },
                word: { wordLength: 3, timeLimit: 10000 },
                counting: { gridSize: 24, maxCount: 11, timeLimit: 10000 },
                pairing: { pairs: 6 },
                timing: { tolerance: 0.25 },
                reverse: { wordLength: 3, timeLimit: 10000 },
                category: { itemCount: 9, correctCount: 4, timeLimit: 15000 },
                story: { cardCount: 4, timeLimit: 25000 }
            },
            very_hard: {
                name: '매우 어려움', badgeClass: 'very-hard',
                match: { basePairs: 7 },
                sequence: { startDigits: 5, showTime: 2000, inputTime: 8000 },
                calc: { maxNum: 99, operators: ['+', '-', '×', '÷'] },
                color: { timeLimit: 6000, mismatchRate: 0.8 },
                pattern: { gridSize: 5, patternCount: 6 },
                reaction: { minDelay: 500, maxDelay: 2000 },
                findDiff: { gridSize: 25, timeLimit: 6000 },
                sorting: { count: 10, timeLimit: 10000 },
                direction: { timeLimit: 3000 },
                word: { wordLength: 4, timeLimit: 8000 },
                counting: { gridSize: 30, maxCount: 13, timeLimit: 8000 },
                pairing: { pairs: 7 },
                timing: { tolerance: 0.2 },
                reverse: { wordLength: 4, timeLimit: 8000 },
                category: { itemCount: 12, correctCount: 4, timeLimit: 12000 },
                story: { cardCount: 5, timeLimit: 20000 }
            }
        };
        
        // 게임 상태
        let gameState = {
            todayScore: 0,
            highScore: parseInt(localStorage.getItem('highScore')) || 0,
            gamesPlayed: parseInt(localStorage.getItem('gamesPlayed')) || 0,
            correctAnswers: parseInt(localStorage.getItem('correctAnswers')) || 0,
            totalAnswers: parseInt(localStorage.getItem('totalAnswers')) || 0,
            trainTime: parseInt(localStorage.getItem('trainTime')) || 0,
            currentGame: null,
            startTime: null
        };
