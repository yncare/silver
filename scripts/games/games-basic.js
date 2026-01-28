// ==================== 0. 동물/식물 짝맞추기 ====================
        const animalEmojis = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔'];
        const plantEmojis = ['🌸','🌺','🌻','🌹','🌷','🌼','🌿','🍀','🌵','🌴','🌲','🎋','🌾','🍁','🍂','🌳'];
        
        let matchCards = [];
        let matchFlipped = [];
        let matchPairs = 0;
        let matchTries = 0;
        let matchScore = 0;
        let matchLevel = 1;
        let matchCanFlip = true;
        let matchTotalPairs = 4;
        let matchStage = 'animal'; // animal, plant, mixed
        let matchConsecutive = 0;
        let matchMaxConsecutive = 0;
        
        function initMatchGame() {
            matchLevel = 1;
            matchScore = 0;
            matchTries = 0;
            matchPairs = 0;
            matchFlipped = [];
            matchCanFlip = true;
            matchConsecutive = 0;
            matchMaxConsecutive = 0;
            
            document.getElementById('matchLevel').textContent = '1';
            document.getElementById('matchScore').textContent = '0';
            document.getElementById('matchTries').textContent = '0';
            document.getElementById('matchMatches').textContent = '0';
            document.getElementById('matchGrid').innerHTML = '';
            document.getElementById('matchStartBtn').style.display = 'inline-block';
            document.getElementById('stageButtons').style.display = 'flex';
            
            updateMatchStageDisplay();
        }
        
        function selectMatchStage(stage) {
            matchStage = stage;
            document.querySelectorAll('.stage-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.stage-btn.${stage}`).classList.add('active');
            updateMatchStageDisplay();
        }
        
        function updateMatchStageDisplay() {
            const stageNames = { animal: '🐾 동물', plant: '🌿 식물', mixed: '🎨 혼합' };
            document.getElementById('matchStage').textContent = stageNames[matchStage];
        }
        
        function startMatchGame() {
            document.getElementById('matchStartBtn').style.display = 'none';
            document.getElementById('stageButtons').style.display = 'none';
            generateMatchLevel();
        }
        
        function generateMatchLevel() {
            // 난이도에 따른 카드 수 설정
            const settings = difficultySettings[userProfile.difficulty].match;
            const basePairs = settings.basePairs;
            matchTotalPairs = Math.min(basePairs + matchLevel - 1, 10);
            
            // 단계에 따른 이모지 선택
            let selectedEmojis;
            if (matchStage === 'animal') {
                selectedEmojis = shuffleArray([...animalEmojis]).slice(0, matchTotalPairs);
            } else if (matchStage === 'plant') {
                selectedEmojis = shuffleArray([...plantEmojis]).slice(0, matchTotalPairs);
            } else {
                // 혼합: 동물과 식물 반반
                const halfPairs = Math.ceil(matchTotalPairs / 2);
                const animals = shuffleArray([...animalEmojis]).slice(0, halfPairs);
                const plants = shuffleArray([...plantEmojis]).slice(0, matchTotalPairs - halfPairs);
                selectedEmojis = shuffleArray([...animals, ...plants]);
            }
            
            matchCards = shuffleArray([...selectedEmojis, ...selectedEmojis]);
            matchPairs = 0;
            matchFlipped = [];
            matchCanFlip = true;
            
            document.getElementById('matchLevel').textContent = matchLevel;
            document.getElementById('matchMatches').textContent = '0';
            document.getElementById('matchTotal').textContent = matchTotalPairs;
            
            // 그리드 클래스 결정
            let gridClass = 'grid-2x4';
            if (matchTotalPairs <= 4) gridClass = 'grid-2x4';
            else if (matchTotalPairs <= 6) gridClass = 'grid-3x4';
            else if (matchTotalPairs <= 8) gridClass = 'grid-4x4';
            else gridClass = 'grid-4x5';
            
            const grid = document.getElementById('matchGrid');
            grid.className = 'match-grid ' + gridClass;
            
            // 카드 테마 클래스
            const themeClass = matchStage + '-theme';
            
            let cardsHTML = '';
            matchCards.forEach((emoji, index) => {
                cardsHTML += `
                    <div class="match-card ${themeClass}" data-index="${index}" onclick="flipMatchCard(${index}, this)">
                        <span class="card-back">❓</span>
                        <span class="card-front">${emoji}</span>
                    </div>
                `;
            });
            grid.innerHTML = cardsHTML;
        }
        
        function flipMatchCard(index, cardElement) {
            if (!matchCanFlip) return;
            if (cardElement.classList.contains('flipped')) return;
            if (cardElement.classList.contains('matched')) return;
            if (matchFlipped.length === 1 && matchFlipped[0].index === index) return;
            
            cardElement.classList.add('flipped');
            matchFlipped.push({
                index: index,
                element: cardElement,
                emoji: matchCards[index]
            });
            
            if (matchFlipped.length === 2) {
                matchCanFlip = false;
                matchTries++;
                document.getElementById('matchTries').textContent = matchTries;
                gameState.totalAnswers++;
                
                const first = matchFlipped[0];
                const second = matchFlipped[1];
                
                if (first.emoji === second.emoji) {
                    // 매칭 성공
                    matchPairs++;
                    matchConsecutive++;
                    if (matchConsecutive > matchMaxConsecutive) matchMaxConsecutive = matchConsecutive;
                    gameState.correctAnswers++;
                    document.getElementById('matchMatches').textContent = matchPairs;
                    
                    const pts = 10 + matchLevel * 2;
                    matchScore += pts;
                    document.getElementById('matchScore').textContent = matchScore;
                    
                    playCorrectSound();
                    
                    setTimeout(() => {
                        first.element.classList.add('matched');
                        second.element.classList.add('matched');
                        matchFlipped = [];
                        matchCanFlip = true;
                        
                        // 레벨 클리어 체크
                        if (matchPairs === matchTotalPairs) {
                            matchLevel++;
                            if (matchLevel > 5) {
                                // 게임 완료
                                currentGameData = { 
                                    consecutive: matchMaxConsecutive,
                                    level: matchLevel - 1
                                };
                                endGame('match', matchScore);
                            } else {
                                // 다음 레벨
                                miniConfetti();
                                setTimeout(generateMatchLevel, 1000);
                            }
                        }
                    }, 500);
                } else {
                    // 매칭 실패
                    matchConsecutive = 0;
                    playWrongSound();
                    
                    setTimeout(() => {
                        first.element.classList.remove('flipped');
                        second.element.classList.remove('flipped');
                        matchFlipped = [];
                        matchCanFlip = true;
                    }, 800);
                }
            }
        }

// ==================== 1. 숫자 기억 ====================
        let sequence = [], userSequence = '', seqLevel = 1, seqScore = 0, seqTimer = null;
        let seqChanceCount = 2; // 다시보기 찬스 횟수
        let seqCanUseChance = false; // 찬스 사용 가능 여부
        
        function initSequenceGame() {
            seqLevel = 1; seqScore = 0; sequence = []; userSequence = '';
            seqChanceCount = 2; // 찬스 횟수 초기화
            seqCanUseChance = false;
            document.getElementById('seqScore').textContent = '0';
            document.getElementById('seqDisplay').textContent = '시작을 눌러주세요!';
            document.getElementById('userInput').textContent = '';
            document.getElementById('seqResult').style.display = 'none';
            document.getElementById('numPad').style.pointerEvents = 'none';
            document.getElementById('seqStartBtn').style.display = 'inline-block';
            document.getElementById('seqInputHint').style.display = 'none';
            updateSeqChanceBtn();
        }
        
        // 찬스 버튼 상태 업데이트
        function updateSeqChanceBtn() {
            const btn = document.getElementById('seqChanceBtn');
            const count = document.getElementById('seqChanceCount');
            if (btn && count) {
                count.textContent = seqChanceCount;
                btn.disabled = !seqCanUseChance || seqChanceCount <= 0;
            }
        }
        
        // 다시보기 찬스 사용
        function useSequenceChance() {
            if (seqChanceCount <= 0 || !seqCanUseChance) return;
            
            seqChanceCount--;
            seqCanUseChance = false;
            updateSeqChanceBtn();
            
            // 찬스 사용 애니메이션
            const btn = document.getElementById('seqChanceBtn');
            btn.classList.add('chance-used');
            setTimeout(() => btn.classList.remove('chance-used'), 500);
            
            // 타이머 일시정지
            if (seqTimer) clearInterval(seqTimer);
            
            // 숫자 다시 보여주기
            const disp = document.getElementById('seqDisplay');
            document.getElementById('numPad').style.pointerEvents = 'none';
            disp.textContent = sequence.join(' ');
            disp.style.color = '#FF5722'; // 찬스 표시
            
            // 음성으로 알려주기
            if (ttsAutoEnabled) {
                speak('다시 한번 보세요! ' + sequence.join(', '));
            }
            
            // 1.5초 후 다시 숨기기
            setTimeout(() => {
                disp.textContent = '숫자를 입력하세요!';
                disp.style.color = '';
                document.getElementById('numPad').style.pointerEvents = 'auto';
                startSeqTimer();
            }, 2000);
        }
        
        function startSequence() {
            document.getElementById('seqStartBtn').style.display = 'none';
            document.getElementById('seqResult').style.display = 'none';
            generateSequence();
        }
        
        // 숫자 순서 읽기
        function speakSequenceNumbers() {
            if (sequence.length > 0) {
                const numbers = sequence.join(', ');
                speak(`기억할 숫자는 ${numbers} 입니다. 순서대로 입력해 주세요.`);
            } else {
                speak('시작 버튼을 눌러 게임을 시작해 주세요.');
            }
        }
        
        function generateSequence() {
            const s = difficultySettings[userProfile.difficulty].sequence;
            const len = s.startDigits + seqLevel - 1;
            sequence = Array.from({length: len}, () => Math.floor(Math.random() * 10));
            showSequence();
        }
        
        function showSequence() {
            const s = difficultySettings[userProfile.difficulty].sequence;
            const disp = document.getElementById('seqDisplay');
            disp.textContent = '집중하세요...';
            disp.style.color = ''; // 색상 초기화
            document.getElementById('numPad').style.pointerEvents = 'none';
            seqCanUseChance = false;
            updateSeqChanceBtn();
            
            setTimeout(() => {
                disp.textContent = sequence.join(' ');
                const showTime = Math.max(s.showTime - seqLevel * 150, 1500);
                setTimeout(() => {
                    disp.textContent = '숫자를 입력하세요!';
                    userSequence = '';
                    document.getElementById('userInput').textContent = '';
                    document.getElementById('numPad').style.pointerEvents = 'auto';
                    // 찬스 사용 가능하게 설정
                    seqCanUseChance = seqChanceCount > 0;
                    updateSeqChanceBtn();
                    startSeqTimer();
                }, showTime);
            }, 400);
        }
        
        function startSeqTimer() {
            const s = difficultySettings[userProfile.difficulty].sequence;
            let timeLeft = 100;
            const dec = 100 / (s.inputTime / 100);
            document.getElementById('seqTimer').style.width = '100%';
            if (seqTimer) clearInterval(seqTimer);
            seqTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('seqTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(seqTimer); checkSequence(true); }
            }, 100);
        }
        
        function inputNumber(n) { 
            if (userSequence.length < sequence.length) { 
                userSequence += n; 
                document.getElementById('userInput').textContent = userSequence;
                // 힌트 표시
                const hint = document.getElementById('seqInputHint');
                if (hint && userSequence.length > 0) {
                    hint.style.display = 'block';
                }
            } 
        }
        
        function clearInput() { 
            userSequence = ''; 
            document.getElementById('userInput').textContent = '';
            // 지우기 성공 피드백
            const inputEl = document.getElementById('userInput');
            inputEl.style.borderColor = '#E53935';
            setTimeout(() => {
                inputEl.style.borderColor = '';
            }, 300);
            // 힌트 숨기기
            const hint = document.getElementById('seqInputHint');
            if (hint) hint.style.display = 'none';
        }
        function submitSequence() { if (seqTimer) clearInterval(seqTimer); checkSequence(false); }
        
        function checkSequence(timeout) {
            document.getElementById('numPad').style.pointerEvents = 'none';
            document.getElementById('seqInputHint').style.display = 'none';
            const res = document.getElementById('seqResult');
            gameState.totalAnswers++;
            
            if (!timeout && userSequence === sequence.join('')) {
                const pts = seqLevel * 10 + getGameLevel('sequence');
                seqScore += pts;
                seqLevel++;
                gameState.correctAnswers++;
                document.getElementById('seqScore').textContent = seqScore;
                res.textContent = `🎉 정답! +${pts}점`;
                res.className = 'result-message success';
                res.style.display = 'block';
                playCorrectSound();
                miniConfetti();
                checkLevelUp(true, 'sequence');
                if (seqLevel > 7) {
                    currentGameData = { sequenceLength: seqLevel - 1, finalLevel: getGameLevel('sequence') };
                    setTimeout(() => endGame('sequence', seqScore), 1200);
                }
                else setTimeout(() => { res.style.display = 'none'; generateSequence(); }, 1200);
            } else {
                res.textContent = timeout ? `⏰ 시간 초과! 정답: ${sequence.join('')}` : `❌ 틀렸습니다! 정답: ${sequence.join('')}`;
                res.className = 'result-message error';
                res.style.display = 'block';
                playWrongSound();
                checkLevelUp(false, 'sequence');
                currentGameData = { sequenceLength: seqLevel - 1, finalLevel: getGameLevel('sequence') };
                setTimeout(() => endGame('sequence', seqScore), 1500);
            }
        }

