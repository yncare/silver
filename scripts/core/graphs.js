// ==================== 그래프 기능 ====================
        const gameNames = {
            match: '짝 맞추기', sequence: '숫자 기억', calc: '암산 훈련', color: '색상 맞추기',
            pattern: '패턴 기억', reaction: '반응 속도', findDiff: '다른 것 찾기', sorting: '순서 정렬',
            direction: '방향 맞추기', word: '단어 완성', counting: '개수 세기', pairing: '짝 연결',
            timing: '시간 맞추기', reverse: '거꾸로 말하기', category: '분류하기', story: '이야기 순서',
            maze: '미로 탈출', melody: '멜로디 기억', puzzle: '퍼즐 맞추기', treasure: '보물 찾기',
            shadow: '그림자 매칭', focus: '집중 타겟', palace: '기억의 방', rotate: '도형 회전', chain: '연쇄 반응'
        };
        
        function showStatsGraph() {
            document.getElementById('graphModal').classList.add('active');
            document.getElementById('graphUserName').textContent = userProfile.name;
            showGraphTab('score');
            updateSummaryStats();
        }
        
        function closeStatsGraph() {
            document.getElementById('graphModal').classList.remove('active');
        }
        
        function showGraphTab(tab) {
            document.querySelectorAll('.graph-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            
            document.getElementById('scoreGraph').style.display = 'none';
            document.getElementById('accuracyGraph').style.display = 'none';
            document.getElementById('gamesGraph').style.display = 'none';
            document.getElementById('historyList').style.display = 'none';
            
            switch(tab) {
                case 'score':
                    document.getElementById('scoreGraph').style.display = 'block';
                    renderScoreChart();
                    break;
                case 'accuracy':
                    document.getElementById('accuracyGraph').style.display = 'block';
                    renderAccuracyChart();
                    break;
                case 'games':
                    document.getElementById('gamesGraph').style.display = 'block';
                    renderGamesChart();
                    break;
                case 'history':
                    document.getElementById('historyList').style.display = 'block';
                    renderHistoryList();
                    break;
            }
        }
        
        function renderScoreChart() {
            const chart = document.getElementById('scoreBarChart');
            const last7Days = getLast7Days();
            
            if (last7Days.length === 0) {
                chart.innerHTML = '<div class="no-data">아직 기록이 없습니다.</div>';
                return;
            }
            
            const maxScore = Math.max(...last7Days.map(d => d.totalScore), 1);
            
            chart.innerHTML = last7Days.map(day => {
                const height = (day.totalScore / maxScore) * 160;
                const dateStr = new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                return `
                    <div class="bar-item">
                        <div class="bar-value">${day.totalScore}</div>
                        <div class="bar" style="height: ${height}px; background: linear-gradient(180deg, #FF6F00 0%, #FFA000 100%);"></div>
                        <div class="bar-label">${dateStr}</div>
                    </div>
                `;
            }).join('');
        }
        
        function renderAccuracyChart() {
            const chart = document.getElementById('accuracyBarChart');
            const last7Days = getLast7Days();
            
            if (last7Days.length === 0) {
                chart.innerHTML = '<div class="no-data">아직 기록이 없습니다.</div>';
                return;
            }
            
            chart.innerHTML = last7Days.map(day => {
                const accuracy = day.totalAnswers > 0 ? Math.round((day.correctAnswers / day.totalAnswers) * 100) : 0;
                const height = accuracy * 1.6;
                const dateStr = new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                const color = accuracy >= 80 ? '#43A047' : accuracy >= 60 ? '#FFA000' : '#E53935';
                return `
                    <div class="bar-item">
                        <div class="bar-value">${accuracy}%</div>
                        <div class="bar" style="height: ${height}px; background: ${color};"></div>
                        <div class="bar-label">${dateStr}</div>
                    </div>
                `;
            }).join('');
        }
        
        function renderGamesChart() {
            const chart = document.getElementById('gamesBarChart');
            
            const gamesArray = Object.entries(gameStats).map(([key, val]) => ({
                key: key,
                name: gameNames[key] || key,
                count: val.count
            })).sort((a, b) => b.count - a.count).slice(0, 7);
            
            if (gamesArray.length === 0) {
                chart.innerHTML = '<div class="no-data">아직 기록이 없습니다.</div>';
                document.getElementById('gameDetailSelect').innerHTML = '<option value="">-- 기록 없음 --</option>';
                return;
            }
            
            const maxCount = Math.max(...gamesArray.map(g => g.count), 1);
            const colors = ['#2E7D32', '#1565C0', '#7B1FA2', '#C62828', '#EF6C00', '#00838F', '#558B2F'];
            
            chart.innerHTML = gamesArray.map((game, i) => {
                const height = (game.count / maxCount) * 160;
                return `
                    <div class="bar-item">
                        <div class="bar-value">${game.count}</div>
                        <div class="bar" style="height: ${height}px; background: ${colors[i % colors.length]};"></div>
                        <div class="bar-label">${game.name}</div>
                    </div>
                `;
            }).join('');
            
            // 게임 선택 드롭다운 업데이트
            const select = document.getElementById('gameDetailSelect');
            const allGames = Object.entries(gameStats).map(([key, val]) => ({
                key: key,
                name: gameNames[key] || key,
                count: val.count
            })).filter(g => g.count > 0).sort((a, b) => b.count - a.count);
            
            select.innerHTML = '<option value="">-- 게임 선택 --</option>' + 
                allGames.map(g => `<option value="${g.key}">${g.name} (${g.count}회)</option>`).join('');
            
            document.getElementById('gameDetailHistory').innerHTML = '';
        }
        
        function showGameDetailHistory() {
            const select = document.getElementById('gameDetailSelect');
            const gameKey = select.value;
            const container = document.getElementById('gameDetailHistory');
            
            if (!gameKey || !gameStats[gameKey]) {
                container.innerHTML = '';
                return;
            }
            
            const details = gameStats[gameKey].details || [];
            
            if (details.length === 0) {
                container.innerHTML = '<div class="no-data">상세 기록이 없습니다.</div>';
                return;
            }
            
            const gameName = gameNames[gameKey] || gameKey;
            container.innerHTML = `<div class="chart-title" style="margin-bottom:10px;">📋 ${gameName} 최근 기록</div>` +
                details.slice(0, 20).map(record => {
                    const date = new Date(record.date);
                    const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    
                    // 게임별 상세 정보
                    let extraInfo = '';
                    if (gameKey === 'match') {
                        if (record.level) extraInfo += `<span>🎯 레벨 <strong>${record.level}</strong></span>`;
                        if (record.consecutive) extraInfo += `<span>🔥 연속 <strong>${record.consecutive}</strong>회</span>`;
                    } else if (gameKey === 'sequence') {
                        if (record.sequenceLength) extraInfo += `<span>🔢 숫자 <strong>${record.sequenceLength}</strong>자리</span>`;
                    } else if (gameKey === 'pattern') {
                        if (record.patternLevel) extraInfo += `<span>🔷 레벨 <strong>${record.patternLevel}</strong></span>`;
                    } else if (gameKey === 'reaction') {
                        if (record.reactionTime) extraInfo += `<span>⚡ 반응 <strong>${record.reactionTime}ms</strong></span>`;
                    }
                    
                    if (record.accuracy !== undefined) {
                        extraInfo += `<span>✅ 정확도 <strong>${record.accuracy}%</strong></span>`;
                    }
                    
                    return `
                        <div class="detail-record">
                            <div class="detail-info">
                                <div class="detail-date">${dateStr}</div>
                                <div class="detail-stats">${extraInfo || '<span>기록됨</span>'}</div>
                            </div>
                            <div class="detail-score">${record.score}점</div>
                        </div>
                    `;
                }).join('');
        }
        
        function renderHistoryList() {
            const list = document.getElementById('historyListContent');
            
            if (trainingHistory.length === 0) {
                list.innerHTML = '<div class="no-data">아직 기록이 없습니다.</div>';
                return;
            }
            
            const sorted = [...trainingHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            list.innerHTML = sorted.map(record => {
                const accuracy = record.totalAnswers > 0 ? Math.round((record.correctAnswers / record.totalAnswers) * 100) : 0;
                const dateStr = new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
                return `
                    <div class="history-item">
                        <div>
                            <div class="history-date">${dateStr}</div>
                            <div class="history-details">게임 ${record.gamesPlayed}회 | 정확도 ${accuracy}%</div>
                        </div>
                        <div class="history-score">${record.totalScore}점</div>
                    </div>
                `;
            }).join('');
        }
        
        function getLast7Days() {
            const today = new Date();
            const days = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const record = trainingHistory.find(r => r.date === dateStr);
                
                if (record) {
                    days.push(record);
                } else {
                    days.push({
                        date: dateStr,
                        totalScore: 0,
                        gamesPlayed: 0,
                        correctAnswers: 0,
                        totalAnswers: 0
                    });
                }
            }
            
            return days;
        }
        
        function updateSummaryStats() {
            const totalDays = trainingHistory.length;
            const totalGames = trainingHistory.reduce((sum, r) => sum + r.gamesPlayed, 0);
            const totalScore = trainingHistory.reduce((sum, r) => sum + r.totalScore, 0);
            const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
            
            const totalCorrect = trainingHistory.reduce((sum, r) => sum + r.correctAnswers, 0);
            const totalAnswers = trainingHistory.reduce((sum, r) => sum + r.totalAnswers, 0);
            const avgAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
            
            document.getElementById('totalDays').textContent = totalDays;
            document.getElementById('totalGamesPlayed').textContent = totalGames;
            document.getElementById('avgScore').textContent = avgScore;
            document.getElementById('avgAccuracy').textContent = avgAccuracy + '%';
        }
