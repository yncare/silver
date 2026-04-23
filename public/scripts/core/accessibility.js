// ==================== 접근성 기능 (글자 크기, 고대비) ====================
        let currentFontSize = 'normal'; // normal, large, xlarge
        let highContrastEnabled = false;
        
        // 글자 크기 토글
        function toggleFontSize() {
            const body = document.body;
            const btn = document.getElementById('fontSizeBtn');
            const label = document.getElementById('fontSizeLabel');
            
            // 순환: normal -> large -> xlarge -> normal
            if (currentFontSize === 'normal') {
                currentFontSize = 'large';
                body.classList.remove('font-xlarge');
                body.classList.add('font-large');
                label.textContent = '더 크게';
                btn.classList.add('active');
            } else if (currentFontSize === 'large') {
                currentFontSize = 'xlarge';
                body.classList.remove('font-large');
                body.classList.add('font-xlarge');
                label.textContent = '보통 크기';
            } else {
                currentFontSize = 'normal';
                body.classList.remove('font-large', 'font-xlarge');
                label.textContent = '크게 보기';
                btn.classList.remove('active');
            }
            
            localStorage.setItem('fontSize', currentFontSize);
            
            // 음성 안내
            if (ttsAutoEnabled) {
                const sizeNames = { normal: '보통 크기', large: '크게', xlarge: '아주 크게' };
                speak(`글자 크기가 ${sizeNames[currentFontSize]}로 변경되었습니다.`);
            }
        }
        
        // 고대비 모드 토글
        function toggleHighContrast() {
            const body = document.body;
            const btn = document.getElementById('contrastBtn');
            const label = document.getElementById('contrastLabel');
            
            highContrastEnabled = !highContrastEnabled;
            
            if (highContrastEnabled) {
                body.classList.add('high-contrast');
                label.textContent = '일반 모드';
                btn.classList.add('active');
            } else {
                body.classList.remove('high-contrast');
                label.textContent = '고대비 모드';
                btn.classList.remove('active');
            }
            
            localStorage.setItem('highContrast', highContrastEnabled);
            
            // 음성 안내
            if (ttsAutoEnabled) {
                speak(highContrastEnabled ? '고대비 모드가 켜졌습니다. 화면이 어두워지고 글자가 밝아집니다.' : '일반 모드로 돌아갑니다.');
            }
        }
        
        // 접근성 설정 로드
        function loadAccessibilitySettings() {
            const savedFontSize = localStorage.getItem('fontSize');
            const savedContrast = localStorage.getItem('highContrast');
            
            // 글자 크기 복원
            if (savedFontSize) {
                currentFontSize = 'normal'; // 리셋 후 순환
                while (currentFontSize !== savedFontSize) {
                    toggleFontSizeWithoutSound();
                }
            }
            
            // 고대비 복원
            if (savedContrast === 'true') {
                toggleHighContrastWithoutSound();
            }
        }
        
        // 소리 없이 글자 크기 변경 (로드시)
        function toggleFontSizeWithoutSound() {
            const body = document.body;
            const btn = document.getElementById('fontSizeBtn');
            const label = document.getElementById('fontSizeLabel');
            
            if (currentFontSize === 'normal') {
                currentFontSize = 'large';
                body.classList.remove('font-xlarge');
                body.classList.add('font-large');
                if (label) label.textContent = '더 크게';
                if (btn) btn.classList.add('active');
            } else if (currentFontSize === 'large') {
                currentFontSize = 'xlarge';
                body.classList.remove('font-large');
                body.classList.add('font-xlarge');
                if (label) label.textContent = '보통 크기';
            } else {
                currentFontSize = 'normal';
                body.classList.remove('font-large', 'font-xlarge');
                if (label) label.textContent = '크게 보기';
                if (btn) btn.classList.remove('active');
            }
        }
        
        // 소리 없이 고대비 변경 (로드시)
        function toggleHighContrastWithoutSound() {
            const body = document.body;
            const btn = document.getElementById('contrastBtn');
            const label = document.getElementById('contrastLabel');
            
            highContrastEnabled = !highContrastEnabled;
            
            if (highContrastEnabled) {
                body.classList.add('high-contrast');
                if (label) label.textContent = '일반 모드';
                if (btn) btn.classList.add('active');
            } else {
                body.classList.remove('high-contrast');
                if (label) label.textContent = '고대비 모드';
                if (btn) btn.classList.remove('active');
            }
        }
        
        // 페이지 로드시 접근성 설정 적용
        document.addEventListener('DOMContentLoaded', () => {
            loadAccessibilitySettings();
        });