// ==================== 3. 암산 ====================
        let calcQ = 0, calcScore = 0, calcAnswer = 0, calcTimer = null, calcConsec = 0, calcMaxConsec = 0;
        
        function initCalcGame() {
            calcQ = calcScore = calcConsec = calcMaxConsec = 0;
            document.getElementById('calcQuestion').textContent = '0';
            document.getElementById('calcScore').textContent = '0';
            document.getElementById('calcProblem').textContent = '시작을 눌러주세요!';
            document.getElementById('calcOptions').innerHTML = '';
            document.getElementById('calcResult').style.display = 'none';
            document.getElementById('calcStartBtn').style.display = 'inline-block';
        }
        
        function startCalc() { document.getElementById('calcStartBtn').style.display = 'none'; nextCalcProblem(); }
        
        // 암산 문제 읽기
        function speakCalcProblem() {
            const problem = document.getElementById('calcProblem').textContent;
            if (problem && problem !== '시작을 눌러주세요!') {
                // 기호를 말로 변환
                let text = problem.replace(/\+/g, ' 더하기 ').replace(/\-/g, ' 빼기 ')
                    .replace(/×/g, ' 곱하기 ').replace(/÷/g, ' 나누기 ')
                    .replace(/=/g, '는').replace(/\?/g, ' 얼마일까요?');
                speak(text);
            }
        }
        
        function nextCalcProblem() {
            calcQ++;
            document.getElementById('calcResult').style.display = 'none';
            if (calcQ > 10) { currentGameData = { consecutive: calcMaxConsec, finalLevel: getGameLevel('calc') }; endGame('calc', calcScore); return; }
            
            const s = difficultySettings[userProfile.difficulty].calc;
            const levelMult = getLevelMultiplier('calc');
            const op = s.operators[Math.floor(Math.random() * s.operators.length)];
            let n1, n2;
            
            // 레벨에 따라 숫자 범위 증가
            const maxNum = Math.floor(s.maxNum * levelMult);
            
            const calcLevel = getGameLevel('calc');
            if (op === '+') { n1 = Math.floor(Math.random() * maxNum) + 1; n2 = Math.floor(Math.random() * maxNum) + 1; calcAnswer = n1 + n2; }
            else if (op === '-') { n1 = Math.floor(Math.random() * maxNum) + 10; n2 = Math.floor(Math.random() * Math.min(n1, maxNum/2)) + 1; calcAnswer = n1 - n2; }
            else if (op === '×') { n1 = Math.floor(Math.random() * Math.min(9 + calcLevel, 15)) + 2; n2 = Math.floor(Math.random() * 9) + 2; calcAnswer = n1 * n2; }
            else { n2 = Math.floor(Math.random() * 9) + 2; calcAnswer = Math.floor(Math.random() * Math.min(10 + calcLevel, 20)) + 1; n1 = n2 * calcAnswer; }
            
            document.getElementById('calcProblem').textContent = `${n1} ${op} ${n2} = ?`;
            
            let opts = [calcAnswer];
            while (opts.length < 4) { const w = calcAnswer + Math.floor(Math.random() * 21) - 10; if (w !== calcAnswer && w > 0 && !opts.includes(w)) opts.push(w); }
            shuffleArray(opts);
            document.getElementById('calcOptions').innerHTML = opts.map(o => `<button class="calc-option" onclick="checkCalc(${o})">${o}</button>`).join('');
            startCalcTimer();
        }
        
        function startCalcTimer() {
            let timeLeft = 100;
            const mult = userProfile.difficulty === 'very_easy' ? 0.3 : userProfile.difficulty === 'easy' ? 0.4 : userProfile.difficulty === 'hard' ? 0.6 : userProfile.difficulty === 'very_hard' ? 0.7 : 0.5;
            document.getElementById('calcTimer').style.width = '100%';
            if (calcTimer) clearInterval(calcTimer);
            calcTimer = setInterval(() => {
                timeLeft -= mult;
                document.getElementById('calcTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(calcTimer); showCalcResult(false, true); }
            }, 100);
        }
        
        function checkCalc(ans) { if (calcTimer) clearInterval(calcTimer); showCalcResult(ans === calcAnswer, false); }
        
        function showCalcResult(correct, timeout) {
            const res = document.getElementById('calcResult');
            gameState.totalAnswers++;
            document.querySelectorAll('.calc-option').forEach(b => b.style.pointerEvents = 'none');
            const calcLevelPts = getGameLevel('calc');
            if (correct) { 
                calcScore += 10 + calcLevelPts; gameState.correctAnswers++; 
                calcConsec++; if (calcConsec > calcMaxConsec) calcMaxConsec = calcConsec;
                document.getElementById('calcScore').textContent = calcScore; 
                res.textContent = `🎉 정답! +${10 + calcLevelPts}점`; res.className = 'result-message success'; playCorrectSound(); miniConfetti();
                checkLevelUp(true, 'calc');
            } else { 
                calcConsec = 0;
                res.textContent = timeout ? `⏰ 시간 초과! 정답: ${calcAnswer}` : `❌ 틀렸습니다! 정답: ${calcAnswer}`; 
                res.className = 'result-message error'; playWrongSound();
                checkLevelUp(false, 'calc');
            }
            res.style.display = 'block';
            setTimeout(nextCalcProblem, 1200);
        }

// ==================== 4. 색상 맞추기 ====================
        const colors = { red: { name: '빨강', color: '#E53935' }, blue: { name: '파랑', color: '#1E88E5' }, green: { name: '초록', color: '#43A047' }, yellow: { name: '노랑', color: '#FDD835' } };
        const colorKeys = Object.keys(colors);
        let colorQ = 0, colorScore = 0, correctColor = '', colorTimer = null, colorConsec = 0, colorMaxConsec = 0;
        
        function initColorGame() {
            colorQ = colorScore = colorConsec = colorMaxConsec = 0;
            document.getElementById('colorQuestion').textContent = '0';
            document.getElementById('colorScore').textContent = '0';
            document.getElementById('colorWord').textContent = '준비';
            document.getElementById('colorWord').style.color = 'black';
            document.getElementById('colorResult').style.display = 'none';
            document.getElementById('colorStartBtn').style.display = 'inline-block';
            document.getElementById('colorOptions').style.pointerEvents = 'none';
        }
        
        function startColor() { document.getElementById('colorStartBtn').style.display = 'none'; document.getElementById('colorOptions').style.pointerEvents = 'auto'; nextColorProblem(); }
        
        // 색상 문제 읽기
        function speakColorProblem() {
            const wordEl = document.getElementById('colorWord');
            const word = wordEl.textContent;
            const color = wordEl.style.color;
            
            if (word && word !== '준비') {
                // 색상 이름으로 변환
                const colorNames = {
                    'rgb(233, 57, 53)': '빨간색',
                    'rgb(30, 136, 229)': '파란색', 
                    'rgb(67, 160, 71)': '초록색',
                    'rgb(253, 216, 53)': '노란색',
                    '#E53935': '빨간색',
                    '#1E88E5': '파란색',
                    '#43A047': '초록색',
                    '#FDD835': '노란색',
                    'red': '빨간색',
                    'blue': '파란색',
                    'green': '초록색',
                    'yellow': '노란색'
                };
                const actualColor = colorNames[color] || '어떤 색';
                speak(`${word}이라고 쓰여 있습니다. 글자의 색깔은 무엇일까요? 글자 색깔을 맞춰주세요.`);
            }
        }
        
        function nextColorProblem() {
            colorQ++;
            document.getElementById('colorResult').style.display = 'none';
            document.getElementById('colorOptions').style.pointerEvents = 'auto';
            if (colorQ > 10) { currentGameData = { consecutive: colorMaxConsec, finalLevel: getGameLevel('color') }; endGame('color', colorScore); return; }
            
            const s = difficultySettings[userProfile.difficulty].color;
            const wordKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            let textKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            if (Math.random() < s.mismatchRate) while (textKey === wordKey) textKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            else textKey = wordKey;
            
            correctColor = textKey;
            document.getElementById('colorWord').textContent = colors[wordKey].name;
            document.getElementById('colorWord').style.color = colors[textKey].color;
            startColorTimer();
        }
        
        function startColorTimer() {
            const s = difficultySettings[userProfile.difficulty].color;
            let timeLeft = 100;
            // 레벨에 따라 시간 감소
            const adjustedTimeLimit = s.timeLimit * getLevelTimeMultiplier('color');
            const dec = 100 / (adjustedTimeLimit / 100);
            document.getElementById('colorTimer').style.width = '100%';
            if (colorTimer) clearInterval(colorTimer);
            colorTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('colorTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(colorTimer); showColorResult(false, true); }
            }, 100);
        }
        
        function selectColor(c) { if (colorTimer) clearInterval(colorTimer); showColorResult(c === correctColor, false); }
        
        function showColorResult(correct, timeout) {
            const res = document.getElementById('colorResult');
            document.getElementById('colorOptions').style.pointerEvents = 'none';
            gameState.totalAnswers++;
            if (correct) { 
                const points = 10 + getGameLevel('color');
                colorScore += points; gameState.correctAnswers++; 
                colorConsec++; if (colorConsec > colorMaxConsec) colorMaxConsec = colorConsec;
                document.getElementById('colorScore').textContent = colorScore; 
                res.textContent = `🎉 정답! +${points}점`; res.className = 'result-message success'; playCorrectSound(); miniConfetti();
                checkLevelUp(true, 'color');
            } else { 
                colorConsec = 0;
                res.textContent = timeout ? `⏰ 시간 초과! 정답: ${colors[correctColor].name}` : `❌ 틀렸습니다! 정답: ${colors[correctColor].name}`; 
                res.className = 'result-message error'; playWrongSound();
                checkLevelUp(false, 'color');
            }
            res.style.display = 'block';
            setTimeout(nextColorProblem, 1200);
        }

