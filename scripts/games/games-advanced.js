// ==================== 새로운 9종 게임 (레벨 1~10) ====================
        
        // 17. 미로 탈출 (공간지각)
        let mazeLevel = 1, mazeMoves = 0, mazeGrid = [], playerPos = {x:0, y:0}, goalPos = {x:0, y:0}, mazeStarted = false;
        
        function initMazeGame() {
            mazeLevel = gameLevels['maze'] || 1;
            if(mazeLevel > 10) mazeLevel = 10;
            mazeMoves = 0;
            mazeStarted = false;
            document.getElementById('mazeLevel').textContent = mazeLevel;
            document.getElementById('mazeMoves').textContent = 0;
            document.getElementById('mazeResult').style.display = 'none';
            document.getElementById('mazeContainer').innerHTML = '<p style="color:white;text-align:center;padding:30px;">시작 버튼을 눌러주세요!</p>';
            document.getElementById('mazeStartBtn').textContent = '시작';
            document.getElementById('mazeStartBtn').style.display = '';
        }
        
        function startMaze() {
            mazeStarted = true;
            mazeMoves = 0;
            document.getElementById('mazeMoves').textContent = 0;
            const size = Math.min(4 + Math.floor(mazeLevel / 2), 9);
            generateMaze(size);
            document.getElementById('mazeStartBtn').style.display = 'none';
            document.getElementById('mazeResult').style.display = 'none';
        }
        
        function generateMaze(size) {
            mazeGrid = [];
            for(let y = 0; y < size; y++) {
                mazeGrid[y] = [];
                for(let x = 0; x < size; x++) {
                    mazeGrid[y][x] = Math.random() < (0.2 + mazeLevel * 0.02) ? 1 : 0;
                }
            }
            playerPos = {x: 0, y: 0};
            goalPos = {x: size-1, y: size-1};
            mazeGrid[0][0] = 0; mazeGrid[size-1][size-1] = 0;
            mazeGrid[0][1] = 0; mazeGrid[1][0] = 0;
            mazeGrid[size-1][size-2] = 0; mazeGrid[size-2][size-1] = 0;
            mazeMoves = 0;
            document.getElementById('mazeMoves').textContent = 0;
            renderMaze();
        }
        
        function renderMaze() {
            const container = document.getElementById('mazeContainer');
            const size = mazeGrid.length;
            container.style.gridTemplateColumns = `repeat(${size}, 35px)`;
            container.innerHTML = '';
            for(let y = 0; y < size; y++) {
                for(let x = 0; x < size; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'maze-cell';
                    if(x === playerPos.x && y === playerPos.y) { cell.classList.add('player'); cell.textContent = '🐭'; }
                    else if(x === goalPos.x && y === goalPos.y) { cell.classList.add('goal'); cell.textContent = '🧀'; }
                    else if(mazeGrid[y][x] === 1) { cell.classList.add('wall'); }
                    else { cell.classList.add('path'); }
                    container.appendChild(cell);
                }
            }
        }
        
        function moveMaze(dir) {
            if(!mazeStarted || !mazeGrid.length) return;
            let nx = playerPos.x, ny = playerPos.y;
            if(dir === 'up') ny--; if(dir === 'down') ny++; if(dir === 'left') nx--; if(dir === 'right') nx++;
            if(nx < 0 || nx >= mazeGrid.length || ny < 0 || ny >= mazeGrid.length || mazeGrid[ny][nx] === 1) return;
            playerPos = {x: nx, y: ny};
            mazeMoves++;
            document.getElementById('mazeMoves').textContent = mazeMoves;
            renderMaze();
            if(nx === goalPos.x && ny === goalPos.y) completeMaze();
        }
        
        function completeMaze() {
            mazeStarted = false;
            const score = Math.max(100 + mazeLevel * 10 - mazeMoves * 2, 30);
            showGameResult('mazeResult', true, `🎉 탈출 성공! +${score}점`);
            addScore(score);
            gameState.correctAnswers++; gameState.totalAnswers++;
            gameLevelCounts['maze'] = (gameLevelCounts['maze'] || 0) + 1;
            let leveledUp = false;
            if(gameLevelCounts['maze'] >= 2 && mazeLevel < 10) {
                mazeLevel++; 
                gameLevels['maze'] = mazeLevel; 
                gameLevelCounts['maze'] = 0;
                leveledUp = true;
                showLevelUpMessage('maze');
            }
            saveLevel();
            document.getElementById('mazeLevel').textContent = mazeLevel;
            updateLevelDisplay('maze');
            document.getElementById('mazeStartBtn').textContent = '다음 문제';
            document.getElementById('mazeStartBtn').style.display = leveledUp ? 'none' : '';
            if (leveledUp) {
                setTimeout(() => startMaze(), 500);
            }
        }
        
        // 18. 멜로디 기억 (기억력)
        let melodyLevel = 1, melodyScore = 0, melodyPattern = [], melodyInput = [], melodyPlaying = false, melodyAudioCtx = null;
        const noteFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
        
        function initMelodyGame() {
            melodyLevel = gameLevels['melody'] || 1;
            if(melodyLevel > 10) melodyLevel = 10;
            melodyScore = 0;
            melodyPattern = []; melodyInput = [];
            document.getElementById('melodyLevel').textContent = melodyLevel;
            document.getElementById('melodyScore').textContent = 0;
            document.getElementById('melodyResult').style.display = 'none';
            document.getElementById('melodyInstruction').textContent = '시작 버튼을 눌러주세요!';
            document.getElementById('melodyStartBtn').textContent = '시작';
            document.getElementById('melodyStartBtn').style.display = '';
            enablePiano(false);
        }
        
        function startMelody() {
            if(!melodyAudioCtx) melodyAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(melodyAudioCtx.state === 'suspended') melodyAudioCtx.resume();
            melodyPattern = []; melodyInput = [];
            const len = Math.min(2 + melodyLevel, 10);
            for(let i = 0; i < len; i++) melodyPattern.push(Math.floor(Math.random() * 7));
            document.getElementById('melodyInstruction').textContent = '🎵 멜로디를 들어보세요...';
            document.getElementById('melodyResult').style.display = 'none';
            document.getElementById('melodyStartBtn').style.display = 'none';
            enablePiano(false);
            playMelodyPattern();
        }
        
        function playMelodyPattern() {
            melodyPlaying = true;
            let i = 0;
            const interval = setInterval(() => {
                if(i >= melodyPattern.length) {
                    clearInterval(interval); melodyPlaying = false;
                    document.getElementById('melodyInstruction').textContent = '이제 따라 눌러주세요!';
                    enablePiano(true); return;
                }
                playNoteSound(melodyPattern[i]); highlightKey(melodyPattern[i]); i++;
            }, 600);
        }
        
        function playNoteSound(note) {
            if(!melodyAudioCtx) return;
            try {
                const osc = melodyAudioCtx.createOscillator();
                const gain = melodyAudioCtx.createGain();
                osc.connect(gain); gain.connect(melodyAudioCtx.destination);
                osc.frequency.value = noteFreqs[note]; osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, melodyAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, melodyAudioCtx.currentTime + 0.4);
                osc.start(melodyAudioCtx.currentTime); osc.stop(melodyAudioCtx.currentTime + 0.4);
            } catch(e) { console.log('Audio error:', e); }
        }
        
        function highlightKey(note) {
            const keys = document.querySelectorAll('.piano-key');
            if(keys[note]) { keys[note].classList.add('active'); setTimeout(() => keys[note].classList.remove('active'), 300); }
        }
        
        function playNote(note) {
            if(melodyPlaying) return;
            playNoteSound(note); highlightKey(note);
            melodyInput.push(note);
            if(melodyInput[melodyInput.length-1] !== melodyPattern[melodyInput.length-1]) {
                showGameResult('melodyResult', false, '❌ 틀렸어요!');
                gameState.totalAnswers++; enablePiano(false);
                gameLevelCounts['melody'] = 0; // 실패 시 카운트 리셋
                document.getElementById('melodyStartBtn').textContent = '다시 시작';
                document.getElementById('melodyStartBtn').style.display = ''; return;
            }
            if(melodyInput.length === melodyPattern.length) {
                const score = 50 + melodyLevel * 15;
                melodyScore += score;
                showGameResult('melodyResult', true, `🎉 정답! +${score}점`);
                addScore(score); gameState.correctAnswers++; gameState.totalAnswers++;
                gameLevelCounts['melody'] = (gameLevelCounts['melody'] || 0) + 1;
                let leveledUp = false;
                if(gameLevelCounts['melody'] >= 2 && melodyLevel < 10) {
                    melodyLevel++; 
                    gameLevels['melody'] = melodyLevel; 
                    gameLevelCounts['melody'] = 0;
                    leveledUp = true;
                    showLevelUpMessage('melody');
                }
                saveLevel();
                document.getElementById('melodyLevel').textContent = melodyLevel;
                document.getElementById('melodyScore').textContent = melodyScore;
                updateLevelDisplay('melody');
                enablePiano(false);
                document.getElementById('melodyStartBtn').textContent = '다음 문제';
                document.getElementById('melodyStartBtn').style.display = leveledUp ? 'none' : '';
                if (leveledUp) {
                    setTimeout(() => startMelody(), 500);
                }
            }
        }
        
        function enablePiano(enable) {
            document.querySelectorAll('.piano-key').forEach(k => k.disabled = !enable);
        }
        
        // 19. 퍼즐 맞추기 (공간지각)
        let puzzleLevel = 1, puzzleMoves = 0, puzzleBoard = [], puzzleSize = 3, emptyPos = {x:0,y:0};
        
        function initPuzzleGame() {
            puzzleLevel = gameLevels['puzzle'] || 1;
            if(puzzleLevel > 10) puzzleLevel = 10;
            puzzleMoves = 0;
            document.getElementById('puzzleLevel').textContent = puzzleLevel;
            document.getElementById('puzzleMoves').textContent = 0;
            document.getElementById('puzzleResult').style.display = 'none';
            document.getElementById('puzzleContainer').innerHTML = '<p style="color:white;text-align:center;padding:40px;">시작 버튼을 눌러주세요!</p>';
            document.getElementById('puzzleStartBtn').textContent = '시작';
            document.getElementById('puzzleStartBtn').style.display = '';
        }
        
        function startPuzzle() {
            puzzleSize = Math.min(3 + Math.floor((puzzleLevel - 1) / 3), 5);
            generatePuzzle(puzzleSize);
            document.getElementById('puzzleStartBtn').style.display = 'none';
            document.getElementById('puzzleResult').style.display = 'none';
        }
        
        function generatePuzzle(size) {
            puzzleBoard = [];
            const total = size * size;
            for(let i = 0; i < total - 1; i++) puzzleBoard.push(i + 1);
            puzzleBoard.push(0);
            for(let i = 0; i < 100 + puzzleLevel * 20; i++) {
                const a = Math.floor(Math.random() * (total-1));
                const b = Math.floor(Math.random() * (total-1));
                [puzzleBoard[a], puzzleBoard[b]] = [puzzleBoard[b], puzzleBoard[a]];
            }
            for(let i = 0; i < total; i++) { if(puzzleBoard[i] === 0) { emptyPos = {x: i % size, y: Math.floor(i / size)}; break; } }
            puzzleMoves = 0;
            document.getElementById('puzzleMoves').textContent = 0;
            renderPuzzle(size);
        }
        
        function renderPuzzle(size) {
            const container = document.getElementById('puzzleContainer');
            container.style.gridTemplateColumns = `repeat(${size}, 60px)`;
            container.innerHTML = '';
            puzzleBoard.forEach((val, idx) => {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece' + (val === 0 ? ' empty' : '');
                piece.textContent = val === 0 ? '' : val;
                piece.onclick = () => movePuzzle(idx % size, Math.floor(idx / size), size);
                container.appendChild(piece);
            });
        }
        
        function movePuzzle(x, y, size) {
            const dx = Math.abs(x - emptyPos.x), dy = Math.abs(y - emptyPos.y);
            if((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                const idx = y * size + x, emptyIdx = emptyPos.y * size + emptyPos.x;
                [puzzleBoard[idx], puzzleBoard[emptyIdx]] = [puzzleBoard[emptyIdx], puzzleBoard[idx]];
                emptyPos = {x, y}; puzzleMoves++;
                document.getElementById('puzzleMoves').textContent = puzzleMoves;
                renderPuzzle(size);
                if(checkPuzzleSolved()) completePuzzle();
            }
        }
        
        function checkPuzzleSolved() {
            for(let i = 0; i < puzzleBoard.length - 1; i++) { if(puzzleBoard[i] !== i + 1) return false; }
            return true;
        }
        
        function completePuzzle() {
            const score = Math.max(150 + puzzleLevel * 20 - puzzleMoves * 2, 50);
            showGameResult('puzzleResult', true, `🎉 퍼즐 완성! +${score}점`);
            addScore(score); gameState.correctAnswers++; gameState.totalAnswers++;
            gameLevelCounts['puzzle'] = (gameLevelCounts['puzzle'] || 0) + 1;
            let leveledUp = false;
            if(gameLevelCounts['puzzle'] >= 2 && puzzleLevel < 10) {
                puzzleLevel++; 
                gameLevels['puzzle'] = puzzleLevel; 
                gameLevelCounts['puzzle'] = 0;
                leveledUp = true;
                showLevelUpMessage('puzzle');
            }
            saveLevel();
            document.getElementById('puzzleLevel').textContent = puzzleLevel;
            updateLevelDisplay('puzzle');
            document.getElementById('puzzleStartBtn').textContent = '다음 문제';
            document.getElementById('puzzleStartBtn').style.display = leveledUp ? 'none' : '';
            if (leveledUp) {
                setTimeout(() => startPuzzle(), 500);
            }
        }
        
        // 20. 보물 찾기 (탐구력)
        let treasureLevel = 1, treasureTries = 0, treasureMaxTries = 5, treasurePos = {x:0,y:0}, treasureFound = false;
        
        function initTreasureGame() {
            treasureLevel = gameLevels['treasure'] || 1;
            if(treasureLevel > 10) treasureLevel = 10;
            treasureTries = 0; treasureFound = false;
            treasureMaxTries = Math.max(6 - Math.floor(treasureLevel / 2), 3);
            document.getElementById('treasureLevel').textContent = treasureLevel;
            document.getElementById('treasureTries').textContent = '0/' + treasureMaxTries;
            document.getElementById('treasureResult').style.display = 'none';
            document.getElementById('treasureHint').textContent = '💡 시작 버튼을 눌러주세요!';
            document.getElementById('treasureGrid').innerHTML = '';
            document.getElementById('treasureStartBtn').textContent = '시작';
            document.getElementById('treasureStartBtn').style.display = '';
        }
        
        function startTreasure() {
            treasureFound = false; treasureTries = 0;
            treasureMaxTries = Math.max(6 - Math.floor(treasureLevel / 2), 3);
            document.getElementById('treasureTries').textContent = '0/' + treasureMaxTries;
            treasurePos = {x: Math.floor(Math.random()*5), y: Math.floor(Math.random()*5)};
            renderTreasureGrid();
            document.getElementById('treasureHint').textContent = '💡 아무 곳이나 파보세요!';
            document.getElementById('treasureResult').style.display = 'none';
            document.getElementById('treasureStartBtn').textContent = '다시 시작';
        }
        
        function renderTreasureGrid() {
            const grid = document.getElementById('treasureGrid');
            grid.innerHTML = '';
            for(let y = 0; y < 5; y++) {
                for(let x = 0; x < 5; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'treasure-cell'; cell.textContent = '❓';
                    cell.onclick = () => digTreasure(x, y, cell);
                    grid.appendChild(cell);
                }
            }
        }
        
        function digTreasure(x, y, cell) {
            if(treasureFound || treasureTries >= treasureMaxTries) return;
            treasureTries++;
            document.getElementById('treasureTries').textContent = treasureTries + '/' + treasureMaxTries;
            if(x === treasurePos.x && y === treasurePos.y) {
                cell.textContent = '💎'; cell.classList.add('found'); treasureFound = true;
                const score = 100 + (treasureMaxTries - treasureTries) * 30 + treasureLevel * 10;
                showGameResult('treasureResult', true, `🎉 보물 발견! +${score}점`);
                addScore(score); gameState.correctAnswers++; gameState.totalAnswers++;
                gameLevelCounts['treasure'] = (gameLevelCounts['treasure'] || 0) + 1;
                let leveledUp = false;
                if(gameLevelCounts['treasure'] >= 2 && treasureLevel < 10) {
                    treasureLevel++; 
                    gameLevels['treasure'] = treasureLevel; 
                    gameLevelCounts['treasure'] = 0;
                    leveledUp = true;
                    showLevelUpMessage('treasure');
                }
                saveLevel();
                document.getElementById('treasureLevel').textContent = treasureLevel;
                updateLevelDisplay('treasure');
                document.getElementById('treasureStartBtn').textContent = '다음 문제';
                document.getElementById('treasureStartBtn').style.display = leveledUp ? 'none' : '';
                if (leveledUp) {
                    setTimeout(() => startTreasure(), 500);
                }
            } else {
                cell.textContent = '💨'; cell.classList.add('revealed');
                const hints = [];
                if(x < treasurePos.x) hints.push('➡️ 오른쪽'); if(x > treasurePos.x) hints.push('⬅️ 왼쪽');
                if(y < treasurePos.y) hints.push('⬇️ 아래쪽'); if(y > treasurePos.y) hints.push('⬆️ 위쪽');
                document.getElementById('treasureHint').textContent = '💡 힌트: ' + hints.join(', ') + '에 있어요!';
                if(treasureTries >= treasureMaxTries) {
                    showGameResult('treasureResult', false, '❌ 기회 소진!'); 
                    gameState.totalAnswers++;
                    gameLevelCounts['treasure'] = 0; // 실패 시 카운트 리셋
                    document.getElementById('treasureStartBtn').textContent = '다시 시작';
                    document.getElementById('treasureStartBtn').style.display = '';
                }
            }
        }
        
        // 21. 그림자 매칭 (공간지각)
        let shadowQ = 0, shadowScore = 0, shadowLevel = 1, shadowTimer = null;
        const shadowObjects = ['🍎','🍌','🚗','✈️','🏠','⭐','❤️','🌙','🔔','🎈','🐱','🐶','🌸','🍀','☀️','🎸','📚','⚽','🎁','🍕'];
        
        function initShadowGame() {
            shadowLevel = gameLevels['shadow'] || 1;
            if(shadowLevel > 10) shadowLevel = 10;
            shadowQ = shadowScore = 0;
            document.getElementById('shadowLevel').textContent = shadowLevel;
            document.getElementById('shadowQuestion').textContent = '0';
            document.getElementById('shadowScore').textContent = '0';
            document.getElementById('shadowResult').style.display = 'none';
            document.getElementById('shadowOptions').innerHTML = '';
            document.getElementById('shadowStartBtn').textContent = '시작';
            document.getElementById('shadowStartBtn').style.display = '';
            if(shadowTimer) { clearInterval(shadowTimer); shadowTimer = null; }
        }
        
        function startShadow() {
            shadowQ = shadowScore = 0;
            document.getElementById('shadowStartBtn').style.display = 'none';
            nextShadow();
        }
        
        function nextShadow() {
            if(shadowQ >= 10) return completeShadowGame();
            shadowQ++;
            document.getElementById('shadowQuestion').textContent = shadowQ;
            const correct = shadowObjects[Math.floor(Math.random() * Math.min(10 + shadowLevel, shadowObjects.length))];
            document.getElementById('shadowObject').textContent = correct;
            const options = [correct];
            while(options.length < 4) {
                const opt = shadowObjects[Math.floor(Math.random() * shadowObjects.length)];
                if(!options.includes(opt)) options.push(opt);
            }
            options.sort(() => Math.random() - 0.5);
            const container = document.getElementById('shadowOptions');
            container.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('div');
                btn.className = 'shadow-option'; btn.textContent = opt;
                btn.onclick = () => checkShadow(opt, correct);
                container.appendChild(btn);
            });
            document.getElementById('shadowResult').style.display = 'none';
            startTimerNew('shadowTimer', Math.max(10 - shadowLevel, 4), () => { gameState.totalAnswers++; nextShadow(); });
        }
        
        function checkShadow(selected, correct) {
            if(shadowTimer) { clearInterval(shadowTimer); shadowTimer = null; }
            gameState.totalAnswers++;
            if(selected === correct) {
                shadowScore += 10 + shadowLevel; document.getElementById('shadowScore').textContent = shadowScore;
                gameState.correctAnswers++;
                showGameResult('shadowResult', true, '⭕ 정답!');
            } else { showGameResult('shadowResult', false, '❌ 틀렸어요!'); }
            setTimeout(() => { document.getElementById('shadowResult').style.display = 'none'; nextShadow(); }, 800);
        }
        
        function completeShadowGame() {
            addScore(shadowScore);
            gameLevelCounts['shadow'] = (gameLevelCounts['shadow'] || 0) + 1;
            let leveledUp = false;
            if(gameLevelCounts['shadow'] >= 2 && shadowLevel < 10) {
                shadowLevel++; 
                gameLevels['shadow'] = shadowLevel; 
                gameLevelCounts['shadow'] = 0;
                leveledUp = true;
                showLevelUpMessage('shadow');
            }
            saveLevel();
            document.getElementById('shadowLevel').textContent = shadowLevel;
            updateLevelDisplay('shadow');
            showGameResult('shadowResult', true, `🎉 완료! ${shadowScore}점 획득!`);
            document.getElementById('shadowStartBtn').textContent = '다시 하기';
            document.getElementById('shadowStartBtn').style.display = leveledUp ? 'none' : '';
            if (leveledUp) {
                setTimeout(() => startShadow(), 500);
            }
        }
        
        // 22. 집중 타겟 (집중력)
        let focusScore = 0, focusTime = 30, focusLevel = 1, focusInterval = null, focusSpawnInterval = null;
        
        function initFocusGame() {
            focusLevel = gameLevels['focus'] || 1;
            if(focusLevel > 10) focusLevel = 10;
            focusScore = 0; focusTime = 30;
            document.getElementById('focusLevel').textContent = focusLevel;
            document.getElementById('focusScore').textContent = '0';
            document.getElementById('focusTime').textContent = '30';
            document.getElementById('focusResult').style.display = 'none';
            document.getElementById('focusArena').innerHTML = '';
            document.getElementById('focusStartBtn').textContent = '시작';
            document.getElementById('focusStartBtn').style.display = '';
            if(focusInterval) clearInterval(focusInterval);
            if(focusSpawnInterval) clearInterval(focusSpawnInterval);
        }
        
        function startFocus() {
            focusScore = 0; focusTime = 30 + focusLevel * 2;
            document.getElementById('focusScore').textContent = '0';
            document.getElementById('focusTime').textContent = focusTime;
            document.getElementById('focusArena').innerHTML = '';
            document.getElementById('focusStartBtn').style.display = 'none';
            document.getElementById('focusResult').style.display = 'none';
            focusInterval = setInterval(() => {
                focusTime--;
                document.getElementById('focusTime').textContent = focusTime;
                if(focusTime <= 0) endFocus();
            }, 1000);
            const spawnRate = Math.max(900 - focusLevel * 50, 400);
            focusSpawnInterval = setInterval(spawnFocusTarget, spawnRate);
        }
        
        function spawnFocusTarget() {
            const arena = document.getElementById('focusArena');
            if(!arena) return;
            const target = document.createElement('div');
            target.className = 'focus-target';
            const isGood = Math.random() > (0.25 + focusLevel * 0.02);
            target.textContent = isGood ? '⭐' : '❌';
            target.style.left = Math.random() * Math.max(arena.offsetWidth - 50, 50) + 'px';
            target.style.top = Math.random() * Math.max(arena.offsetHeight - 50, 50) + 'px';
            target.onclick = () => {
                if(isGood) { focusScore += 10; gameState.correctAnswers++; }
                else { focusScore = Math.max(0, focusScore - 15); }
                gameState.totalAnswers++;
                document.getElementById('focusScore').textContent = focusScore;
                target.remove();
            };
            arena.appendChild(target);
            setTimeout(() => { if(target.parentNode) target.remove(); }, Math.max(2500 - focusLevel * 100, 1000));
        }
        
        function endFocus() {
            if(focusInterval) clearInterval(focusInterval);
            if(focusSpawnInterval) clearInterval(focusSpawnInterval);
            focusInterval = null; focusSpawnInterval = null;
            document.getElementById('focusArena').innerHTML = '';
            addScore(focusScore);
            gameLevelCounts['focus'] = (gameLevelCounts['focus'] || 0) + 1;
            let leveledUp = false;
            if(gameLevelCounts['focus'] >= 2 && focusLevel < 10) {
                focusLevel++; 
                gameLevels['focus'] = focusLevel; 
                gameLevelCounts['focus'] = 0;
                leveledUp = true;
                showLevelUpMessage('focus');
            }
            saveLevel();
            document.getElementById('focusLevel').textContent = focusLevel;
            updateLevelDisplay('focus');
            showGameResult('focusResult', focusScore >= 60, focusScore >= 60 ? `🎉 종료! ${focusScore}점 획득!` : `게임 종료! ${focusScore}점`);
            document.getElementById('focusStartBtn').textContent = '다시 하기';
            document.getElementById('focusStartBtn').style.display = leveledUp ? 'none' : '';
            if (leveledUp) {
                setTimeout(() => startFocus(), 500);
            }
        }
        
        // 23. 기억의 방 (기억력)
        let palaceLevel = 1, palaceScore = 0, palaceItems = [], palaceAsking = null;
        const palaceObjects = ['🛋️','📺','🪴','🖼️','⏰','📚','🎸','🏺','💡','🧸','🎹','🏆','📷','🎨','🧲'];
        
        function initPalaceGame() {
            palaceLevel = gameLevels['palace'] || 1;
            if(palaceLevel > 10) palaceLevel = 10;
            palaceScore = 0;
            document.getElementById('palaceLevel').textContent = palaceLevel;
            document.getElementById('palaceScore').textContent = '0';
            document.getElementById('palaceResult').style.display = 'none';
            document.getElementById('palaceInstruction').textContent = '시작 버튼을 눌러주세요!';
            document.getElementById('palaceRoom').innerHTML = '';
            document.getElementById('palaceQuestion').style.display = 'none';
            document.getElementById('palaceStartBtn').textContent = '시작';
            document.getElementById('palaceStartBtn').style.display = '';
        }
        
        function startPalace() {
            const count = Math.min(2 + palaceLevel, 9);
            palaceItems = [];
            const shuffled = [...palaceObjects].sort(() => Math.random() - 0.5).slice(0, count);
            const positions = [0,1,2,3,4,5,6,7,8].sort(() => Math.random() - 0.5).slice(0, count);
            positions.forEach((pos, i) => palaceItems.push({pos, item: shuffled[i]}));
            document.getElementById('palaceInstruction').textContent = '물건들의 위치를 기억하세요!';
            document.getElementById('palaceQuestion').style.display = 'none';
            document.getElementById('palaceResult').style.display = 'none';
            document.getElementById('palaceStartBtn').style.display = 'none';
            renderPalaceRoom(true);
            setTimeout(() => { renderPalaceRoom(false); askPalaceQuestion(); }, 2000 + palaceLevel * 400);
        }
        
        function renderPalaceRoom(showItems) {
            const room = document.getElementById('palaceRoom');
            room.innerHTML = '';
            for(let i = 0; i < 9; i++) {
                const spot = document.createElement('div');
                spot.className = 'palace-spot';
                if(showItems) { const item = palaceItems.find(it => it.pos === i); spot.textContent = item ? item.item : ''; }
                room.appendChild(spot);
            }
        }
        
        function askPalaceQuestion() {
            palaceAsking = palaceItems[Math.floor(Math.random() * palaceItems.length)];
            document.getElementById('palaceInstruction').textContent = '';
            document.getElementById('palaceQuestion').style.display = 'block';
            document.getElementById('palaceAsk').textContent = `${palaceAsking.item}가 어디에 있었나요?`;
            const choices = document.getElementById('palaceChoices');
            choices.innerHTML = '';
            const positions = ['왼쪽 위','가운데 위','오른쪽 위','왼쪽','가운데','오른쪽','왼쪽 아래','가운데 아래','오른쪽 아래'];
            positions.forEach((name, idx) => {
                const btn = document.createElement('button');
                btn.className = 'palace-choice'; btn.textContent = name;
                btn.onclick = () => checkPalace(idx);
                choices.appendChild(btn);
            });
        }
        
        function checkPalace(selectedPos) {
            gameState.totalAnswers++;
            document.getElementById('palaceQuestion').style.display = 'none';
            if(selectedPos === palaceAsking.pos) {
                const score = 30 + palaceLevel * 15;
                palaceScore += score;
                document.getElementById('palaceScore').textContent = palaceScore;
                showGameResult('palaceResult', true, `⭕ 정답! +${score}점`);
                addScore(score); gameState.correctAnswers++;
                gameLevelCounts['palace'] = (gameLevelCounts['palace'] || 0) + 1;
                let leveledUp = false;
                if(gameLevelCounts['palace'] >= 2 && palaceLevel < 10) {
                    palaceLevel++; 
                    gameLevels['palace'] = palaceLevel; 
                    gameLevelCounts['palace'] = 0;
                    leveledUp = true;
                    showLevelUpMessage('palace');
                }
                saveLevel();
                document.getElementById('palaceLevel').textContent = palaceLevel;
                updateLevelDisplay('palace');
                document.getElementById('palaceStartBtn').textContent = '다음 문제';
                document.getElementById('palaceStartBtn').style.display = leveledUp ? 'none' : '';
                if (leveledUp) {
                    setTimeout(() => startPalace(), 500);
                }
                return;
            } else { showGameResult('palaceResult', false, '❌ 틀렸어요!'); }
            document.getElementById('palaceStartBtn').textContent = '다음 문제';
            document.getElementById('palaceStartBtn').style.display = '';
        }
        
        // 24. 도형 회전 (공간지각)
        let rotateQ = 0, rotateScore = 0, rotateLevel = 1, rotateTimer = null;
        const rotateShapes = ['🔺','🔷','⬛','⭐','❤️','🔶','⬜','🟣','🔻','💠'];
        
        function initRotateGame() {
            rotateLevel = gameLevels['rotate'] || 1;
            if(rotateLevel > 10) rotateLevel = 10;
            rotateQ = rotateScore = 0;
            document.getElementById('rotateLevel').textContent = rotateLevel;
            document.getElementById('rotateQuestion').textContent = '0';
            document.getElementById('rotateScore').textContent = '0';
            document.getElementById('rotateResult').style.display = 'none';
            document.getElementById('rotateOptions').innerHTML = '';
            document.getElementById('originalShape').textContent = '';
            document.getElementById('rotateStartBtn').textContent = '시작';
            document.getElementById('rotateStartBtn').style.display = '';
            if(rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
        }
        
        function startRotate() {
            rotateQ = rotateScore = 0;
            document.getElementById('rotateStartBtn').style.display = 'none';
            nextRotate();
        }
        
        function nextRotate() {
            if(rotateQ >= 10) return completeRotateGame();
            rotateQ++;
            document.getElementById('rotateQuestion').textContent = rotateQ;
            const shape = rotateShapes[Math.floor(Math.random() * rotateShapes.length)];
            const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
            document.getElementById('originalShape').innerHTML = `<span style="display:inline-block;transform:rotate(${rotation}deg)">${shape}</span>`;
            const correctRotation = (rotation + 90) % 360;
            const options = [0, 90, 180, 270].map(r => ({rotation: r, isCorrect: r === correctRotation}));
            options.sort(() => Math.random() - 0.5);
            const container = document.getElementById('rotateOptions');
            container.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('div');
                btn.className = 'rotate-option';
                btn.innerHTML = `<span style="display:inline-block;transform:rotate(${opt.rotation}deg)">${shape}</span>`;
                btn.onclick = () => checkRotate(opt.isCorrect);
                container.appendChild(btn);
            });
            document.getElementById('rotateResult').style.display = 'none';
            startTimerNew('rotateTimer', Math.max(12 - rotateLevel, 5), () => { gameState.totalAnswers++; nextRotate(); });
        }
        
        function checkRotate(isCorrect) {
            if(rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
            gameState.totalAnswers++;
            if(isCorrect) {
                rotateScore += 10 + rotateLevel; document.getElementById('rotateScore').textContent = rotateScore;
                gameState.correctAnswers++;
                showGameResult('rotateResult', true, '⭕ 정답!');
            } else { showGameResult('rotateResult', false, '❌ 틀렸어요!'); }
            setTimeout(() => { document.getElementById('rotateResult').style.display = 'none'; nextRotate(); }, 800);
        }
        
        function completeRotateGame() {
            addScore(rotateScore);
            gameLevelCounts['rotate'] = (gameLevelCounts['rotate'] || 0) + 1;
            let leveledUp = false;
            if(gameLevelCounts['rotate'] >= 2 && rotateLevel < 10) {
                rotateLevel++; 
                gameLevels['rotate'] = rotateLevel; 
                gameLevelCounts['rotate'] = 0;
                leveledUp = true;
                showLevelUpMessage('rotate');
            }
            saveLevel();
            document.getElementById('rotateLevel').textContent = rotateLevel;
            updateLevelDisplay('rotate');
            showGameResult('rotateResult', true, `🎉 완료! ${rotateScore}점 획득!`);
            document.getElementById('rotateStartBtn').textContent = '다시 하기';
            document.getElementById('rotateStartBtn').style.display = leveledUp ? 'none' : '';
            if (leveledUp) {
                setTimeout(() => startRotate(), 500);
            }
        }
        
        // 25. 연쇄 반응 (집중력)
        let chainLevel = 1, chainScore = 0, chainNumbers = [], chainCurrent = 1, chainTimer = null, chainStarted = false;
        
        function initChainGame() {
            chainLevel = gameLevels['chain'] || 1;
            if(chainLevel > 10) chainLevel = 10;
            chainScore = 0; chainStarted = false;
            document.getElementById('chainLevel').textContent = chainLevel;
            document.getElementById('chainScore').textContent = '0';
            document.getElementById('chainResult').style.display = 'none';
            document.getElementById('chainInstruction').textContent = '시작 버튼을 눌러주세요!';
            document.getElementById('chainArena').innerHTML = '';
            document.getElementById('chainStartBtn').textContent = '시작';
            document.getElementById('chainStartBtn').style.display = '';
            if(chainTimer) { clearInterval(chainTimer); chainTimer = null; }
        }
        
        function startChain() {
            chainStarted = true; chainCurrent = 1;
            const count = Math.min(4 + chainLevel, 15);
            chainNumbers = [];
            const arena = document.getElementById('chainArena');
            arena.innerHTML = '';
            for(let i = 1; i <= count; i++) chainNumbers.push(i);
            chainNumbers.forEach(num => {
                const el = document.createElement('div');
                el.className = 'chain-number'; el.textContent = num; el.id = 'chain-' + num;
                el.style.left = (Math.random() * Math.max(arena.offsetWidth - 60, 60) + 5) + 'px';
                el.style.top = (Math.random() * Math.max(arena.offsetHeight - 60, 60) + 5) + 'px';
                el.onclick = () => clickChain(num);
                arena.appendChild(el);
            });
            document.getElementById('chainInstruction').textContent = '1부터 순서대로 터치하세요!';
            document.getElementById('chainResult').style.display = 'none';
            document.getElementById('chainStartBtn').style.display = 'none';
            startTimerNew('chainTimer', 15 + chainLevel * 3, () => {
                chainStarted = false;
                showGameResult('chainResult', false, '⏰ 시간 초과!');
                gameState.totalAnswers++;
                gameLevelCounts['chain'] = 0; // 실패 시 카운트 리셋
                document.getElementById('chainStartBtn').textContent = '다시 시작';
                document.getElementById('chainStartBtn').style.display = '';
            });
        }
        
        function clickChain(num) {
            if(!chainStarted) return;
            const el = document.getElementById('chain-' + num);
            if(!el) return;
            if(num === chainCurrent) {
                el.classList.add('done'); chainCurrent++;
                if(chainCurrent > chainNumbers.length) {
                    if(chainTimer) { clearInterval(chainTimer); chainTimer = null; }
                    chainStarted = false;
                    const score = 50 + chainLevel * 20;
                    chainScore += score;
                    document.getElementById('chainScore').textContent = chainScore;
                    showGameResult('chainResult', true, `🎉 완료! +${score}점`);
                    addScore(score); gameState.correctAnswers++; gameState.totalAnswers++;
                    gameLevelCounts['chain'] = (gameLevelCounts['chain'] || 0) + 1;
                    let leveledUp = false;
                    if(gameLevelCounts['chain'] >= 2 && chainLevel < 10) {
                        chainLevel++; 
                        gameLevels['chain'] = chainLevel; 
                        gameLevelCounts['chain'] = 0;
                        leveledUp = true;
                        showLevelUpMessage('chain');
                    }
                    saveLevel();
                    document.getElementById('chainLevel').textContent = chainLevel;
                    updateLevelDisplay('chain');
                    document.getElementById('chainStartBtn').textContent = '다음 문제';
                    document.getElementById('chainStartBtn').style.display = leveledUp ? 'none' : '';
                    if (leveledUp) {
                        setTimeout(() => startChain(), 500);
                    }
                }
            } else {
                el.classList.add('wrong');
                setTimeout(() => el.classList.remove('wrong'), 300);
            }
        }
        
        // 새 게임용 결과 표시 함수
        function showGameResult(elementId, isSuccess, message) {
            const el = document.getElementById(elementId);
            if(!el) { console.log('Result element not found:', elementId); return; }
            el.textContent = message;
            el.className = 'result-message ' + (isSuccess ? 'success' : 'error');
            el.style.display = 'block';
            if(isSuccess) {
                playCorrectSound();
            } else {
                playWrongSound();
            }
        }
        
        // 공통 타이머 함수
        function startTimerNew(timerId, seconds, onTimeout) {
            const timerEl = document.getElementById(timerId);
            if(!timerEl) { console.log('Timer element not found:', timerId); return null; }
            let remaining = seconds;
            timerEl.style.width = '100%';
            const interval = setInterval(() => {
                remaining--;
                timerEl.style.width = (remaining / seconds * 100) + '%';
                if(remaining <= 0) { clearInterval(interval); onTimeout(); }
            }, 1000);
            if(timerId === 'shadowTimer') shadowTimer = interval;
            if(timerId === 'rotateTimer') rotateTimer = interval;
            if(timerId === 'chainTimer') chainTimer = interval;
            return interval;
        }
        
        // 새 게임 함수들을 window 객체에 등록 (startGame에서 접근 가능하도록)
        window.initMazeGame = initMazeGame;
        window.initMelodyGame = initMelodyGame;
        window.initPuzzleGame = initPuzzleGame;
        window.initTreasureGame = initTreasureGame;
        window.initShadowGame = initShadowGame;
        window.initFocusGame = initFocusGame;
        window.initPalaceGame = initPalaceGame;
        window.initRotateGame = initRotateGame;
        window.initChainGame = initChainGame;
        
        // 시작 및 게임 조작 함수들도 window 객체에 등록
        window.startMaze = startMaze;
        window.moveMaze = moveMaze;
        window.startMelody = startMelody;
        window.playNote = playNote;
        window.startPuzzle = startPuzzle;
        window.startTreasure = startTreasure;
        window.digTreasure = digTreasure;
        window.startShadow = startShadow;
        window.checkShadow = checkShadow;
        window.startFocus = startFocus;
        window.startPalace = startPalace;
        window.checkPalace = checkPalace;
        window.startRotate = startRotate;
        window.checkRotate = checkRotate;
        window.startChain = startChain;
        window.clickChain = clickChain;
        
