// ==================== 9. 방향 맞추기 ====================
        const arrows = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
        const arrowKeys = Object.keys(arrows);
        let dirQ = 0, dirScore = 0, correctDir = '', dirTimer = null;
        
        function initDirectionGame() {
            dirQ = dirScore = 0;
            document.getElementById('dirQuestion').textContent = '0';
            document.getElementById('dirScore').textContent = '0';
            document.getElementById('dirResult').style.display = 'none';
            document.getElementById('dirStartBtn').style.display = 'inline-block';
            document.getElementById('arrowDisplay').textContent = '🎯';
            document.querySelectorAll('.dir-btn:not(.empty)').forEach(b => b.style.pointerEvents = 'none');
        }
        
        function startDirection() {
            document.getElementById('dirStartBtn').style.display = 'none';
            document.querySelectorAll('.dir-btn:not(.empty)').forEach(b => b.style.pointerEvents = 'auto');
            nextDirection();
        }
        
        function nextDirection() {
            dirQ++;
            document.getElementById('dirQuestion').textContent = dirQ;
            document.getElementById('dirResult').style.display = 'none';
            if (dirQ > 10) { endGame('direction', dirScore); return; }
            
            correctDir = arrowKeys[Math.floor(Math.random() * arrowKeys.length)];
            document.getElementById('arrowDisplay').textContent = arrows[correctDir];
            document.querySelectorAll('.dir-btn:not(.empty)').forEach(b => b.style.pointerEvents = 'auto');
            startDirTimer();
        }
        
        function startDirTimer() {
            const s = difficultySettings[userProfile.difficulty].direction;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('dirTimer').style.width = '100%';
            if (dirTimer) clearInterval(dirTimer);
            dirTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('dirTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(dirTimer); showDirResult(false, true); }
            }, 100);
        }
        
        function selectDirection(dir) { if (dirTimer) clearInterval(dirTimer); showDirResult(dir === correctDir, false); }
        
        function showDirResult(correct, timeout) {
            const res = document.getElementById('dirResult');
            gameState.totalAnswers++;
            document.querySelectorAll('.dir-btn:not(.empty)').forEach(b => b.style.pointerEvents = 'none');
            
            if (correct) { 
                dirScore += 10; 
                gameState.correctAnswers++; 
                document.getElementById('dirScore').textContent = dirScore; 
                res.textContent = '🎉 정답! +10점'; 
                res.className = 'result-message success'; 
                playCorrectSound(); 
                miniConfetti();
                checkLevelUp(true, 'direction');
            } else { 
                res.textContent = timeout ? '⏰ 시간 초과!' : '❌ 틀렸습니다!'; 
                res.className = 'result-message error'; 
                playWrongSound();
                checkLevelUp(false, 'direction');
            }
            res.style.display = 'block';
            setTimeout(nextDirection, 1000);
        }

// ==================== 10. 단어 완성 ====================
        const words2 = ['사과','바다','하늘','나무','꽃잎','별빛','달빛','햇살','강물','산책'];
        const words3 = ['가족들','학교에','노래를','행복한','아름다운','즐거운','새로운','기쁜일','맑은날','푸른색'];
        const words4 = ['대한민국','무지개빛','아이스크림','초콜릿케','생일축하','감사합니다','사랑합니다','고맙습니다'];
        let wordQ = 0, wordScore = 0, currentWord = '', missingIdx = 0, wordTimer = null;
        
        function initWordGame() {
            wordQ = wordScore = 0;
            document.getElementById('wordQuestion').textContent = '0';
            document.getElementById('wordScore').textContent = '0';
            document.getElementById('wordResult').style.display = 'none';
            document.getElementById('wordStartBtn').style.display = 'inline-block';
            document.getElementById('wordDisplay').textContent = '_ _ _';
            document.getElementById('letterInput').innerHTML = '';
        }
        
        function startWord() { document.getElementById('wordStartBtn').style.display = 'none'; nextWord(); }
        
        // 단어 문제 힌트 읽기
        function speakWordProblem() {
            if (currentWord) {
                const display = document.getElementById('wordDisplay').textContent;
                const visibleChars = currentWord.split('').map((c, i) => i === missingIdx ? '빈칸' : c).join(' ');
                speak(`단어의 빈칸을 채워주세요. ${visibleChars}. 빈칸에 들어갈 글자를 선택해 주세요.`);
            } else {
                speak('시작 버튼을 눌러 게임을 시작해 주세요.');
            }
        }
        
        function nextWord() {
            wordQ++;
            document.getElementById('wordQuestion').textContent = wordQ;
            document.getElementById('wordResult').style.display = 'none';
            if (wordQ > 10) { endGame('word', wordScore); return; }
            
            const s = difficultySettings[userProfile.difficulty].word;
            const wordList = s.wordLength === 2 ? words2 : s.wordLength === 3 ? words3 : words4;
            currentWord = wordList[Math.floor(Math.random() * wordList.length)];
            missingIdx = Math.floor(Math.random() * currentWord.length);
            
            const display = currentWord.split('').map((c, i) => i === missingIdx ? '_' : c).join(' ');
            document.getElementById('wordDisplay').textContent = display;
            
            let options = [currentWord[missingIdx]];
            const allChars = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ가나다라마바사아자차카타파하';
            while (options.length < 6) { const c = allChars[Math.floor(Math.random() * allChars.length)]; if (!options.includes(c)) options.push(c); }
            shuffleArray(options);
            
            document.getElementById('letterInput').innerHTML = options.map(c => `<button class="letter-btn" onclick="selectLetter('${c}')">${c}</button>`).join('');
            startWordTimer();
        }
        
        function startWordTimer() {
            const s = difficultySettings[userProfile.difficulty].word;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('wordTimer').style.width = '100%';
            if (wordTimer) clearInterval(wordTimer);
            wordTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('wordTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(wordTimer); showWordResult(false, true); }
            }, 100);
        }
        
        function selectLetter(letter) { if (wordTimer) clearInterval(wordTimer); showWordResult(letter === currentWord[missingIdx], false); }
        
        function showWordResult(correct, timeout) {
            const res = document.getElementById('wordResult');
            gameState.totalAnswers++;
            document.querySelectorAll('.letter-btn').forEach(b => b.style.pointerEvents = 'none');
            
            if (correct) {
                wordScore += 10;
                gameState.correctAnswers++;
                document.getElementById('wordScore').textContent = wordScore;
                document.getElementById('wordDisplay').textContent = currentWord.split('').join(' ');
                res.textContent = '🎉 정답! +10점';
                res.className = 'result-message success';
                playCorrectSound();
                miniConfetti();
            } else {
                res.textContent = timeout ? `⏰ 시간 초과! 정답: ${currentWord}` : `❌ 틀렸습니다! 정답: ${currentWord}`;
                res.className = 'result-message error';
                playWrongSound();
            }
            res.style.display = 'block';
            setTimeout(nextWord, 1200);
        }