// ==================== 5. 패턴 기억 ====================
        let patternLevel = 1, patternScore = 0, pattern = [], userPattern = [], patternPhase = 'show';
        let patternChanceCount = 2; // 다시보기 찬스 횟수
        let patternCanUseChance = false; // 찬스 사용 가능 여부
        
        function initPatternGame() {
            patternLevel = 1; patternScore = 0; pattern = []; userPattern = [];
            patternChanceCount = 2; // 찬스 횟수 초기화
            patternCanUseChance = false;
            document.getElementById('patternLevel').textContent = '1';
            document.getElementById('patternScore').textContent = '0';
            document.getElementById('patternResult').style.display = 'none';
            document.getElementById('patternStartBtn').style.display = 'inline-block';
            document.getElementById('patternInstruction').textContent = '패턴을 기억하세요!';
            renderPatternGrid();
            updatePatternChanceBtn();
        }
        
        // 패턴 찬스 버튼 상태 업데이트
        function updatePatternChanceBtn() {
            const btn = document.getElementById('patternChanceBtn');
            const count = document.getElementById('patternChanceCount');
            if (btn && count) {
                count.textContent = patternChanceCount;
                btn.disabled = !patternCanUseChance || patternChanceCount <= 0;
            }
        }
        
        // 패턴 다시보기 찬스 사용
        function usePatternChance() {
            if (patternChanceCount <= 0 || !patternCanUseChance || patternPhase !== 'input') return;
            
            patternChanceCount--;
            patternCanUseChance = false;
            updatePatternChanceBtn();
            
            // 찬스 사용 애니메이션
            const btn = document.getElementById('patternChanceBtn');
            btn.classList.add('chance-used');
            setTimeout(() => btn.classList.remove('chance-used'), 500);
            
            // 입력 금지
            const cells = document.querySelectorAll('.pattern-cell');
            cells.forEach(c => c.style.pointerEvents = 'none');
            
            // 패턴 다시 보여주기
            document.getElementById('patternInstruction').textContent = '🔍 다시 한번 보세요!';
            pattern.forEach(i => cells[i].classList.add('active'));
            
            // 음성으로 알려주기
            if (ttsAutoEnabled) {
                speak('다시 한번 보세요! 잘 기억하세요.');
            }
            
            // 1.5초 후 다시 숨기기
            setTimeout(() => {
                cells.forEach(c => c.classList.remove('active'));
                document.getElementById('patternInstruction').textContent = '패턴을 클릭하세요!';
                cells.forEach(c => {
                    if (!c.classList.contains('selected')) {
                        c.style.pointerEvents = 'auto';
                    }
                });
            }, 2000);
        }
        
        function renderPatternGrid() {
            const s = difficultySettings[userProfile.difficulty].pattern;
            const grid = document.getElementById('patternGrid');
            grid.className = 'pattern-grid size-' + s.gridSize;
            const total = s.gridSize * s.gridSize;
            grid.innerHTML = Array.from({length: total}, (_, i) => `<div class="pattern-cell" data-idx="${i}" onclick="clickPatternCell(${i})"></div>`).join('');
        }
        
        function startPattern() {
            document.getElementById('patternStartBtn').style.display = 'none';
            document.getElementById('patternResult').style.display = 'none';
            generatePattern();
        }
        
        function generatePattern() {
            const s = difficultySettings[userProfile.difficulty].pattern;
            const total = s.gridSize * s.gridSize;
            const count = s.patternCount + patternLevel - 1;
            pattern = [];
            while (pattern.length < count) { const r = Math.floor(Math.random() * total); if (!pattern.includes(r)) pattern.push(r); }
            showPattern();
        }
        
        function showPattern() {
            patternPhase = 'show';
            patternCanUseChance = false;
            updatePatternChanceBtn();
            document.getElementById('patternInstruction').textContent = '패턴을 기억하세요!';
            const cells = document.querySelectorAll('.pattern-cell');
            cells.forEach(c => { c.classList.remove('active', 'selected', 'correct', 'wrong'); c.style.pointerEvents = 'none'; });
            pattern.forEach(i => cells[i].classList.add('active'));
            
            const showTime = Math.max(2000 - patternLevel * 100, 1000);
            setTimeout(() => {
                cells.forEach(c => c.classList.remove('active'));
                patternPhase = 'input';
                userPattern = [];
                document.getElementById('patternInstruction').textContent = '패턴을 클릭하세요!';
                cells.forEach(c => c.style.pointerEvents = 'auto');
                // 찬스 사용 가능하게 설정
                patternCanUseChance = patternChanceCount > 0;
                updatePatternChanceBtn();
            }, showTime);
        }
        
        function clickPatternCell(idx) {
            if (patternPhase !== 'input') return;
            const cell = document.querySelector(`.pattern-cell[data-idx="${idx}"]`);
            if (cell.classList.contains('selected')) return;
            
            cell.classList.add('selected');
            userPattern.push(idx);
            
            if (userPattern.length === pattern.length) checkPattern();
        }
        
        function checkPattern() {
            patternPhase = 'result';
            gameState.totalAnswers++;
            const cells = document.querySelectorAll('.pattern-cell');
            cells.forEach(c => c.style.pointerEvents = 'none');
            
            const correct = pattern.every(p => userPattern.includes(p)) && userPattern.every(u => pattern.includes(u));
            const res = document.getElementById('patternResult');
            
            if (correct) {
                const pts = patternLevel * 15 + getGameLevel('pattern');
                patternScore += pts;
                patternLevel++;
                gameState.correctAnswers++;
                document.getElementById('patternScore').textContent = patternScore;
                pattern.forEach(i => cells[i].classList.add('correct'));
                res.textContent = `🎉 정답! +${pts}점`;
                res.className = 'result-message success';
                res.style.display = 'block';
                playCorrectSound();
                miniConfetti();
                checkLevelUp(true, 'pattern');
                if (patternLevel > 6) {
                    currentGameData = { patternLevel: patternLevel - 1, finalLevel: getGameLevel('pattern') };
                    setTimeout(() => endGame('pattern', patternScore), 1200);
                }
                else setTimeout(() => { res.style.display = 'none'; generatePattern(); }, 1200);
            } else {
                pattern.forEach(i => cells[i].classList.add('correct'));
                userPattern.filter(u => !pattern.includes(u)).forEach(i => cells[i].classList.add('wrong'));
                res.textContent = '❌ 틀렸습니다!';
                res.className = 'result-message error';
                res.style.display = 'block';
                playWrongSound();
                checkLevelUp(false, 'pattern');
                currentGameData = { patternLevel: patternLevel - 1, finalLevel: getGameLevel('pattern') };
                setTimeout(() => endGame('pattern', patternScore), 1500);
            }
        }

