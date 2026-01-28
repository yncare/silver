// ==================== 효과/사운드 ====================
function launchConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const shapes = ['circle', 'square', 'star'];
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti ' + shapes[Math.floor(Math.random() * shapes.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-20px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            const size = 8 + Math.random() * 10;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
    }
}

function showCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 2000);
}

function playApplause() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                createClapSound(audioContext);
            }, i * 150 + Math.random() * 50);
        }
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                createClapSound(audioContext, 0.3);
            }, 1200 + i * 200 + Math.random() * 100);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

function createClapSound(audioContext, volume = 0.5) {
    const bufferSize = audioContext.sampleRate * 0.1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.1));
        data[i] = (Math.random() * 2 - 1) * decay;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
}

function playCorrectSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        [523.25, 659.25].forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 150);
        });
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playWrongSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function miniConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti circle';
        confetti.style.left = (40 + Math.random() * 20) + '%';
        confetti.style.top = '30%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (1 + Math.random()) + 's';
        
        const size = 6 + Math.random() * 6;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}