// ==================== 11. 개수 세기 ====================
        const countEmojis = ['🍎','🍊','🍋','🍇','🍓','⭐','🌙','🌸','🎈','🎀'];
        let countQ = 0, countScore = 0, countAnswer = 0, countTimer = null;
        
        function initCountingGame() {
            countQ = countScore = 0;
            document.getElementById('countQuestion').textContent = '0';
            document.getElementById('countScore').textContent = '0';
            document.getElementById('countResult').style.display = 'none';
            document.getElementById('countStartBtn').style.display = 'inline-block';
            document.getElementById('countingGrid').innerHTML = '';
            document.getElementById('countOptions').innerHTML = '';
        }
        
        function startCounting() { document.getElementById('countStartBtn').style.display = 'none'; nextCount(); }
        
        // 개수 세기 문제 읽기
        function speakCountingProblem() {
            const target = document.getElementById('countTarget').textContent;
            if (target) {
                // 이모지를 이름으로 변환
                const emojiNames = {
                    '🍎': '사과', '🍊': '오렌지', '🍋': '레몬', '🍇': '포도',
                    '🍓': '딸기', '🍒': '체리', '🍑': '복숭아', '🍌': '바나나',
                    '🌟': '별', '❤️': '하트', '💎': '보석', '🔔': '종',
                    '⭐': '별', '🌸': '꽃', '🎈': '풍선', '🎁': '선물'
                };
                
                let spokenText = target;
                Object.keys(emojiNames).forEach(emoji => {
                    spokenText = spokenText.replace(emoji, emojiNames[emoji]);
                });
                
                speak(`화면에서 ${spokenText} 개수를 세어 보세요.`);
            }
        }
        
        function nextCount() {
            countQ++;
            document.getElementById('countQuestion').textContent = countQ;
            document.getElementById('countResult').style.display = 'none';
            if (countQ > 10) { endGame('counting', countScore); return; }
            
            const s = difficultySettings[userProfile.difficulty].counting;
            const targetEmoji = countEmojis[Math.floor(Math.random() * countEmojis.length)];
            document.getElementById('countTarget').textContent = `${targetEmoji}의 개수는?`;
            
            countAnswer = Math.floor(Math.random() * s.maxCount) + 1;
            const otherCount = s.gridSize - countAnswer;
            
            let items = Array(countAnswer).fill(targetEmoji);
            for (let i = 0; i < otherCount; i++) {
                let other = countEmojis[Math.floor(Math.random() * countEmojis.length)];
                while (other === targetEmoji) other = countEmojis[Math.floor(Math.random() * countEmojis.length)];
                items.push(other);
            }
            shuffleArray(items);
            
            const cols = s.gridSize <= 12 ? 4 : s.gridSize <= 20 ? 5 : 6;
            const grid = document.getElementById('countingGrid');
            grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            grid.innerHTML = items.map(e => `<div class="counting-item">${e}</div>`).join('');
            
            let opts = [countAnswer];
            while (opts.length < 4) { const o = Math.floor(Math.random() * s.maxCount) + 1; if (!opts.includes(o)) opts.push(o); }
            shuffleArray(opts);
            document.getElementById('countOptions').innerHTML = opts.map(o => `<button class="count-btn" onclick="selectCount(${o})">${o}</button>`).join('');
            
            startCountTimer();
        }
        
        function startCountTimer() {
            const s = difficultySettings[userProfile.difficulty].counting;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('countTimer').style.width = '100%';
            if (countTimer) clearInterval(countTimer);
            countTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('countTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(countTimer); showCountResult(false, true); }
            }, 100);
        }
        
        function selectCount(n) { if (countTimer) clearInterval(countTimer); showCountResult(n === countAnswer, false); }
        
        function showCountResult(correct, timeout) {
            const res = document.getElementById('countResult');
            gameState.totalAnswers++;
            document.querySelectorAll('.count-btn').forEach(b => b.style.pointerEvents = 'none');
            
            if (correct) { countScore += 10; gameState.correctAnswers++; document.getElementById('countScore').textContent = countScore; res.textContent = '🎉 정답! +10점'; res.className = 'result-message success'; playCorrectSound(); miniConfetti(); }
            else { res.textContent = timeout ? `⏰ 시간 초과! 정답: ${countAnswer}` : `❌ 틀렸습니다! 정답: ${countAnswer}`; res.className = 'result-message error'; playWrongSound(); }
            res.style.display = 'block';
            setTimeout(nextCount, 1200);
        }