// ==================== 6. 반응 속도 ====================
        let reactionRound = 0, reactionTimes = [], reactionState = 'idle', reactionTimeout = null, reactionStart = 0;
        
        function initReactionGame() {
            reactionRound = 0; reactionTimes = []; reactionState = 'idle';
            document.getElementById('reactionRound').textContent = '0';
            document.getElementById('reactionAvg').textContent = '0';
            document.getElementById('reactionResult').style.display = 'none';
            document.getElementById('reactionStartBtn').style.display = 'inline-block';
            const box = document.getElementById('reactionBox');
            box.className = 'reaction-box waiting';
            document.getElementById('reactionText').textContent = '시작을 누르세요';
        }
        
        function startReaction() {
            document.getElementById('reactionStartBtn').style.display = 'none';
            document.getElementById('reactionResult').style.display = 'none';
            nextReactionRound();
        }
        
        function nextReactionRound() {
            reactionRound++;
            document.getElementById('reactionRound').textContent = reactionRound;
            
            if (reactionRound > 5) {
                const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
                const best = Math.min(...reactionTimes);
                const score = Math.max(100 - Math.floor(avg / 10), 20);
                currentGameData = { reactionTime: best };
                endGame('reaction', score);
                return;
            }
            
            const box = document.getElementById('reactionBox');
            box.className = 'reaction-box ready';
            document.getElementById('reactionText').textContent = '초록색이 되면 클릭!';
            reactionState = 'waiting';
            
            const s = difficultySettings[userProfile.difficulty].reaction;
            const delay = s.minDelay + Math.random() * (s.maxDelay - s.minDelay);
            
            reactionTimeout = setTimeout(() => {
                box.className = 'reaction-box go';
                document.getElementById('reactionText').textContent = '클릭!';
                reactionState = 'go';
                reactionStart = Date.now();
            }, delay);
        }
        
        function reactionClick() {
            if (reactionState === 'idle') return;
            
            const box = document.getElementById('reactionBox');
            const res = document.getElementById('reactionResult');
            
            if (reactionState === 'waiting') {
                clearTimeout(reactionTimeout);
                box.className = 'reaction-box early';
                document.getElementById('reactionText').textContent = '너무 빨랐어요!';
                reactionState = 'idle';
                res.textContent = '⚠️ 초록색이 될 때까지 기다리세요!';
                res.className = 'result-message error';
                res.style.display = 'block';
                setTimeout(() => { res.style.display = 'none'; nextReactionRound(); }, 1500);
            } else if (reactionState === 'go') {
                const time = Date.now() - reactionStart;
                reactionTimes.push(time);
                reactionState = 'idle';
                
                const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
                document.getElementById('reactionAvg').textContent = avg;
                
                box.className = 'reaction-box waiting';
                document.getElementById('reactionText').textContent = `${time}ms!`;
                
                res.textContent = `⚡ ${time}ms! ${time < 300 ? '대단해요!' : time < 500 ? '좋아요!' : '괜찮아요!'}`;
                res.className = 'result-message success';
                res.style.display = 'block';
                gameState.totalAnswers++;
                gameState.correctAnswers++;
                playCorrectSound();
                miniConfetti();
                
                setTimeout(() => { res.style.display = 'none'; nextReactionRound(); }, 1500);
            }
        }

