// ==================== 음성 안내 (TTS) 시스템 ====================
        let ttsAutoEnabled = false;
        let ttsSpeed = 0.85;
        let currentUtterance = null;
        
        // 게임별 음성 안내 텍스트
        const gameGuides = {
            match: {
                title: '짝 맞추기 게임',
                guide: '같은 그림 카드 두 장을 찾아 짝을 맞추는 게임입니다. 카드를 클릭하면 뒤집어지고, 같은 그림이면 사라집니다. 모든 짝을 맞추면 다음 단계로 넘어갑니다. 시작 버튼을 눌러 게임을 시작하세요.'
            },
            sequence: {
                title: '숫자 기억하기 게임',
                guide: '화면에 나타나는 숫자를 순서대로 기억하세요. 숫자가 사라지면 아래 숫자 버튼을 눌러 기억한 숫자를 입력하고, 확인 버튼을 누르세요. 레벨이 올라갈수록 숫자가 많아집니다.'
            },
            calc: {
                title: '암산 훈련 게임',
                guide: '덧셈, 뺄셈 문제가 나옵니다. 답을 계산한 후 네 개의 보기 중에서 정답을 선택하세요. 제한 시간 안에 빠르게 답을 맞춰야 합니다.'
            },
            color: {
                title: '색상 맞추기 게임',
                guide: '화면에 글자가 나타납니다. 글자의 의미가 아닌 글자의 색깔을 보고 맞는 색상 버튼을 누르세요. 예를 들어 빨간색으로 쓰인 파랑이라는 글자가 나오면, 빨강 버튼을 눌러야 합니다.'
            },
            pattern: {
                title: '패턴 기억하기 게임',
                guide: '격자판에서 몇 개의 칸이 잠깐 색칠됩니다. 그 위치를 기억했다가, 색이 사라진 후 같은 위치의 칸들을 클릭하세요. 레벨이 올라가면 기억할 칸이 많아집니다.'
            },
            reaction: {
                title: '반응 속도 게임',
                guide: '화면의 상자가 초록색으로 바뀌면 최대한 빨리 클릭하세요. 초록색이 되기 전에 클릭하면 안 됩니다. 5번의 기회에서 평균 반응 속도를 측정합니다.'
            },
            findDiff: {
                title: '다른 것 찾기 게임',
                guide: '여러 개의 같은 그림 중에서 다른 하나가 숨어 있습니다. 다른 그림을 빨리 찾아서 클릭하세요. 제한 시간이 있으니 서두르세요.'
            },
            sorting: {
                title: '순서 정렬 게임',
                guide: '숫자들이 무작위로 나타납니다. 1부터 순서대로 숫자를 클릭하세요. 올바른 순서로 클릭해야 합니다. 틀리면 잠시 기다려야 합니다.'
            },
            direction: {
                title: '방향 맞추기 게임',
                guide: '화살표가 나타납니다. 화살표가 가리키는 방향의 버튼을 누르세요. 위, 아래, 왼쪽, 오른쪽 네 방향 중 하나를 선택하면 됩니다.'
            },
            word: {
                title: '단어 완성 게임',
                guide: '빈칸이 있는 단어가 나타납니다. 아래 글자 버튼들 중에서 빈칸에 들어갈 알맞은 글자를 순서대로 눌러 단어를 완성하세요.'
            },
            counting: {
                title: '개수 세기 게임',
                guide: '화면에 여러 가지 그림이 나타납니다. 특정 그림의 개수를 세어 맞는 숫자를 선택하세요. 예를 들어 사과의 개수가 몇 개인지 세서 답을 고르면 됩니다.'
            },
            pairing: {
                title: '짝 연결 게임',
                guide: '왼쪽과 오른쪽에 단어들이 있습니다. 서로 관련 있는 단어끼리 연결하세요. 왼쪽 단어를 먼저 클릭하고, 짝이 되는 오른쪽 단어를 클릭하면 됩니다.'
            },
            timing: {
                title: '시간 맞추기 게임',
                guide: '목표 시간이 주어집니다. 타이머가 시작되면 화면의 숫자를 보면서, 목표 시간에 정확히 멈출 수 있도록 스탑 버튼을 누르세요.'
            },
            reverse: {
                title: '거꾸로 말하기 게임',
                guide: '단어가 나타납니다. 그 단어를 거꾸로 뒤집어서 입력하세요. 예를 들어 사과가 나오면 과사라고 입력해야 합니다. 아래 글자 버튼을 눌러 입력하세요.'
            },
            category: {
                title: '분류하기 게임',
                guide: '화면에 카테고리가 나타납니다. 예를 들어 과일을 모두 고르세요라고 나오면 여러 단어 중에서 과일에 해당하는 것만 모두 선택하고 선택 완료 버튼을 누르세요.'
            },
            story: {
                title: '이야기 순서 게임',
                guide: '여러 장의 그림 카드가 나타납니다. 이야기가 진행되는 올바른 순서대로 그림 카드를 차례대로 눌러주세요. 예를 들어 아침에 일어나서 세수하고 밥 먹는 순서대로 선택하면 됩니다.'
            },
            maze: {
                title: '미로 탈출 게임',
                guide: '화살표 버튼을 눌러 쥐를 치즈까지 이동시키세요. 벽은 지나갈 수 없습니다. 최소한의 이동으로 탈출하면 높은 점수를 받습니다.'
            },
            melody: {
                title: '멜로디 기억 게임',
                guide: '피아노 건반에서 멜로디가 연주됩니다. 소리와 색깔을 잘 기억했다가 같은 순서로 건반을 눌러주세요. 레벨이 올라갈수록 멜로디가 길어집니다.'
            },
            puzzle: {
                title: '퍼즐 맞추기 게임',
                guide: '숫자가 섞여있는 퍼즐입니다. 빈칸 옆의 숫자를 클릭하면 이동합니다. 1부터 순서대로 정렬하면 완성입니다.'
            },
            treasure: {
                title: '보물 찾기 게임',
                guide: '25칸 중 한 곳에 보물이 숨겨져 있습니다. 칸을 누르면 힌트가 나타납니다. 5번의 기회 안에 보물을 찾아주세요.'
            },
            shadow: {
                title: '그림자 매칭 게임',
                guide: '화면 위에 물체가 나타납니다. 아래 4개의 그림자 중에서 위 물체와 같은 그림자를 찾아 눌러주세요.'
            },
            focus: {
                title: '집중 타겟 게임',
                guide: '화면에 별과 엑스 표시가 나타납니다. 별만 클릭하고 엑스는 피하세요. 30초 동안 최대한 많은 별을 클릭하면 높은 점수를 받습니다.'
            },
            palace: {
                title: '기억의 방 게임',
                guide: '방 안에 물건들이 놓여있습니다. 물건의 위치를 기억하세요. 잠시 후 물건이 사라지고 질문이 나타납니다. 물건이 어디에 있었는지 맞춰주세요.'
            },
            rotate: {
                title: '도형 회전 게임',
                guide: '위에 도형이 보입니다. 이 도형을 시계 방향으로 90도 회전하면 어떤 모양이 될까요? 아래 4개의 보기 중에서 정답을 찾아 눌러주세요.'
            },
            chain: {
                title: '연쇄 반응 게임',
                guide: '화면에 숫자가 흩어져 있습니다. 1부터 순서대로 빠르게 터치하세요. 시간 안에 모든 숫자를 순서대로 누르면 성공입니다.'
            }
        };
        
        // TTS 지원 확인
        function isTTSSupported() {
            return 'speechSynthesis' in window;
        }
        
        // 음성으로 텍스트 읽기
        function speak(text, callback) {
            if (!isTTSSupported()) {
                console.warn('이 브라우저에서는 음성 안내 기능을 지원하지 않습니다.');
                return;
            }
            
            // 기존 음성 중지
            stopSpeaking();
            
            // 음성 합성 함수
            function doSpeak() {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ko-KR';
                utterance.rate = ttsSpeed;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                // 한국어 음성 선택
                const voices = speechSynthesis.getVoices();
                const koreanVoice = voices.find(voice => voice.lang.includes('ko'));
                if (koreanVoice) {
                    utterance.voice = koreanVoice;
                }
                
                utterance.onstart = () => {
                    console.log('TTS 시작:', text.substring(0, 30) + '...');
                    document.querySelectorAll('.tts-btn').forEach(btn => btn.classList.add('speaking'));
                };
                
                utterance.onend = () => {
                    console.log('TTS 완료');
                    document.querySelectorAll('.tts-btn').forEach(btn => btn.classList.remove('speaking'));
                    currentUtterance = null;
                    if (callback) callback();
                };
                
                utterance.onerror = (event) => {
                    console.error('TTS 오류:', event.error);
                    document.querySelectorAll('.tts-btn').forEach(btn => btn.classList.remove('speaking'));
                    currentUtterance = null;
                };
                
                currentUtterance = utterance;
                speechSynthesis.speak(utterance);
            }
            
            // 음성 목록이 로드되었는지 확인
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
                // 음성 목록이 아직 로드되지 않은 경우 대기
                speechSynthesis.onvoiceschanged = () => {
                    doSpeak();
                };
                // 혹시 이벤트가 발생하지 않을 경우를 대비한 폴백
                setTimeout(doSpeak, 100);
            } else {
                doSpeak();
            }
        }
        
        // 음성 중지
        function stopSpeaking() {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            document.querySelectorAll('.tts-btn').forEach(btn => btn.classList.remove('speaking'));
            currentUtterance = null;
        }
        
        // 게임 설명 읽기
        function speakGameGuide(gameType) {
            const guide = gameGuides[gameType];
            if (!guide) return;
            
            if (speechSynthesis.speaking && currentUtterance) {
                stopSpeaking();
                return;
            }
            
            const fullText = `${guide.title}입니다. ${guide.guide}`;
            speak(fullText);
        }
        
        // 문제 읽기 (현재 게임 상태에 따라)
        function speakCurrentQuestion(text) {
            if (ttsAutoEnabled || text) {
                speak(text || '문제를 확인하세요.');
            }
        }
        
        // 자동 TTS 토글
        function toggleAutoTTS() {
            const toggle = document.getElementById('ttsAutoToggle');
            if (!toggle) return;
            
            ttsAutoEnabled = toggle.checked;
            localStorage.setItem('ttsAutoEnabled', ttsAutoEnabled.toString());
            
            console.log('TTS Auto:', ttsAutoEnabled); // 디버깅용
            
            if (ttsAutoEnabled) {
                // 브라우저에서 음성 기능을 활성화하려면 사용자 상호작용이 필요할 수 있음
                speak('자동 음성 안내가 켜졌습니다. 게임을 시작하면 설명을 자동으로 들으실 수 있습니다.');
            } else {
                stopSpeaking();
            }
        }
        
        // TTS 속도 변경
        function changeTTSSpeed() {
            const select = document.getElementById('ttsSpeedSelect');
            ttsSpeed = parseFloat(select.value);
            localStorage.setItem('ttsSpeed', ttsSpeed);
        }
        
        // TTS 설정 로드
        function loadTTSSettings() {
            const savedAuto = localStorage.getItem('ttsAutoEnabled');
            const savedSpeed = localStorage.getItem('ttsSpeed');
            
            // 자동 음성 안내 설정 로드
            if (savedAuto !== null) {
                ttsAutoEnabled = savedAuto === 'true';
            }
            
            // 속도 설정 로드
            if (savedSpeed !== null) {
                ttsSpeed = parseFloat(savedSpeed);
            }
            
            // UI 요소 업데이트 (요소가 존재하고 보이는 경우에만)
            const toggle = document.getElementById('ttsAutoToggle');
            if (toggle) {
                toggle.checked = ttsAutoEnabled;
                console.log('TTS 설정 로드됨 - 자동:', ttsAutoEnabled, '속도:', ttsSpeed);
            }
            
            const select = document.getElementById('ttsSpeedSelect');
            if (select) {
                select.value = ttsSpeed.toString();
            }
        }
        
        // 음성 목록 로드 (일부 브라우저에서 비동기로 로드됨)
        let voicesLoaded = false;
        if (isTTSSupported()) {
            // 음성 목록 미리 로드
            speechSynthesis.getVoices();
            speechSynthesis.onvoiceschanged = () => {
                voicesLoaded = true;
                console.log('TTS 음성 목록 로드됨:', speechSynthesis.getVoices().length + '개');
            };
        }