// ==================== 12. 짝 연결 ====================
        const pairData = [
            ['태양', '달'], ['바다', '산'], ['커피', '차'], ['봄', '가을'], ['아침', '저녁'],
            ['왼쪽', '오른쪽'], ['위', '아래'], ['시작', '끝'], ['밤', '낮'], ['여름', '겨울'],
            ['부모', '자녀'], ['선생', '학생'], ['의사', '환자'], ['꽃', '나비'], ['비', '우산']
        ];
        let pairMatches = 0, pairScore = 0, pairSelected = null, pairs = [], totalPairsCount = 4;
        
        function initPairingGame() {
            pairMatches = pairScore = 0;
            pairSelected = null;
            document.getElementById('pairMatches').textContent = '0';
            document.getElementById('pairScore').textContent = '0';
            document.getElementById('pairResult').style.display = 'none';
            document.getElementById('pairStartBtn').style.display = 'inline-block';
            document.getElementById('pairLeft').innerHTML = '';
            document.getElementById('pairRight').innerHTML = '';
        }
        
        function startPairing() {
            document.getElementById('pairStartBtn').style.display = 'none';
            
            const s = difficultySettings[userProfile.difficulty].pairing;
            totalPairsCount = s.pairs;
            document.getElementById('pairTotal').textContent = totalPairsCount;
            
            pairs = shuffleArray([...pairData]).slice(0, totalPairsCount);
            const leftItems = shuffleArray(pairs.map((p, i) => ({ text: p[0], pairIdx: i, side: 'left' })));
            const rightItems = shuffleArray(pairs.map((p, i) => ({ text: p[1], pairIdx: i, side: 'right' })));
            
            document.getElementById('pairLeft').innerHTML = leftItems.map((item, i) => `<div class="pair-item" data-pair="${item.pairIdx}" data-side="left" onclick="selectPair(this)">${item.text}</div>`).join('');
            document.getElementById('pairRight').innerHTML = rightItems.map((item, i) => `<div class="pair-item" data-pair="${item.pairIdx}" data-side="right" onclick="selectPair(this)">${item.text}</div>`).join('');
        }
        
        // 짝 연결 단어 읽기
        function speakPairingWords() {
            const leftEl = document.getElementById('pairLeft');
            const rightEl = document.getElementById('pairRight');
            
            if (leftEl.children.length > 0) {
                const leftWords = Array.from(leftEl.querySelectorAll('.pair-item:not(.matched)')).map(el => el.textContent);
                const rightWords = Array.from(rightEl.querySelectorAll('.pair-item:not(.matched)')).map(el => el.textContent);
                
                if (leftWords.length > 0 && rightWords.length > 0) {
                    speak(`왼쪽에는 ${leftWords.join(', ')}가 있고, 오른쪽에는 ${rightWords.join(', ')}가 있습니다. 관련 있는 단어끼리 연결해 주세요.`);
                } else {
                    speak('모든 단어를 연결했습니다. 잘하셨습니다!');
                }
            } else {
                speak('시작 버튼을 눌러 게임을 시작해 주세요.');
            }
        }
        
        function selectPair(el) {
            if (el.classList.contains('matched')) return;
            
            if (!pairSelected) {
                pairSelected = el;
                el.classList.add('selected');
            } else {
                if (pairSelected === el) {
                    pairSelected.classList.remove('selected');
                    pairSelected = null;
                    return;
                }
                
                if (pairSelected.dataset.side === el.dataset.side) {
                    pairSelected.classList.remove('selected');
                    pairSelected = el;
                    el.classList.add('selected');
                    return;
                }
                
                gameState.totalAnswers++;
                if (pairSelected.dataset.pair === el.dataset.pair) {
                    pairSelected.classList.remove('selected');
                    pairSelected.classList.add('matched');
                    el.classList.add('matched');
                    pairMatches++;
                    pairScore += 15;
                    gameState.correctAnswers++;
                    document.getElementById('pairMatches').textContent = pairMatches;
                    document.getElementById('pairScore').textContent = pairScore;
                    playCorrectSound();
                    miniConfetti();
                    
                    if (pairMatches === totalPairsCount) {
                        document.getElementById('pairResult').textContent = '🎉 모두 맞췄습니다!';
                        document.getElementById('pairResult').className = 'result-message success';
                        document.getElementById('pairResult').style.display = 'block';
                        currentGameData = { score: pairScore };
                        setTimeout(() => endGame('pairing', pairScore), 1500);
                    }
                } else {
                    pairSelected.classList.add('wrong');
                    el.classList.add('wrong');
                    setTimeout(() => {
                        pairSelected.classList.remove('selected', 'wrong');
                        el.classList.remove('wrong');
                        pairSelected = null;
                    }, 500);
                    return;
                }
                pairSelected = null;
            }
        }