// ==================== 7. 다른 것 찾기 ====================
        const diffEmojis = ['😀','😃','😄','😁','😆','🥹','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘'];
        let findDiffQ = 0, findDiffScore = 0, diffAnswer = -1, findDiffTimer = null, findDiffConsec = 0, findDiffMaxConsec = 0;
        
        function initFindDiffGame() {
            findDiffQ = findDiffScore = findDiffConsec = findDiffMaxConsec = 0;
            document.getElementById('findDiffQuestion').textContent = '0';
            document.getElementById('findDiffScore').textContent = '0';
            document.getElementById('findDiffResult').style.display = 'none';
            document.getElementById('findDiffStartBtn').style.display = 'inline-block';
            document.getElementById('findDiffGrid').innerHTML = '';
        }
        
        function startFindDiff() { document.getElementById('findDiffStartBtn').style.display = 'none'; nextFindDiff(); }
        
        function nextFindDiff() {
            findDiffQ++;
            document.getElementById('findDiffResult').style.display = 'none';
            if (findDiffQ > 10) { currentGameData = { consecutive: findDiffMaxConsec, finalLevel: getGameLevel('findDiff') }; endGame('findDiff', findDiffScore); return; }
            
            const s = difficultySettings[userProfile.difficulty].findDiff;
            const mainEmoji = diffEmojis[Math.floor(Math.random() * diffEmojis.length)];
            let diffEmoji = diffEmojis[Math.floor(Math.random() * diffEmojis.length)];
            while (diffEmoji === mainEmoji) diffEmoji = diffEmojis[Math.floor(Math.random() * diffEmojis.length)];
            
            diffAnswer = Math.floor(Math.random() * s.gridSize);
            const items = Array(s.gridSize).fill(mainEmoji);
            items[diffAnswer] = diffEmoji;
            
            const cols = s.gridSize <= 9 ? 3 : s.gridSize <= 16 ? 4 : 5;
            const grid = document.getElementById('findDiffGrid');
            grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            grid.innerHTML = items.map((e, i) => `<div class="diff-item" onclick="clickDiff(${i})">${e}</div>`).join('');
            
            startFindDiffTimer();
        }
        
        function startFindDiffTimer() {
            const s = difficultySettings[userProfile.difficulty].findDiff;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('findDiffTimer').style.width = '100%';
            if (findDiffTimer) clearInterval(findDiffTimer);
            findDiffTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('findDiffTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(findDiffTimer); showFindDiffResult(false, true); }
            }, 100);
        }
        
        function clickDiff(idx) {
            if (findDiffTimer) clearInterval(findDiffTimer);
            showFindDiffResult(idx === diffAnswer, false);
        }
        
        function showFindDiffResult(correct, timeout) {
            const res = document.getElementById('findDiffResult');
            gameState.totalAnswers++;
            document.querySelectorAll('.diff-item').forEach((d, i) => { d.style.pointerEvents = 'none'; if (i === diffAnswer) d.classList.add('found'); });
            
            if (correct) { 
                const pts = 10 + getGameLevel('findDiff');
                findDiffScore += pts; gameState.correctAnswers++; 
                findDiffConsec++; if (findDiffConsec > findDiffMaxConsec) findDiffMaxConsec = findDiffConsec;
                document.getElementById('findDiffScore').textContent = findDiffScore; 
                res.textContent = `🎉 정답! +${pts}점`; res.className = 'result-message success'; playCorrectSound(); miniConfetti();
                checkLevelUp(true, 'findDiff');
            } else { 
                findDiffConsec = 0;
                res.textContent = timeout ? '⏰ 시간 초과!' : '❌ 틀렸습니다!'; res.className = 'result-message error'; playWrongSound();
                checkLevelUp(false, 'findDiff');
            }
            res.style.display = 'block';
            setTimeout(nextFindDiff, 1200);
        }

