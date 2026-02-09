// ==================== 사용자 프로필 ====================
        let userProfile = { id: '', name: '', age: null, gender: null, difficulty: 'normal', userType: 'personal' };
        let selectedUserId = null;

        // 개인/기관 탭 상태
        let selectedAccountType = localStorage.getItem('selectedAccountType') || 'personal';
        // 첫 로그인 화면에서는 사용자 리스트를 기본 숨김 → 탭(개인/기관) 클릭 시에만 펼침
        let hasOpenedUserList = false;
        function setAccountType(type) {
            selectedAccountType = (type === 'institution') ? 'institution' : 'personal';
            localStorage.setItem('selectedAccountType', selectedAccountType);
            hasOpenedUserList = true;

            // 탭 UI 업데이트
            try {
                const strip = document.getElementById('accountTypeStrip');
                if (strip) {
                    strip.querySelectorAll('.account-type-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.getAttribute('data-type') === selectedAccountType);
                    });
                }
            } catch (e) { /* ignore */ }

            // 선택 초기화 후 목록 재렌더
            selectedUserId = null;
            const enterBtn = document.getElementById('enterBtn');
            if (enterBtn) enterBtn.style.display = 'none';

            // 리스트 섹션 표시(처음 클릭 시)
            try {
                const section = document.getElementById('existingUsersSection');
                if (section) section.classList.remove('is-hidden');
            } catch (e) { /* ignore */ }

            renderExistingUsers();

            // 리스트가 보이도록 스크롤
            try {
                const section = document.getElementById('existingUsersSection');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) { /* ignore */ }
        }
        
        // 전체 사용자 목록 (localStorage에서 로드)
        let allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
        
        // 현재 사용자의 기록 데이터
        let trainingHistory = [];
        let gameStats = {};
        
        // 사용자 ID 생성
        function generateUserId(name, gender) {
            const t = selectedAccountType || 'personal';
            return `${t}_${name}_${gender}`;
        }
        
        // 사용자 데이터 로드
        function loadUserData(userId) {
            const userData = allUsers[userId];
            if (userData) {
                trainingHistory = userData.trainingHistory || [];
                gameStats = userData.gameStats || {};
                return true;
            }
            return false;
        }
        
        // 모든 사용자 데이터 마이그레이션 (새 기능 적용)
        function migrateAllUsersData() {
            let updated = false;
            
            Object.keys(allUsers).forEach(userId => {
                const user = allUsers[userId];
                
                // 프로필 마이그레이션
                if (user.profile) {
                    if (!user.profile.id) {
                        user.profile.id = userId;
                        updated = true;
                    }
                    if (!user.profile.difficulty) {
                        user.profile.difficulty = 'normal';
                        updated = true;
                    }
                    // 개인/기관 타입 (기존 사용자는 개인으로 기본값)
                    if (!user.profile.userType) {
                        user.profile.userType = 'personal';
                        updated = true;
                    }
                }
                
                // 배지 시스템 초기화
                if (!user.badgeStats) {
                    user.badgeStats = {
                        totalGames: 0,
                        consecutiveDays: 0,
                        maxSingleScore: 0,
                        hasPerfectAccuracy: false,
                        fastestReaction: 9999,
                        maxMatchLevel: 0,
                        matchConsecutive: 0,
                        maxPatternLevel: 0,
                        maxSequenceLength: 0,
                        calcConsecutive: 0,
                        colorConsecutive: 0,
                        maxSortItems: 0,
                        maxDailyScore: 0,
                        uniqueGamesPlayed: 0,
                        bestTimingAccuracy: 9999,
                        reverseConsecutive: 0,
                        findDiffConsecutive: 0,
                        maxPairingScore: 0,
                        earnedBadges: 0,
                        playedGameTypes: {}
                    };
                    updated = true;
                }
                
                if (!user.earnedBadges) {
                    user.earnedBadges = {};
                    updated = true;
                }
                
                // 기존 기록에서 배지 통계 계산
                if (user.trainingHistory && user.trainingHistory.length > 0) {
                    let totalGames = 0;
                    let maxDailyScore = 0;
                    const playedGameTypes = {};
                    
                    user.trainingHistory.forEach(record => {
                        totalGames += record.gamesPlayed || 0;
                        if (record.totalScore > maxDailyScore) {
                            maxDailyScore = record.totalScore;
                        }
                        if (record.games) {
                            Object.keys(record.games).forEach(game => {
                                playedGameTypes[game] = true;
                            });
                        }
                    });
                    
                    if (totalGames > user.badgeStats.totalGames) {
                        user.badgeStats.totalGames = totalGames;
                        updated = true;
                    }
                    if (maxDailyScore > user.badgeStats.maxDailyScore) {
                        user.badgeStats.maxDailyScore = maxDailyScore;
                        updated = true;
                    }
                    user.badgeStats.playedGameTypes = { ...user.badgeStats.playedGameTypes, ...playedGameTypes };
                    user.badgeStats.uniqueGamesPlayed = Object.keys(user.badgeStats.playedGameTypes).length;
                }
                
                // trainingHistory 초기화
                if (!user.trainingHistory) {
                    user.trainingHistory = [];
                    updated = true;
                }
                
                // gameStats 초기화
                if (!user.gameStats) {
                    user.gameStats = {};
                    updated = true;
                }
                
                // 기존 gameStats에 details 배열 추가
                Object.keys(user.gameStats).forEach(gameKey => {
                    if (!user.gameStats[gameKey].details) {
                        user.gameStats[gameKey].details = [];
                        updated = true;
                    }
                });
            });
            
            if (updated) {
                localStorage.setItem('allUsers', JSON.stringify(allUsers));
                console.log('✅ 모든 사용자 데이터가 최신 버전으로 업데이트되었습니다.');
            }
        }
        
        // 앱 시작 시 마이그레이션 실행
        migrateAllUsersData();
        
        // 사용자 데이터 저장
        function saveUserData() {
            if (!userProfile.id) return;
            
            allUsers[userProfile.id] = {
                profile: { ...userProfile },
                trainingHistory: trainingHistory,
                gameStats: gameStats,
                lastActive: new Date().toISOString()
            };
            
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
        }
        
        // 사용자 삭제
        function deleteUser(userId, event) {
            event.stopPropagation();
            if (confirm('이 사용자의 모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
                delete allUsers[userId];
                localStorage.setItem('allUsers', JSON.stringify(allUsers));
                renderExistingUsers();
            }
        }
        
        // 기존 사용자 목록 렌더링
        function renderExistingUsers() {
            const container = document.getElementById('existingUsersList');
            const userIds = Object.keys(allUsers);
            
            if (userIds.length === 0) {
                container.innerHTML = '<div class="no-data" style="padding:20px;">등록된 사용자가 없습니다.</div>';
                document.getElementById('existingUsersSection').querySelector('h3').style.display = 'none';
                document.getElementById('newUserForm').classList.add('active');
                // 첫 화면에서는 리스트 섹션 자체를 숨김(신규 등록 폼으로 유도)
                try {
                    const section = document.getElementById('existingUsersSection');
                    if (section) section.classList.add('is-hidden');
                } catch (e) { /* ignore */ }
                return;
            }
            
            document.getElementById('existingUsersSection').querySelector('h3').style.display = 'block';
            // 신규 등록 버튼은 상단에 별도로 노출됨(섹션 내부 토글 제거됨)
            
            // 최근 활동순으로 정렬
            const sortedUsers = userIds.map(id => ({
                id,
                ...allUsers[id]
            })).sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));

            // 탭 UI active 상태 동기화(초기 렌더 포함)
            try {
                const strip = document.getElementById('accountTypeStrip');
                if (strip) {
                    strip.querySelectorAll('.account-type-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.getAttribute('data-type') === selectedAccountType);
                    });
                }
            } catch (e) { /* ignore */ }

            // 첫 화면에서는 리스트 숨김 (탭 클릭 이후에만 표시)
            try {
                const section = document.getElementById('existingUsersSection');
                if (section) {
                    section.classList.toggle('is-hidden', !hasOpenedUserList);
                }
            } catch (e) { /* ignore */ }
            if (!hasOpenedUserList) {
                // 리스트는 펼치지 않되, 등록 폼 등 다른 UI는 정상 동작해야 함
                return;
            }

            // 개인/기관 필터
            const filteredUsers = sortedUsers.filter(u => {
                const t = (u.profile && u.profile.userType) ? u.profile.userType : 'personal';
                return t === selectedAccountType;
            });

            if (filteredUsers.length === 0) {
                container.innerHTML = `<div class="no-data" style="padding:20px;">등록된 사용자가 없습니다.</div>`;
                document.getElementById('enterBtn').style.display = 'none';
                return;
            }
            
            const genderIconSvg = (gender) => {
                const g = (gender === 'male') ? 'male' : 'female';
                if (g === 'male') {
                    return `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M14 3h7v7"></path>
                            <path d="M21 3l-7 7"></path>
                            <circle cx="10" cy="14" r="6"></circle>
                        </svg>
                    `;
                }
                return `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="9" r="6"></circle>
                        <path d="M12 15v7"></path>
                        <path d="M9 19h6"></path>
                    </svg>
                `;
            };

            container.innerHTML = filteredUsers.map(user => {
                const profile = user.profile;
                const totalScore = (user.trainingHistory || []).reduce((sum, r) => sum + (r.totalScore || 0), 0);
                const totalGames = (user.trainingHistory || []).reduce((sum, r) => sum + (r.gamesPlayed || 0), 0);
                const isSelected = selectedUserId === user.id;
                
                return `
                    <div class="user-card ${isSelected ? 'selected' : ''}" onclick="selectUser('${user.id}')">
                        <div class="user-card-info">
                            <span class="user-card-icon">${genderIconSvg(profile.gender)}</span>
                            <div class="user-card-details">
                                <div class="user-card-name">${profile.name}</div>
                                <div class="user-card-meta">${getDifficultyName(profile.difficulty)}</div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;">
                            <div class="user-card-stats">
                                <div class="user-card-score">${totalScore}점</div>
                                <div>총 ${totalGames}회</div>
                            </div>
                            <button class="delete-user-btn" onclick="deleteUser('${user.id}', event)" title="삭제">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // 난이도 이름 가져오기
        function getDifficultyName(diff) {
            const names = { very_easy: '매우 쉬움', easy: '쉬움', normal: '보통', hard: '어려움', very_hard: '매우 어려움' };
            return names[diff] || '보통';
        }
        
        // 사용자 선택
        function selectUser(userId) {
            selectedUserId = userId;
            document.querySelectorAll('.user-card').forEach(card => card.classList.remove('selected'));
            event.currentTarget.classList.add('selected');
            document.getElementById('enterBtn').style.display = 'block';
        }
        
        // 선택한 사용자로 입장
        function enterWithSelectedUser() {
            if (!selectedUserId || !allUsers[selectedUserId]) return;
            
            const userData = allUsers[selectedUserId];
            userProfile = { ...userData.profile, id: selectedUserId };
            
            loadUserData(selectedUserId);
            
            // 게임 상태 초기화
            initGameState();
            showMainContent();
        }
        
        // 새 사용자 폼 토글
        function toggleNewUserForm() {
            const form = document.getElementById('newUserForm');
            const section = document.getElementById('existingUsersSection');
            const enterBtn = document.getElementById('enterBtn');
            
            if (form.classList.contains('active')) {
                form.classList.remove('active');
                section.style.display = 'block';
                enterBtn.style.display = selectedUserId ? 'block' : 'none';
            } else {
                form.classList.add('active');
                section.style.display = 'none';
                enterBtn.style.display = 'none';
                // 폼 초기화
                document.getElementById('userName').value = '';
            document.getElementById('userAge').value = '';
                document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
                document.getElementById('registerBtn').disabled = true;
            applyDifficultyFromAge(null);
                userProfile.gender = null;
            }
        }
        
        // 새 사용자 등록
        function registerNewUser() {
            const name = document.getElementById('userName').value.trim();
            const age = parseInt(document.getElementById('userAge').value, 10);
            
            if (!name || !userProfile.gender || !Number.isInteger(age) || age < 1 || age > 120) return;
            
            const userId = generateUserId(name, userProfile.gender);
            
            // 중복 체크
            if (allUsers[userId]) {
                alert('동일한 정보의 사용자가 이미 존재합니다. 기존 사용자를 선택해주세요.');
                toggleNewUserForm();
                renderExistingUsers();
                return;
            }
            
            // 난이도 설정
            const selectedDiff = regDifficultyChoice;
            
            userProfile = {
                id: userId,
                name: name,
                age: age,
                gender: userProfile.gender,
                difficulty: selectedDiff,
                userType: selectedAccountType || 'personal'
            };
            
            // 새 사용자 데이터 초기화
            trainingHistory = [];
            gameStats = {};
            
            // 저장
            saveUserData();
            
            // 게임 상태 초기화
            initGameState();
            showMainContent();
        }
        
        // 게임 상태 초기화
        function initGameState() {
            const today = new Date().toDateString();
            const lastDate = localStorage.getItem('lastDate_' + userProfile.id);
            
            if (lastDate !== today) {
                gameState.gamesPlayed = 0;
                gameState.correctAnswers = 0;
                gameState.totalAnswers = 0;
                gameState.trainTime = 0;
                gameState.todayScore = 0;
            } else {
                // 오늘 기록 불러오기
                const todayRecord = trainingHistory.find(r => r.date === new Date().toISOString().split('T')[0]);
                if (todayRecord) {
                    gameState.gamesPlayed = todayRecord.gamesPlayed || 0;
                    gameState.correctAnswers = todayRecord.correctAnswers || 0;
                    gameState.totalAnswers = todayRecord.totalAnswers || 0;
                    gameState.todayScore = todayRecord.totalScore || 0;
                }
            }
            
            // 배지 데이터 로드 및 기존 기록으로 배지 체크
            loadBadgeData();
            checkAndAwardBadges(); // 기존 사용자도 새 배지 획득 가능
            
            // 최고 점수 계산
            gameState.highScore = trainingHistory.reduce((max, r) => Math.max(max, r.totalScore || 0), 0);
        }
        
        // 배지 시스템 - 20개의 달성 배지
        const badgeDefinitions = [
            { id: 'first_step', icon: '🌟', name: '첫 걸음', desc: '첫 번째 게임을 완료하세요', condition: (s) => s.totalGames >= 1 },
            { id: 'triple_streak', icon: '🔥', name: '3일 연속', desc: '3일 연속으로 훈련하세요', condition: (s) => s.consecutiveDays >= 3 },
            { id: 'score_100', icon: '💯', name: '100점 달성', desc: '한 게임에서 100점 이상 획득', condition: (s) => s.maxSingleScore >= 100 },
            { id: 'perfect_accuracy', icon: '🎯', name: '완벽한 정확도', desc: '게임에서 정확도 100% 달성', condition: (s) => s.hasPerfectAccuracy },
            { id: 'lightning_fast', icon: '⚡', name: '번개 반응', desc: '반응속도 게임에서 300ms 이하 달성', condition: (s) => s.fastestReaction <= 300 && s.fastestReaction > 0 },
            { id: 'pattern_master', icon: '🧠', name: '패턴 마스터', desc: '패턴 기억 레벨 5 이상 달성', condition: (s) => s.maxPatternLevel >= 5 },
            { id: 'number_genius', icon: '🔢', name: '숫자 천재', desc: '숫자 기억 5자리 이상 성공', condition: (s) => s.maxSequenceLength >= 5 },
            { id: 'calc_king', icon: '➕', name: '암산왕', desc: '암산 게임에서 10문제 연속 정답', condition: (s) => s.calcConsecutive >= 10 },
            { id: 'color_expert', icon: '🎨', name: '색상 달인', desc: '색상 맞추기 10문제 연속 정답', condition: (s) => s.colorConsecutive >= 10 },
            { id: 'sort_master', icon: '📊', name: '정렬 마스터', desc: '순서 정렬 6개 이상 정렬 성공', condition: (s) => s.maxSortItems >= 6 },
            { id: 'game_lover', icon: '🎮', name: '게임 마니아', desc: '총 50게임 플레이', condition: (s) => s.totalGames >= 50 },
            { id: 'week_challenge', icon: '📅', name: '일주일 도전', desc: '7일 연속으로 훈련하세요', condition: (s) => s.consecutiveDays >= 7 },
            { id: 'high_scorer', icon: '🏅', name: '고득점자', desc: '하루 총점 500점 이상 달성', condition: (s) => s.maxDailyScore >= 500 },
            { id: 'all_rounder', icon: '🌈', name: '다재다능', desc: '모든 종류의 게임을 1회 이상 플레이', condition: (s) => s.uniqueGamesPlayed >= 14 },
            { id: 'persistent', icon: '💪', name: '꾸준함의 미덕', desc: '총 100게임 플레이', condition: (s) => s.totalGames >= 100 },
            { id: 'time_master', icon: '⏱️', name: '시간 마스터', desc: '시간 맞추기 오차 0.2초 이내', condition: (s) => s.bestTimingAccuracy <= 0.2 && s.bestTimingAccuracy >= 0 },
            { id: 'reverse_genius', icon: '🔄', name: '역발상 천재', desc: '거꾸로 말하기 5문제 연속 정답', condition: (s) => s.reverseConsecutive >= 5 },
            { id: 'eagle_eye', icon: '👀', name: '관찰력 달인', desc: '다른 것 찾기 5문제 연속 정답', condition: (s) => s.findDiffConsecutive >= 5 },
            { id: 'connector', icon: '🔗', name: '연결고리', desc: '짝 연결 게임 80점 이상 달성', condition: (s) => s.maxPairingScore >= 80 },
            { id: 'grand_master', icon: '👑', name: '그랜드 마스터', desc: '19개의 다른 배지를 모두 획득', condition: (s) => s.earnedBadges >= 19 }
        ];
        
        // 배지 관련 통계 초기화
        let badgeStats = {
            totalGames: 0,
            consecutiveDays: 0,
            maxSingleScore: 0,
            hasPerfectAccuracy: false,
            fastestReaction: 9999,
            maxMatchLevel: 0,
            matchConsecutive: 0,
            maxPatternLevel: 0,
            maxSequenceLength: 0,
            calcConsecutive: 0,
            colorConsecutive: 0,
            maxSortItems: 0,
            maxDailyScore: 0,
            uniqueGamesPlayed: 0,
            bestTimingAccuracy: 9999,
            reverseConsecutive: 0,
            findDiffConsecutive: 0,
            maxPairingScore: 0,
            earnedBadges: 0,
            playedGameTypes: {}
        };
        
        // 획득한 배지 목록
        let earnedBadges = {};
        
        // 배지 데이터 로드
        function loadBadgeData() {
            if (allUsers[userProfile.id]) {
                badgeStats = allUsers[userProfile.id].badgeStats || { ...badgeStats };
                earnedBadges = allUsers[userProfile.id].earnedBadges || {};
            }
        }
        
        // 배지 데이터 저장
        function saveBadgeData() {
            if (!userProfile.id) return;
            if (!allUsers[userProfile.id]) {
                allUsers[userProfile.id] = {};
            }
            allUsers[userProfile.id].badgeStats = badgeStats;
            allUsers[userProfile.id].earnedBadges = earnedBadges;
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
        }
        
        // 배지 체크 및 수여
        function checkAndAwardBadges() {
            const newBadges = [];
            
            // earnedBadges 개수 업데이트
            badgeStats.earnedBadges = Object.keys(earnedBadges).length;
            
            badgeDefinitions.forEach(badge => {
                if (!earnedBadges[badge.id] && badge.condition(badgeStats)) {
                    earnedBadges[badge.id] = {
                        earnedAt: new Date().toISOString()
                    };
                    newBadges.push(badge);
                }
            });
            
            // earnedBadges 개수 다시 업데이트
            badgeStats.earnedBadges = Object.keys(earnedBadges).length;
            
            if (newBadges.length > 0) {
                saveBadgeData();
                // 새 배지 알림(팝업)은 "게임 플레이 중"에만 표시
                const allowPopup = (typeof window !== 'undefined') && (window.__allowBadgeUnlockPopup === true);
                if (allowPopup) {
                    showBadgeUnlocks(newBadges, 0);
                }
            }
        }
        
        // 새 배지 알림 표시
        function showBadgeUnlocks(badges, index) {
            const allowPopup = (typeof window !== 'undefined') && (window.__allowBadgeUnlockPopup === true);
            if (!allowPopup) return;
            if (index >= badges.length) return;
            
            const badge = badges[index];
            document.getElementById('unlockBadgeIcon').textContent = badge.icon;
            document.getElementById('unlockBadgeName').textContent = badge.name;
            document.getElementById('unlockBadgeDesc').textContent = badge.desc;
            document.getElementById('badgeUnlockOverlay').classList.add('active');
            
            // 효과음
            playApplause();
            
            // 다음 배지를 위한 인덱스 저장
            document.getElementById('badgeUnlockOverlay').dataset.nextIndex = index + 1;
            document.getElementById('badgeUnlockOverlay').dataset.badges = JSON.stringify(badges);
        }
        
        // 배지 알림 닫기
        function closeBadgeUnlock() {
            const overlay = document.getElementById('badgeUnlockOverlay');
            overlay.classList.remove('active');
            
            // 다음 배지가 있으면 표시
            const nextIndex = parseInt(overlay.dataset.nextIndex || '0');
            const badges = JSON.parse(overlay.dataset.badges || '[]');
            
            if (nextIndex < badges.length) {
                setTimeout(() => showBadgeUnlocks(badges, nextIndex), 300);
            }
        }
        
        // 배지 모달 열기
        function showBadgeModal() {
            renderBadgeGrid();
            document.getElementById('badgeModal').classList.add('active');
        }
        
        // 배지 모달 닫기
        function closeBadgeModal() {
            document.getElementById('badgeModal').classList.remove('active');
        }