// ==================== 13. 시간 맞추기 ====================
        let timingRound = 0, timingScore = 0, targetTime = 3, timingInterval = null, currentTime = 0, timingRunning = false, timingBestAccuracy = 9999;
        
        function initTimingGame() {
            timingRound = timingScore = 0;
            timingBestAccuracy = 9999;
            currentTime = 0;
            timingRunning = false;
            document.getElementById('timingRound').textContent = '0';
            document.getElementById('timingScore').textContent = '0';
            document.getElementById('timingResult').style.display = 'none';
            document.getElementById('timingStartBtn').style.display = 'inline-block';
            document.getElementById('timeDisplay').textContent = '0.00';
            document.getElementById('stopBtn').style.display = 'none';
        }
        
        function startTiming() {
            document.getElementById('timingStartBtn').style.display = 'none';
            nextTimingRound();
        }
        
        function nextTimingRound() {
            timingRound++;
            document.getElementById('timingRound').textContent = timingRound;
            document.getElementById('timingResult').style.display = 'none';
            
            if (timingRound > 5) { currentGameData = { accuracy: timingBestAccuracy }; endGame('timing', timingScore); return; }
            
            targetTime = (Math.floor(Math.random() * 5) + 2);
            document.getElementById('timeTarget').textContent = `목표: ${targetTime.toFixed(2)}초에 멈추세요!`;
            
            currentTime = 0;
            document.getElementById('timeDisplay').textContent = '0.00';
            document.getElementById('stopBtn').style.display = 'block';
            
            timingRunning = true;
            timingInterval = setInterval(() => {
                currentTime += 0.01;
                document.getElementById('timeDisplay').textContent = currentTime.toFixed(2);
                if (currentTime >= 10) { clearInterval(timingInterval); stopTiming(); }
            }, 10);
        }
        
        function stopTiming() {
            if (!timingRunning) return;
            timingRunning = false;
            clearInterval(timingInterval);
            
            const s = difficultySettings[userProfile.difficulty].timing;
            const diff = Math.abs(currentTime - targetTime);
            gameState.totalAnswers++;
            
            // 최고 정확도 추적
            if (diff < timingBestAccuracy) timingBestAccuracy = diff;
            
            const res = document.getElementById('timingResult');
            document.getElementById('stopBtn').style.display = 'none';
            
            if (diff <= s.tolerance) {
                const pts = Math.round((1 - diff / s.tolerance) * 20) + 10;
                timingScore += pts;
                gameState.correctAnswers++;
                document.getElementById('timingScore').textContent = timingScore;
                res.textContent = `🎉 훌륭해요! 오차 ${diff.toFixed(2)}초, +${pts}점`;
                res.className = 'result-message success';
                playCorrectSound();
                miniConfetti();
            } else {
                res.textContent = `아쉬워요! 오차 ${diff.toFixed(2)}초`;
                res.className = 'result-message error';
                playWrongSound();
            }
            res.style.display = 'block';
            setTimeout(nextTimingRound, 1500);
        }