// ==================== 8. 순서 정렬 ====================
        let sortLevel = 1, sortScore = 0, sortNumbers = [], sortNext = 1, sortTimer = null;
        
        function initSortingGame() {
            sortLevel = 1; sortScore = 0; sortNumbers = []; sortNext = 1;
            document.getElementById('sortLevel').textContent = '1';
            document.getElementById('sortScore').textContent = '0';
            document.getElementById('sortResult').style.display = 'none';
            document.getElementById('sortStartBtn').style.display = 'inline-block';
            document.getElementById('sortGrid').innerHTML = '';
        }
        
        function startSorting() { document.getElementById('sortStartBtn').style.display = 'none'; generateSort(); }
        
        function generateSort() {
            const s = difficultySettings[userProfile.difficulty].sorting;
            const count = s.count + sortLevel - 1;
            sortNumbers = shuffleArray(Array.from({length: count}, (_, i) => i + 1));
            sortNext = 1;
            
            document.getElementById('sortResult').style.display = 'none';
            document.getElementById('sortGrid').innerHTML = sortNumbers.map(n => `<div class="sort-item" data-num="${n}" onclick="clickSort(${n})">${n}</div>`).join('');
            startSortTimer();
        }
        
        function startSortTimer() {
            const s = difficultySettings[userProfile.difficulty].sorting;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('sortTimer').style.width = '100%';
            if (sortTimer) clearInterval(sortTimer);
            sortTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('sortTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(sortTimer); endSortRound(false); }
            }, 100);
        }
        
        function clickSort(num) {
            const item = document.querySelector(`.sort-item[data-num="${num}"]`);
            if (num === sortNext) {
                item.classList.add('clicked');
                sortNext++;
                if (sortNext > sortNumbers.length) { clearInterval(sortTimer); endSortRound(true); }
            } else {
                item.classList.add('wrong');
                setTimeout(() => item.classList.remove('wrong'), 300);
            }
        }
        
        function endSortRound(success) {
            const res = document.getElementById('sortResult');
            gameState.totalAnswers++;
            
            if (success) {
                const pts = sortLevel * 15 + getGameLevel('sorting');
                sortScore += pts;
                sortLevel++;
                gameState.correctAnswers++;
                document.getElementById('sortScore').textContent = sortScore;
                res.textContent = `🎉 성공! +${pts}점`;
                res.className = 'result-message success';
                res.style.display = 'block';
                playCorrectSound();
                miniConfetti();
                checkLevelUp(true, 'sorting');
                if (sortLevel > 5) { 
                    currentGameData = { items: sortNumbers.length, finalLevel: getGameLevel('sorting') }; 
                    setTimeout(() => endGame('sorting', sortScore), 1200); 
                }
                else setTimeout(generateSort, 1200);
            } else {
                res.textContent = '⏰ 시간 초과!';
                res.className = 'result-message error';
                res.style.display = 'block';
                playWrongSound();
                checkLevelUp(false, 'sorting');
                currentGameData = { items: sortNumbers.length, finalLevel: getGameLevel('sorting') };
                setTimeout(() => endGame('sorting', sortScore), 1500);
            }
        }
