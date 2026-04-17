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
            document.querySelectorAll('.graph-tab').forEach(t => {
                t.classList.toggle('active', t.getAttribute('data-tab') === tab);
            });

            const panelIds = ['scoreGraph', 'accuracyGraph', 'gamesGraph', 'historyList', 'reportGraph'];
            panelIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            const map = {
                score: 'scoreGraph',
                accuracy: 'accuracyGraph',
                games: 'gamesGraph',
                history: 'historyList',
                report: 'reportGraph'
            };
            const showId = map[tab];
            if (showId) {
                const el = document.getElementById(showId);
                if (el) el.style.display = 'block';
            }

            switch (tab) {
                case 'score':
                    renderScoreChart();
                    break;
                case 'accuracy':
                    renderAccuracyChart();
                    break;
                case 'games':
                    renderGamesChart();
                    break;
                case 'history':
                    renderHistoryList();
                    break;
                case 'report':
                    renderTrainingReport();
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

        /** 메인 메뉴 4분류 — 카테고리 리포트용 */
        const TRAINING_CATEGORY_META = [
            { id: 'memory', label: '기억력 훈련', games: ['match', 'sequence', 'pattern', 'melody', 'palace', 'treasure'] },
            { id: 'calcLang', label: '계산/언어 훈련', games: ['calc', 'counting', 'word', 'reverse', 'story', 'category'] },
            { id: 'focusReaction', label: '집중/반응 훈련', games: ['reaction', 'findDiff', 'timing', 'focus', 'chain', 'color'] },
            { id: 'spatial', label: '공간/지각 훈련', games: ['direction', 'maze', 'rotate', 'shadow', 'sorting', 'pairing'] }
        ];

        const CATEGORY_IMPROVE_HINTS = {
            memory: '기억·패턴·멜로디·기억의 방·보물찾기 등을 번갈아 가며 꾸준히 플레이하면 좋습니다.',
            calcLang: '암산·낱말·이야기 순서·분류 등을 생활 속 숫자·글자와 연결해 보세요.',
            focusReaction: '신호등·다른 그림 찾기·시간 맞추기·집중 타겟 등으로 반응과 집중을 나눠 연습해 보세요.',
            spatial: '방향·미로·도형 회전·그림자·순서 누르기·짝 연결을 규칙적으로 섞어 보세요.'
        };

        function escapeHtml(str) {
            if (str == null) return '';
            const d = document.createElement('div');
            d.textContent = String(str);
            return d.innerHTML;
        }

        function getCategoryAggregates() {
            return TRAINING_CATEGORY_META.map(cat => {
                let plays = 0;
                let scoreSum = 0;
                let accSum = 0;
                let accN = 0;
                const gameRows = [];
                cat.games.forEach(gid => {
                    const s = gameStats[gid];
                    const name = gameNames[gid] || gid;
                    if (!s || !s.count) {
                        gameRows.push({ gid, name, plays: 0, avgScore: 0, avgAcc: null });
                        return;
                    }
                    const c = s.count || 0;
                    const ts = s.totalScore || 0;
                    plays += c;
                    scoreSum += ts;
                    let gAcc = 0;
                    let gAccN = 0;
                    (s.details || []).forEach(d => {
                        if (d && d.accuracy != null && !Number.isNaN(Number(d.accuracy))) {
                            gAcc += Number(d.accuracy);
                            gAccN++;
                            accSum += Number(d.accuracy);
                            accN++;
                        }
                    });
                    const avgScoreG = c > 0 ? Math.round(ts / c) : 0;
                    const avgAccG = gAccN > 0 ? Math.round(gAcc / gAccN) : null;
                    gameRows.push({ gid, name, plays: c, avgScore: avgScoreG, avgAcc: avgAccG });
                });
                const avgScore = plays > 0 ? Math.round(scoreSum / plays) : 0;
                const avgAccuracy = accN > 0 ? Math.round(accSum / accN) : null;
                return {
                    ...cat,
                    plays,
                    totalScore: scoreSum,
                    avgScore,
                    avgAccuracy,
                    gameRows
                };
            });
        }

        function renderTrainingReport() {
            const body = document.getElementById('trainingReportBody');
            if (!body) return;

            const name = escapeHtml(userProfile && userProfile.name ? userProfile.name : '사용자');
            const generated = new Date().toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' });
            const cats = getCategoryAggregates();
            const totalPlays = cats.reduce((a, c) => a + c.plays, 0);

            if (totalPlays === 0) {
                body.innerHTML = `
                    <div class="training-report-header">
                        <h3 class="training-report-title">📄 훈련 카테고리 리포트</h3>
                        <p class="training-report-meta">${name}님 · ${escapeHtml(generated)}</p>
                    </div>
                    <p class="training-report-lead">아직 플레이 기록이 없습니다. 게임을 진행한 뒤 다시 열어 주세요.</p>
                `;
                return;
            }

            const tableRows = cats.map(c => {
                const accCell = c.avgAccuracy != null ? `${c.avgAccuracy}%` : '—';
                return `<tr>
                    <td><strong style="color:${c.id === 'memory' ? '#2E7D32' : c.id === 'calcLang' ? '#1565C0' : c.id === 'focusReaction' ? '#E65100' : '#7B1FA2'}">${escapeHtml(c.label)}</strong></td>
                    <td style="text-align:right">${c.plays}</td>
                    <td style="text-align:right">${c.totalScore}</td>
                    <td style="text-align:right">${c.avgScore}</td>
                    <td style="text-align:center">${accCell}</td>
                </tr>`;
            }).join('');

            const gameDetailRows = cats.map(c => {
                return c.gameRows
                    .filter(g => g.plays > 0)
                    .sort((a, b) => b.plays - a.plays)
                    .map(g => `<tr>
                        <td>${escapeHtml(c.label)}</td>
                        <td>${escapeHtml(g.name)}</td>
                        <td style="text-align:right">${g.plays}</td>
                        <td style="text-align:right">${g.avgScore}</td>
                        <td style="text-align:center">${g.avgAcc != null ? g.avgAcc + '%' : '—'}</td>
                    </tr>`).join('');
            }).join('');
            const gameDetailBody = gameDetailRows.trim()
                ? gameDetailRows
                : '<tr><td colspan="5">카테고리별 플레이한 게임이 없습니다.</td></tr>';

            const sortedByPlays = [...cats].sort((a, b) => b.plays - a.plays);
            const top = sortedByPlays[0];
            const second = sortedByPlays[1];
            const zeroCats = cats.filter(c => c.plays === 0);
            const lowCats = sortedByPlays.filter(c => c.plays > 0 && c.plays <= Math.max(1, Math.floor(totalPlays / 8)));

            let strengthsHtml = '<ul class="training-report-list">';
            if (top && top.plays > 0) {
                strengthsHtml += `<li><strong>${escapeHtml(top.label)}</strong> 영역을 가장 많이 연습하셨습니다. (총 <strong>${top.plays}</strong>회, 평균 점수 <strong>${top.avgScore}</strong>점)</li>`;
            }
            if (second && second.plays > 0 && second.id !== top.id) {
                strengthsHtml += `<li><strong>${escapeHtml(second.label)}</strong>에서도 꾸준한 참여가 있었습니다. (${second.plays}회)</li>`;
            }
            const bestAcc = cats.filter(c => c.avgAccuracy != null).sort((a, b) => b.avgAccuracy - a.avgAccuracy)[0];
            if (bestAcc && bestAcc.avgAccuracy >= 60) {
                strengthsHtml += `<li>평균 정확도가 높은 영역: <strong>${escapeHtml(bestAcc.label)}</strong> (${bestAcc.avgAccuracy}%)</li>`;
            }
            strengthsHtml += '</ul>';

            const weakItems = [];
            if (zeroCats.length > 0) {
                weakItems.push(`아직 한 번도 플레이하지 않은 카테고리: <strong>${zeroCats.map(z => escapeHtml(z.label)).join(', ')}</strong>`);
            }
            if (lowCats.length > 0 && totalPlays >= 8) {
                weakItems.push(`상대적으로 플레이 횟수가 적은 영역: ${lowCats.map(z => `<strong>${escapeHtml(z.label)}</strong> (${z.plays}회)`).join(', ')}`);
            }
            if (totalPlays < 8) {
                weakItems.push('데이터가 더 쌓이면 상대적인 약점 영역이 명확해집니다. 지금은 균형 있게 다양한 게임을 권장합니다.');
            }
            if (weakItems.length === 0) {
                weakItems.push('뚜렷한 약점 패턴은 없습니다. 네 카테고리를 골고루 유지해 보세요.');
            }
            const weakHtml = `<ul class="training-report-list">${weakItems.map(w => `<li>${w}</li>`).join('')}</ul>`;

            const improveItems = [];
            cats.forEach(c => {
                if (c.plays === 0) {
                    improveItems.push(`<li><strong>${escapeHtml(c.label)}</strong>: ${CATEGORY_IMPROVE_HINTS[c.id] || '해당 영역의 게임을 주 2~3회 이상 나누어 시도해 보세요.'}</li>`);
                } else if ((totalPlays >= 8 && lowCats.some(l => l.id === c.id)) || (c.avgAccuracy != null && c.avgAccuracy < 55)) {
                    improveItems.push(`<li><strong>${escapeHtml(c.label)}</strong>: ${CATEGORY_IMPROVE_HINTS[c.id] || '난이도를 한 단계 낮추거나 짧은 세션으로 반복해 보세요.'}</li>`);
                }
            });
            if (improveItems.length === 0) {
                improveItems.push('<li>네 카테고리 모두에서 활동이 있습니다. 주간 목표를 정해 균형을 유지해 보세요.</li>');
            }
            const improveHtml = `<ul class="training-report-list">${improveItems.join('')}</ul>`;

            body.innerHTML = `
                <div class="training-report-header">
                    <h3 class="training-report-title">📄 훈련 카테고리 리포트</h3>
                    <p class="training-report-meta">${name}님 · 작성 시각 ${escapeHtml(generated)}</p>
                    <p class="training-report-lead">게임 수행 기록을 카테고리별로 요약했습니다. 장점·개선사항·권장 활동은 자동 요약이며, 인쇄하여 보관하거나 상담 시 활용할 수 있습니다.</p>
                </div>

                <h4 class="training-report-section-title">1. 카테고리 요약 표</h4>
                <div class="training-report-table-wrap">
                    <table class="training-report-table">
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>플레이 횟수</th>
                                <th>누적 점수</th>
                                <th>회당 평균 점수</th>
                                <th>평균 정확도(기록 있는 경우)</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>

                <h4 class="training-report-section-title">2. 게임별 상세 (플레이한 항목만)</h4>
                <div class="training-report-table-wrap">
                    <table class="training-report-table training-report-table--compact">
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>게임</th>
                                <th>횟수</th>
                                <th>회당 평균 점수</th>
                                <th>평균 정확도</th>
                            </tr>
                        </thead>
                        <tbody>${gameDetailBody}</tbody>
                    </table>
                </div>

                <h4 class="training-report-section-title">3. 장점</h4>
                ${strengthsHtml}

                <h4 class="training-report-section-title">4. 개선사항</h4>
                ${weakHtml}

                <h4 class="training-report-section-title">5. 기타 권장 활동</h4>
                ${improveHtml}

                <p class="training-report-footnote">※ 본 리포트는 앱에 저장된 플레이 통계를 바탕으로 자동 생성되었습니다.</p>
            `;
        }

        function printTrainingReport() {
            const node = document.getElementById('trainingReportPrint');
            if (!node) return;

            const cssLink = document.querySelector('link[rel="stylesheet"][href*="app.css"]');
            const cssHref = cssLink ? cssLink.getAttribute('href') : 'styles/app.css?v=1558f54';

            const w = window.open('', '_blank', 'noopener,noreferrer');
            if (!w) {
                alert('인쇄용 창을 열 수 없습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해 주세요.');
                return;
            }

            const safeHref = String(cssHref).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            const html = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<title>훈련 카테고리 리포트</title>' +
                '<link rel="stylesheet" href="' + safeHref + '">' +
                '<style>body{margin:0;padding:16px;background:#fff;color:#111;font-family:system-ui,\"Malgun Gothic\",sans-serif}' +
                '@media print{@page{margin:12mm}body{padding:0}}</style></head><body>' +
                node.outerHTML +
                '</body></html>';

            w.document.open();
            w.document.write(html);
            w.document.close();

            const runPrint = () => {
                try {
                    w.focus();
                    w.print();
                } finally {
                    setTimeout(() => {
                        try { w.close(); } catch (e) { /* ignore */ }
                    }, 400);
                }
            };

            if (w.document.readyState === 'complete') {
                setTimeout(runPrint, 150);
            } else {
                w.onload = () => setTimeout(runPrint, 150);
            }
        }

        window.printTrainingReport = printTrainingReport;