// ==================== 14. 거꾸로 말하기 ====================
        const reverseWords2 = ['나비','바다','하늘','사과','포도','우유','토끼','강아지','고양이','햇빛'];
        const reverseWords3 = ['사랑해','고마워','행복해','즐거워','아름다워','기쁘다','새롭다','맑은날','푸른색'];
        const reverseWords4 = ['대한민국','아이스크림','햄버거가','초콜릿이','생일축하해'];
        let reverseQ = 0, reverseScore = 0, reverseWord = '', reverseAnswer = '', reverseInput = '', reverseTimer = null, reverseConsec = 0, reverseMaxConsec = 0;
        
        function initReverseGame() {
            reverseQ = reverseScore = reverseConsec = reverseMaxConsec = 0;
            reverseInput = '';
            document.getElementById('reverseQuestion').textContent = '0';
            document.getElementById('reverseScore').textContent = '0';
            document.getElementById('reverseResult').style.display = 'none';
            document.getElementById('reverseStartBtn').style.display = 'inline-block';
            document.getElementById('reverseWord').textContent = '단어';
            document.getElementById('reverseInput').textContent = '';
            document.getElementById('reverseLetters').innerHTML = '';
            document.getElementById('reverseClearBtn').style.display = 'none';
        }
        
        function startReverse() { document.getElementById('reverseStartBtn').style.display = 'none'; nextReverse(); }
        
        // 거꾸로 단어 읽기
        function speakReverseWord() {
            if (reverseWord) {
                const chars = reverseWord.split('').join(', ');
                speak(`원래 단어는 ${reverseWord}입니다. ${chars}. 이 단어를 거꾸로 입력해 주세요.`);
            } else {
                speak('시작 버튼을 눌러 게임을 시작해 주세요.');
            }
        }
        
        function nextReverse() {
            reverseQ++;
            document.getElementById('reverseQuestion').textContent = reverseQ;
            document.getElementById('reverseResult').style.display = 'none';
            if (reverseQ > 10) { currentGameData = { consecutive: reverseMaxConsec }; endGame('reverse', reverseScore); return; }
            
            const s = difficultySettings[userProfile.difficulty].reverse;
            const wordList = s.wordLength === 2 ? reverseWords2 : s.wordLength === 3 ? reverseWords3 : reverseWords4;
            reverseWord = wordList[Math.floor(Math.random() * wordList.length)];
            reverseAnswer = reverseWord.split('').reverse().join('');
            reverseInput = '';
            
            document.getElementById('reverseWord').textContent = reverseWord;
            document.getElementById('reverseInput').textContent = '';
            
            const letters = shuffleArray(reverseWord.split(''));
            document.getElementById('reverseLetters').innerHTML = letters.map((l, i) => `<button class="letter-btn" data-idx="${i}" onclick="selectReverseLetter(this, '${l}')">${l}</button>`).join('');
            
            startReverseTimer();
        }
        
        function startReverseTimer() {
            const s = difficultySettings[userProfile.difficulty].reverse;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('reverseTimer').style.width = '100%';
            if (reverseTimer) clearInterval(reverseTimer);
            reverseTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('reverseTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(reverseTimer); showReverseResult(false, true); }
            }, 100);
        }
        
        function selectReverseLetter(btn, letter) {
            if (btn.classList.contains('used')) return;
            btn.classList.add('used');
            reverseInput += letter;
            document.getElementById('reverseInput').textContent = reverseInput;
            
            // 지우기 버튼 표시
            if (reverseInput.length > 0) {
                document.getElementById('reverseClearBtn').style.display = 'block';
            }
            
            if (reverseInput.length === reverseAnswer.length) {
                if (reverseTimer) clearInterval(reverseTimer);
                document.getElementById('reverseClearBtn').style.display = 'none';
                showReverseResult(reverseInput === reverseAnswer, false);
            }
        }
        
        function clearReverseInput() {
            reverseInput = '';
            document.getElementById('reverseInput').textContent = '';
            document.querySelectorAll('#reverseLetters .letter-btn').forEach(b => {
                b.classList.remove('used');
            });
            document.getElementById('reverseClearBtn').style.display = 'none';
            // 시각적 피드백
            const inputEl = document.getElementById('reverseInput');
            inputEl.style.borderColor = '#E53935';
            setTimeout(() => {
                inputEl.style.borderColor = '';
            }, 300);
        }
        
        function showReverseResult(correct, timeout) {
            const res = document.getElementById('reverseResult');
            gameState.totalAnswers++;
            document.querySelectorAll('#reverseLetters .letter-btn').forEach(b => b.style.pointerEvents = 'none');
            
            if (correct) { 
                reverseScore += 10; gameState.correctAnswers++; 
                reverseConsec++; if (reverseConsec > reverseMaxConsec) reverseMaxConsec = reverseConsec;
                document.getElementById('reverseScore').textContent = reverseScore; 
                res.textContent = '🎉 정답! +10점'; res.className = 'result-message success'; playCorrectSound(); miniConfetti(); 
            } else { 
                reverseConsec = 0;
                res.textContent = timeout ? `⏰ 시간 초과! 정답: ${reverseAnswer}` : `❌ 틀렸습니다! 정답: ${reverseAnswer}`; 
                res.className = 'result-message error'; playWrongSound(); 
            }
            res.style.display = 'block';
            setTimeout(nextReverse, 1200);
        }

// ==================== 15. 카테고리 분류 ====================
        const categoryData = [
            { name: '과일', icon: '🍎', items: ['사과','바나나','포도','딸기','수박','오렌지','복숭아','체리','키위','망고'] },
            { name: '채소', icon: '🥬', items: ['배추','무','당근','오이','토마토','양파','감자','고구마','시금치','파'] },
            { name: '동물', icon: '🐶', items: ['강아지','고양이','토끼','호랑이','코끼리','기린','사자','원숭이','곰','여우'] },
            { name: '가전제품', icon: '📺', items: ['텔레비전','냉장고','세탁기','전자레인지','에어컨','선풍기','청소기','다리미','밥솥','믹서기'] },
            { name: '탈것', icon: '🚗', items: ['자동차','버스','기차','비행기','자전거','오토바이','배','택시','트럭','지하철'] },
            { name: '신체부위', icon: '👁️', items: ['눈','코','입','귀','손','발','팔','다리','머리','배'] },
            { name: '계절/날씨', icon: '☀️', items: ['봄','여름','가을','겨울','비','눈','바람','구름','햇빛','무지개'] },
            { name: '색깔', icon: '🎨', items: ['빨강','파랑','노랑','초록','보라','주황','검정','하양','분홍','갈색'] }
        ];
        
        const distractorWords = ['행복','시간','음악','공부','운동','여행','친구','가족','학교','회사','책상','의자','창문','문','벽','바닥','천장','거울'];
        
        let categoryQ = 0, categoryScore = 0, currentCategory = null, correctItems = [], selectedItems = [], categoryTimer = null, categoryConsec = 0, categoryMaxConsec = 0;
        
        function initCategoryGame() {
            categoryQ = categoryScore = categoryConsec = categoryMaxConsec = 0;
            selectedItems = [];
            document.getElementById('categoryQuestion').textContent = '0';
            document.getElementById('categoryScore').textContent = '0';
            document.getElementById('categoryResult').style.display = 'none';
            document.getElementById('categoryStartBtn').style.display = 'inline-block';
            document.getElementById('categorySubmitBtn').style.display = 'none';
            document.getElementById('categoryTitle').textContent = '시작을 눌러주세요!';
            document.getElementById('categoryOptions').innerHTML = '';
        }
        
        function startCategory() {
            document.getElementById('categoryStartBtn').style.display = 'none';
            nextCategory();
        }
        
        function nextCategory() {
            categoryQ++;
            document.getElementById('categoryQuestion').textContent = categoryQ;
            document.getElementById('categoryResult').style.display = 'none';
            document.getElementById('categorySubmitBtn').style.display = 'none';
            selectedItems = [];
            
            if (categoryQ > 10) { 
                currentGameData = { consecutive: categoryMaxConsec };
                endGame('category', categoryScore); 
                return; 
            }
            
            const s = difficultySettings[userProfile.difficulty].category;
            currentCategory = categoryData[Math.floor(Math.random() * categoryData.length)];
            
            // 정답 아이템 선택
            const shuffledCorrect = shuffleArray([...currentCategory.items]);
            correctItems = shuffledCorrect.slice(0, s.correctCount);
            
            // 오답 아이템 (다른 카테고리 + 방해 단어)
            let wrongItems = [];
            const otherCategories = categoryData.filter(c => c.name !== currentCategory.name);
            otherCategories.forEach(c => wrongItems.push(...c.items.slice(0, 2)));
            wrongItems.push(...distractorWords);
            wrongItems = shuffleArray(wrongItems).slice(0, s.itemCount - s.correctCount);
            
            // 모든 아이템 섞기
            const allItems = shuffleArray([...correctItems, ...wrongItems]);
            
            document.getElementById('categoryTitle').textContent = `${currentCategory.icon} ${currentCategory.name}을(를) 모두 고르세요!`;
            document.getElementById('categoryOptions').innerHTML = allItems.map(item => 
                `<div class="category-item" onclick="toggleCategoryItem(this, '${item}')">${item}</div>`
            ).join('');
            
            startCategoryTimer();
        }
        
        function startCategoryTimer() {
            const s = difficultySettings[userProfile.difficulty].category;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('categoryTimer').style.width = '100%';
            if (categoryTimer) clearInterval(categoryTimer);
            categoryTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('categoryTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(categoryTimer); showCategoryResult(false, true); }
            }, 100);
        }
        
        function toggleCategoryItem(el, item) {
            if (el.classList.contains('selected')) {
                el.classList.remove('selected');
                selectedItems = selectedItems.filter(i => i !== item);
            } else {
                el.classList.add('selected');
                selectedItems.push(item);
            }
            document.getElementById('categorySubmitBtn').style.display = selectedItems.length > 0 ? 'inline-block' : 'none';
        }
        
        function submitCategory() {
            if (categoryTimer) clearInterval(categoryTimer);
            
            // 정답 확인
            const correctSelected = selectedItems.filter(item => correctItems.includes(item));
            const wrongSelected = selectedItems.filter(item => !correctItems.includes(item));
            const isCorrect = correctSelected.length === correctItems.length && wrongSelected.length === 0;
            
            // 시각적 피드백
            document.querySelectorAll('.category-item').forEach(el => {
                const item = el.textContent;
                if (correctItems.includes(item)) {
                    el.classList.add('correct');
                } else if (selectedItems.includes(item)) {
                    el.classList.add('wrong');
                }
            });
            
            showCategoryResult(isCorrect, false);
        }
        
        function showCategoryResult(correct, timeout) {
            const res = document.getElementById('categoryResult');
            gameState.totalAnswers++;
            document.getElementById('categorySubmitBtn').style.display = 'none';
            
            if (correct) {
                categoryScore += 10;
                gameState.correctAnswers++;
                categoryConsec++;
                if (categoryConsec > categoryMaxConsec) categoryMaxConsec = categoryConsec;
                document.getElementById('categoryScore').textContent = categoryScore;
                res.textContent = '🎉 정답! +10점';
                res.className = 'result-message success';
                playCorrectSound();
                miniConfetti();
            } else {
                categoryConsec = 0;
                const missedItems = correctItems.filter(item => !selectedItems.includes(item));
                res.textContent = timeout ? `⏰ 시간 초과! 정답: ${correctItems.join(', ')}` : `❌ 틀렸습니다! 정답: ${correctItems.join(', ')}`;
                res.className = 'result-message error';
                playWrongSound();
            }
            res.style.display = 'block';
            setTimeout(nextCategory, 1500);
        }

// ==================== 16. 이야기 순서 ====================
        const storySequences = [
            { title: '아침 일과', cards: [
                { emoji: '😴', label: '잠자기' },
                { emoji: '⏰', label: '알람 소리' },
                { emoji: '🛏️', label: '일어나기' },
                { emoji: '🪥', label: '세수하기' },
                { emoji: '🍚', label: '아침 먹기' }
            ]},
            { title: '빨래하기', cards: [
                { emoji: '👕', label: '옷 모으기' },
                { emoji: '🧺', label: '세탁기 넣기' },
                { emoji: '💧', label: '세제 넣기' },
                { emoji: '🔄', label: '돌리기' },
                { emoji: '☀️', label: '널어 말리기' }
            ]},
            { title: '요리하기', cards: [
                { emoji: '📝', label: '레시피 보기' },
                { emoji: '🥬', label: '재료 준비' },
                { emoji: '🔪', label: '썰기' },
                { emoji: '🍳', label: '조리하기' },
                { emoji: '🍽️', label: '담아내기' }
            ]},
            { title: '외출하기', cards: [
                { emoji: '👔', label: '옷 입기' },
                { emoji: '👟', label: '신발 신기' },
                { emoji: '🔑', label: '열쇠 챙기기' },
                { emoji: '🚪', label: '문 잠그기' },
                { emoji: '🚶', label: '걸어가기' }
            ]},
            { title: '전화하기', cards: [
                { emoji: '📱', label: '전화기 들기' },
                { emoji: '🔢', label: '번호 누르기' },
                { emoji: '📞', label: '신호 기다리기' },
                { emoji: '👋', label: '인사하기' },
                { emoji: '💬', label: '대화하기' }
            ]},
            { title: '꽃 심기', cards: [
                { emoji: '🕳️', label: '땅 파기' },
                { emoji: '🌱', label: '씨앗 넣기' },
                { emoji: '🪨', label: '흙 덮기' },
                { emoji: '💧', label: '물 주기' },
                { emoji: '🌸', label: '꽃 피기' }
            ]},
            { title: '책 읽기', cards: [
                { emoji: '📚', label: '책 고르기' },
                { emoji: '🛋️', label: '앉기' },
                { emoji: '📖', label: '책 펴기' },
                { emoji: '👀', label: '읽기' },
                { emoji: '📕', label: '책 덮기' }
            ]},
            { title: '편지 보내기', cards: [
                { emoji: '✏️', label: '글 쓰기' },
                { emoji: '📄', label: '종이 접기' },
                { emoji: '✉️', label: '봉투에 넣기' },
                { emoji: '📮', label: '우체통 넣기' },
                { emoji: '🚚', label: '배달되기' }
            ]}
        ];
        
        let storyQ = 0, storyScore = 0, currentStory = null, storyOrder = [], storyTimer = null, storyConsec = 0, storyMaxConsec = 0;
        
        function initStoryGame() {
            storyQ = storyScore = storyConsec = storyMaxConsec = 0;
            storyOrder = [];
            document.getElementById('storyQuestion').textContent = '0';
            document.getElementById('storyScore').textContent = '0';
            document.getElementById('storyResult').style.display = 'none';
            document.getElementById('storyStartBtn').style.display = 'inline-block';
            document.getElementById('storyClearBtn').style.display = 'none';
            document.getElementById('storyInstruction').textContent = '시작을 눌러주세요!';
            document.getElementById('storyCards').innerHTML = '';
            document.getElementById('orderDisplay').innerHTML = '';
        }
        
        function startStory() {
            document.getElementById('storyStartBtn').style.display = 'none';
            nextStory();
        }
        
        function nextStory() {
            storyQ++;
            document.getElementById('storyQuestion').textContent = storyQ;
            document.getElementById('storyResult').style.display = 'none';
            document.getElementById('storyClearBtn').style.display = 'none';
            storyOrder = [];
            document.getElementById('orderDisplay').innerHTML = '';
            
            if (storyQ > 10) { 
                currentGameData = { consecutive: storyMaxConsec };
                endGame('story', storyScore); 
                return; 
            }
            
            const s = difficultySettings[userProfile.difficulty].story;
            currentStory = storySequences[Math.floor(Math.random() * storySequences.length)];
            
            // 카드 개수만큼 선택
            const selectedCards = currentStory.cards.slice(0, s.cardCount);
            const shuffledCards = shuffleArray([...selectedCards]);
            
            document.getElementById('storyInstruction').textContent = `"${currentStory.title}" 순서대로 눌러주세요!`;
            document.getElementById('storyCards').innerHTML = shuffledCards.map((card, idx) => 
                `<div class="story-card" data-idx="${currentStory.cards.indexOf(card)}" onclick="selectStoryCard(this)">
                    ${card.emoji}
                    <span class="card-label">${card.label}</span>
                </div>`
            ).join('');
            
            startStoryTimer();
        }
        
        function startStoryTimer() {
            const s = difficultySettings[userProfile.difficulty].story;
            let timeLeft = 100;
            const dec = 100 / (s.timeLimit / 100);
            document.getElementById('storyTimer').style.width = '100%';
            if (storyTimer) clearInterval(storyTimer);
            storyTimer = setInterval(() => {
                timeLeft -= dec;
                document.getElementById('storyTimer').style.width = Math.max(0, timeLeft) + '%';
                if (timeLeft <= 0) { clearInterval(storyTimer); showStoryResult(false, true); }
            }, 100);
        }
        
        function selectStoryCard(el) {
            if (el.classList.contains('selected')) return;
            
            el.classList.add('selected');
            storyOrder.push(parseInt(el.dataset.idx));
            el.dataset.order = storyOrder.length;
            
            // 선택 순서 표시
            document.getElementById('orderDisplay').innerHTML = storyOrder.map((_, i) => 
                `<span class="order-item">${i + 1}</span>`
            ).join('');
            
            document.getElementById('storyClearBtn').style.display = 'block';
            
            const s = difficultySettings[userProfile.difficulty].story;
            if (storyOrder.length === s.cardCount) {
                if (storyTimer) clearInterval(storyTimer);
                checkStoryOrder();
            }
        }
        
        function clearStoryOrder() {
            storyOrder = [];
            document.querySelectorAll('.story-card').forEach(card => {
                card.classList.remove('selected');
                delete card.dataset.order;
            });
            document.getElementById('orderDisplay').innerHTML = '';
            document.getElementById('storyClearBtn').style.display = 'none';
        }
        
        function checkStoryOrder() {
            const s = difficultySettings[userProfile.difficulty].story;
            const correctOrder = Array.from({length: s.cardCount}, (_, i) => i);
            const isCorrect = JSON.stringify(storyOrder) === JSON.stringify(correctOrder);
            
            // 시각적 피드백
            document.querySelectorAll('.story-card').forEach(card => {
                const idx = parseInt(card.dataset.idx);
                const orderPos = storyOrder.indexOf(idx);
                if (orderPos === idx) {
                    card.classList.add('correct');
                } else if (orderPos !== -1) {
                    card.classList.add('wrong');
                }
            });
            
            showStoryResult(isCorrect, false);
        }
        
        function showStoryResult(correct, timeout) {
            const res = document.getElementById('storyResult');
            gameState.totalAnswers++;
            document.getElementById('storyClearBtn').style.display = 'none';
            
            if (correct) {
                storyScore += 10;
                gameState.correctAnswers++;
                storyConsec++;
                if (storyConsec > storyMaxConsec) storyMaxConsec = storyConsec;
                document.getElementById('storyScore').textContent = storyScore;
                res.textContent = '🎉 정답! +10점';
                res.className = 'result-message success';
                playCorrectSound();
                miniConfetti();
            } else {
                storyConsec = 0;
                res.textContent = timeout ? '⏰ 시간 초과!' : '❌ 순서가 틀렸습니다!';
                res.className = 'result-message error';
                playWrongSound();
            }
            res.style.display = 'block';
            setTimeout(nextStory, 1500);
        }
