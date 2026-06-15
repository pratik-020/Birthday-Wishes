/* ==========================================================================
   PARTICLE CANVAS BACKGROUND (FAIRY DUST STARS & HEARTS WITH CURSOR REACTION)
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 35; // rich fairy dust count

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Catch cursor movement for soft parallax physics
document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
    targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    
    // Parallax background glows
    const glow1 = document.querySelector('.glow-1');
    const glow2 = document.querySelector('.glow-2');
    const glow3 = document.querySelector('.glow-3');
    
    if (glow1) glow1.style.transform = `translate(${targetMouseX}px, ${targetMouseY}px)`;
    if (glow2) glow2.style.transform = `translate(${-targetMouseX}px, ${-targetMouseY}px)`;
    if (glow3) glow3.style.transform = `translate(${targetMouseX * 0.5}px, ${-targetMouseY * 0.5}px)`;
});

class MagicParticle {
    constructor() {
        this.reset(true);
    }

    reset(initialSetup = false) {
        this.x = Math.random() * canvas.width;
        this.y = initialSetup ? Math.random() * canvas.height : canvas.height + 25;
        this.type = Math.random() > 0.4 ? 'sparkle' : 'heart'; // fairy dust mixed with hearts
        
        if (this.type === 'heart') {
            this.size = Math.random() * 8 + 5;
            this.speedY = Math.random() * 0.6 + 0.3;
            this.color = '#ff8fa4';
        } else {
            this.size = Math.random() * 2.2 + 1.2;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.45 ? '#f9d976' : '#ffffff'; // gold & white sparkles
        }
        
        this.opacity = Math.random() * 0.45 + 0.2;
        this.maxOpacity = this.opacity;
        this.wiggle = Math.random() * 0.012;
        this.wiggleSpeed = Math.random() * 0.015;
        this.twinkleRate = Math.random() * 0.008 + 0.004;
    }

    update() {
        this.y -= this.speedY;
        
        // Add subtle mouse-drag pull to particles
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;
        
        this.x += Math.sin(this.y * this.wiggle) * 0.35 + (mouseX * 0.03);
        
        // Twinkling effect
        if (this.type === 'sparkle') {
            this.opacity = Math.abs(Math.sin(this.y * this.twinkleRate)) * this.maxOpacity;
        } else {
            this.opacity -= 0.00025;
        }

        if (this.y < -30 || this.opacity <= 0) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        if (this.type === 'heart') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(this.x, this.y + topCurveHeight);
            
            // Left lobe
            ctx.bezierCurveTo(
                this.x - this.size / 2, this.y - topCurveHeight, 
                this.x - this.size, this.y + this.size / 3, 
                this.x, this.y + this.size
            );
            // Right lobe
            ctx.bezierCurveTo(
                this.x + this.size, this.y + this.size / 3, 
                this.x + this.size / 2, this.y - topCurveHeight, 
                this.x, this.y + topCurveHeight
            );
            ctx.fill();
        } else {
            // Draw Sparkle Star (Twinkling Soft 4-pointed Star)
            const cx = this.x;
            const cy = this.y;
            const spikes = 4;
            const outerRadius = this.size * 2.2;
            const innerRadius = this.size * 0.55;
            
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius)
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fill();
        }
        ctx.restore();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new MagicParticle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();


/* ==========================================================================
   WEB AUDIO API SYNTHESIZER (MUSIC BOX & CANTON SOUND PUFFS)
   ========================================================================== */
let audioCtx = null;
let synthTimer = null;
let isPlaying = false;
let currentTempo = 105; 
let beatTime = 60 / currentTempo;

// Chords Sequence: Cmaj9 -> Am9 -> Fmaj7 -> G7sus4 (Music Box Plucks)
const chordProgression = [
    [130.81, 196.00, 329.63, 493.88, 587.33],
    [110.00, 164.81, 261.63, 392.00, 493.88],
    [87.31, 130.81, 220.00, 329.63, 392.00],
    [98.00, 146.83, 196.00, 261.63, 349.23]
];

// Happy Birthday Melody
const happyBirthdayMelody = [
    [392.00, 0.75, 0.25], 
    [392.00, 0.25, 0.05], 
    [440.00, 1.00, 0.10], 
    [392.00, 1.00, 0.10], 
    [523.25, 1.00, 0.10], 
    [493.88, 2.00, 0.20], 

    [392.00, 0.75, 0.25], 
    [392.00, 0.25, 0.05], 
    [440.00, 1.00, 0.10], 
    [392.00, 1.00, 0.10], 
    [587.33, 1.00, 0.10], 
    [523.25, 2.00, 0.20], 

    [392.00, 0.75, 0.25], 
    [392.00, 0.25, 0.05], 
    [783.99, 1.00, 0.10], 
    [659.25, 1.00, 0.10], 
    [523.25, 1.00, 0.10], 
    [493.88, 1.00, 0.10], 
    [440.00, 2.00, 0.20], 

    [698.46, 0.75, 0.25], 
    [698.46, 0.25, 0.05], 
    [659.25, 1.00, 0.10], 
    [523.25, 1.00, 0.10], 
    [587.33, 1.00, 0.10], 
    [523.25, 2.50, 0.50]  
];

let chordIndex = 0;
let noteIndex = 0;
let currentBeat = 0;
let playMelodyMode = false;
let nextEventTime = 0;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playPluck(freq, time, volume = 0.14, type = 'sine') {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1450, time);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 1.55);
}

// Synthesize a soft white noise "puf" wind burst when blowing candle
function playExtinguishSound() {
    initAudio();
    if (!audioCtx) return;
    try {
        const bufferSize = audioCtx.sampleRate * 0.35; 
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; 
        }
        
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(12, audioCtx.currentTime + 0.32);
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);
        
        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        noiseNode.start();
    } catch (err) {
        console.warn("Audio synthesis error:", err);
    }
}

function scheduleNextSynthEvents() {
    const lookAhead = 0.25;
    while (nextEventTime < audioCtx.currentTime + lookAhead) {
        if (playMelodyMode) {
            // Play Birthday Melody Note
            const note = happyBirthdayMelody[noteIndex];
            const freq = note[0];
            const duration = note[1] * beatTime;
            const pause = note[2] * beatTime;

            if (freq > 0) {
                playPluck(freq, nextEventTime, 0.20, 'triangle');
            }

            // Beautiful light arpeggios along with melody
            if (currentBeat % 2 === 0) {
                const chord = chordProgression[chordIndex];
                playPluck(chord[0], nextEventTime, 0.06, 'sine');
                const randomChordNote = chord[Math.floor(Math.random() * (chord.length - 1)) + 1];
                playPluck(randomChordNote, nextEventTime + (beatTime * 0.5), 0.04, 'sine');
            }

            nextEventTime += (duration + pause);
            
            noteIndex = (noteIndex + 1) % happyBirthdayMelody.length;
            currentBeat = (currentBeat + 1) % 16;
            if (noteIndex === 0) {
                chordIndex = (chordIndex + 1) % chordProgression.length;
            }
        } else {
            // Standard Lo-Fi Arpeggio Loop Mode (Screens 1 - 4)
            const chord = chordProgression[chordIndex];
            const beatStep = currentBeat % 8;

            if (beatStep === 0) {
                playPluck(chord[0], nextEventTime, 0.14, 'sine'); 
            } else if (beatStep === 2) {
                playPluck(chord[2], nextEventTime, 0.09, 'sine');
            } else if (beatStep === 4) {
                playPluck(chord[3], nextEventTime, 0.10, 'sine');
                playPluck(chord[4], nextEventTime, 0.08, 'sine');
            } else if (beatStep === 6) {
                playPluck(chord[1], nextEventTime, 0.09, 'sine');
            }

            nextEventTime += beatTime * 0.5; 
            currentBeat++;

            if (currentBeat % 8 === 0) {
                chordIndex = (chordIndex + 1) % chordProgression.length;
            }
        }
    }
    synthTimer = setTimeout(scheduleNextSynthEvents, 50);
}

function startMusic() {
    initAudio();
    isPlaying = true;
    nextEventTime = audioCtx.currentTime + 0.05;
    currentBeat = 0;
    chordIndex = 0;
    noteIndex = 0;
    scheduleNextSynthEvents();
    document.getElementById('music-btn').classList.add('playing');
    document.getElementById('audio-control').classList.remove('hidden');
}

function stopMusic() {
    isPlaying = false;
    clearTimeout(synthTimer);
    document.getElementById('music-btn').classList.remove('playing');
}

document.getElementById('music-btn').addEventListener('click', () => {
    if (isPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});


/* ==========================================================================
   SCREEN STATE CONTROLLER
   ========================================================================== */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    targetScreen.classList.add('active');
    
    // Custom trigger events for screen phases
    if (screenId === 'screen-intro') {
        startTypingIntro();
    } else if (screenId === 'screen-cake') {
        // Prepare Wish Input layer, hide Birthday Cake initially
        document.getElementById('wish-input-panel').classList.remove('hidden-panel');
        document.getElementById('cake-interactive-panel').classList.add('hidden-panel');
        
        // Reset states
        playMelodyMode = false;
        noteIndex = 0;
        
        const wishInput = document.getElementById('wish-input');
        wishInput.value = "";
        wishInput.disabled = false;
        document.getElementById('wish-char-counter').textContent = "0";
        document.getElementById('btn-lock-wish').disabled = true;

        const miniJar = document.querySelector('.wish-jar-svg.mini');
        const miniGlow = document.querySelector('.wish-jar-glow-effect.mini');
        const miniStars = document.querySelector('.jar-stars-mini');
        if (miniJar) miniJar.classList.remove('glow-shake');
        if (miniGlow) miniGlow.classList.remove('active');
        if (miniStars) miniStars.classList.remove('glowing');
    } else if (screenId === 'screen-wishes') {
        triggerConfettiShower();
        // Hide wish bubble just in case
        const wishBubble = document.getElementById('wish-display-bubble');
        if (wishBubble) wishBubble.classList.remove('visible');
    } else if (screenId === 'screen-envelope') {
        playMelodyMode = false;
    }
}


/* ==========================================================================
   SCREEN 1: THE LOCK SCREEN (ENVELOPE OPENING)
   ========================================================================== */
const envelope = document.getElementById('main-envelope');
const seal = document.getElementById('seal');

function openEnvelope() {
    if (!envelope.classList.contains('open')) {
        startMusic();
        envelope.classList.add('open');
        
        // Explosion of sweet hearts confetti
        confetti({
            particleCount: 50,
            spread: 75,
            origin: { y: 0.72 },
            colors: ['#ff758c', '#ff7eb3', '#ffffff', '#f9d976']
        });

        setTimeout(() => {
            showScreen('screen-intro');
        }, 1500);
    }
}

seal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
});
envelope.addEventListener('click', openEnvelope);


/* ==========================================================================
   SCREEN 2: HEARTFELT INTRO (TYPING EFFECT & CURSOR CONTROL)
   ========================================================================== */
const introText1 = "Today is a beautiful day, because it's the day that a truly incredible person was brought into this world... 💝";
const introText2 = "I wanted to create something small, cute, and completely unique to say Happy Birthday to you. Let's start! ✨";

function startTypingIntro() {
    const line1Element = document.getElementById('intro-text-line-1');
    const line2Element = document.getElementById('intro-text-line-2');
    const actionBtn = document.getElementById('btn-to-carousel');

    line1Element.textContent = "";
    line2Element.textContent = "";
    line1Element.className = "typing-text typing-cursor";
    line2Element.className = "typing-text";
    actionBtn.classList.remove('visible');

    let i = 0;
    function typeLine1() {
        if (i < introText1.length) {
            line1Element.textContent += introText1.charAt(i);
            i++;
            setTimeout(typeLine1, 35);
        } else {
            line1Element.classList.remove('typing-cursor');
            line2Element.classList.add('typing-cursor');
            let j = 0;
            function typeLine2() {
                if (j < introText2.length) {
                    line2Element.textContent += introText2.charAt(j);
                    j++;
                    setTimeout(typeLine2, 35);
                } else {
                    line2Element.classList.remove('typing-cursor');
                    actionBtn.classList.add('visible');
                }
            }
            setTimeout(typeLine2, 500);
        }
    }
    setTimeout(typeLine1, 400);
}

document.getElementById('btn-to-carousel').addEventListener('click', () => {
    showScreen('screen-carousel');
});


/* ==========================================================================
   SCREEN 3: AMAZING DECK CAROUSEL (SPRING-PHYSICS SWIPE & PROGRESS DOTS)
   ========================================================================== */
const cardStack = document.getElementById('crush-card-stack');
const cards = Array.from(cardStack.children);
const nextCardBtn = document.getElementById('btn-next-card');
const prevCardBtn = document.getElementById('btn-prev-card');
let currentCardIndex = 0;

function updateCardStack() {
    cards.forEach((card, idx) => {
        card.className = "stack-card"; // reset classes
        
        if (idx === currentCardIndex) {
            card.classList.add('active');
        } else if (idx === currentCardIndex + 1) {
            card.classList.add('next-preview');
        } else if (idx === currentCardIndex + 2) {
            card.classList.add('far-preview');
        }
    });

    prevCardBtn.disabled = currentCardIndex === 0;

    if (currentCardIndex === cards.length - 1) {
        nextCardBtn.querySelector('span').textContent = "Continue";
    } else {
        nextCardBtn.querySelector('span').textContent = "Next";
    }

    // Dynamic dot builder update
    let dotsContainer = document.querySelector('.carousel-progress-dots');
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-progress-dots';
        cardStack.parentNode.insertBefore(dotsContainer, cardStack.nextSibling);
        for (let d = 0; d < cards.length; d++) {
            const dot = document.createElement('span');
            dot.className = 'progress-dot';
            if (d === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }
    }
    const dots = dotsContainer.querySelectorAll('.progress-dot');
    dots.forEach((dot, idx) => {
        if (idx === currentCardIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// 3D Card tilt dynamic hover
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        if (!card.classList.contains('active')) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const tiltX = (y / (rect.height / 2)) * -12; // cap tilt angle
        const tiltY = (x / (rect.width / 2)) * 12;
        
        card.style.transform = `scale(1.02) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('active')) return;
        card.style.transform = '';
    });
});

nextCardBtn.addEventListener('click', () => {
    if (currentCardIndex < cards.length - 1) {
        cards[currentCardIndex].classList.add('swiped-left');
        currentCardIndex++;
        updateCardStack();
    } else {
        showScreen('screen-game');
    }
});

prevCardBtn.addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        cards[currentCardIndex].classList.remove('swiped-left');
        cards[currentCardIndex].classList.remove('swiped-right');
        updateCardStack();
    }
});

// Setup swipe gestures for mobile swipe
let touchStartX = 0;
let touchEndX = 0;

cardStack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

cardStack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    const minSwipeDistance = 50;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance < 0) {
            nextCardBtn.click();
        } else {
            prevCardBtn.click();
        }
    }
}

// Initial stack load
updateCardStack();


/* ==========================================================================
   SCREEN 4: PLAYFUL ESCAPING "NO" DATE BUTTON GAME & HEARTS GENERATOR
   ========================================================================== */
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const escapeContainer = document.getElementById('escape-container');

const teaseTexts = ["Nope! 😜", "Too fast! ⚡", "Try again! 💨", "Close one! 👀", "Not today! 🌸", "Almost! 🧸"];
let teaseTooltip = null;

function createTeaseTooltip() {
    if (!teaseTooltip) {
        teaseTooltip = document.createElement('div');
        teaseTooltip.className = 'no-tease-tooltip';
        escapeContainer.appendChild(teaseTooltip);
    }
}

function escapeButton() {
    createTeaseTooltip();
    const containerRect = escapeContainer.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    const maxX = containerRect.width - btnRect.width;
    const maxY = 150; 

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor((Math.random() - 0.5) * maxY);

    btnNo.style.position = 'absolute';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;

    // Tease text reveal
    const phrase = teaseTexts[Math.floor(Math.random() * teaseTexts.length)];
    teaseTooltip.textContent = phrase;
    teaseTooltip.style.left = `${randomX + (btnNo.offsetWidth / 2) - 45}px`;
    teaseTooltip.style.top = `${randomY + 30}px`;
    teaseTooltip.classList.add('visible');

    setTimeout(() => {
        teaseTooltip.classList.remove('visible');
    }, 750);
}

btnNo.addEventListener('mouseenter', escapeButton);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    escapeButton();
});

// Floating hearts emitter on YES hover/click
function emitHearts() {
    const btnRect = btnYes.getBoundingClientRect();
    const heartEmitter = document.body;

    for (let count = 0; count < 6; count++) {
        setTimeout(() => {
            const hParticle = document.createElement('div');
            hParticle.className = 'floating-heart-particle';
            hParticle.innerHTML = Math.random() > 0.55 ? '💖' : '❤️';
            
            const randomOffsetX = (Math.random() - 0.5) * btnYes.offsetWidth;
            const randomOffsetY = (Math.random() - 0.5) * btnYes.offsetHeight;
            hParticle.style.left = `${btnRect.left + window.scrollX + (btnYes.offsetWidth / 2) + randomOffsetX}px`;
            hParticle.style.top = `${btnRect.top + window.scrollY + (btnYes.offsetHeight / 2) + randomOffsetY}px`;
            
            heartEmitter.appendChild(hParticle);
            setTimeout(() => hParticle.remove(), 1600);
        }, count * 120);
    }
}

btnYes.addEventListener('mouseenter', emitHearts);
btnYes.addEventListener('click', () => {
    emitHearts();
    confetti({
        particleCount: 160,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#ff758c', '#ff7eb3', '#ffeaa7', '#a29bfe']
    });

    setTimeout(() => {
        showScreen('screen-cake');
    }, 1250);
});


/* ==========================================================================
   SCREEN 5: THE BIRTHDAY CAKE & WISH JAR FORM INTERACTION
   ========================================================================== */
const wishInput = document.getElementById('wish-input');
const wishCharCounter = document.getElementById('wish-char-counter');
const btnLockWish = document.getElementById('btn-lock-wish');

wishInput.addEventListener('input', () => {
    const len = wishInput.value.length;
    wishCharCounter.textContent = len;
    
    if (len > 0) {
        btnLockWish.disabled = false;
    } else {
        btnLockWish.disabled = true;
    }
});

btnLockWish.addEventListener('click', () => {
    const wishValue = wishInput.value.trim();
    if (wishValue) {
        wishInput.disabled = true;
        btnLockWish.disabled = true;
        
        // Save the wish globally
        window.storedCrushWish = wishValue;
        
        // Trigger mini jar absorption animation
        const miniJar = document.querySelector('.wish-jar-svg.mini');
        const miniGlow = document.querySelector('.wish-jar-glow-effect.mini');
        const miniStars = document.querySelector('.jar-stars-mini');
        
        if (miniJar) miniJar.classList.add('glow-shake');
        if (miniGlow) miniGlow.classList.add('active');
        if (miniStars) miniStars.classList.add('glowing');
        
        // Confetti burst from mini jar position
        const jarRect = miniJar.getBoundingClientRect();
        confetti({
            particleCount: 45,
            spread: 55,
            origin: { 
                x: (jarRect.left + jarRect.width / 2) / window.innerWidth, 
                y: (jarRect.top + jarRect.height / 2) / window.innerHeight 
            },
            colors: ['#f9d976', '#e9b646', '#ffffff']
        });

        // Swap input box for cake panel
        setTimeout(() => {
            document.getElementById('wish-input-panel').classList.add('hidden-panel');
            document.getElementById('cake-interactive-panel').classList.remove('hidden-panel');
            
            // Start the birthday arpeggio melody
            playMelodyMode = true;
            noteIndex = 0;
        }, 1200);
    }
});

const candles = document.querySelectorAll('.candle');
const candleCounter = document.getElementById('candle-counter');
let candlesLit = 3;

candles.forEach(candle => {
    candle.addEventListener('click', () => {
        if (!candle.classList.contains('extinguished')) {
            candle.classList.add('extinguished');
            candlesLit--;
            candleCounter.textContent = candlesLit;
            
            // Play synthesized blow noise
            playExtinguishSound();

            // Extinguish smoke puff effect
            confetti({
                particleCount: 18,
                spread: 35,
                origin: { y: 0.5 },
                colors: ['#dfe6e9', '#f1f2f6', '#ffffff']
            });

            if (candlesLit === 0) {
                triggerConfettiShower();
                
                const smoke = document.getElementById('smoke');
                smoke.style.opacity = '1';
                
                setTimeout(() => {
                    showScreen('screen-wishes');
                }, 1800);
            }
        }
    });
});


/* ==========================================================================
   SCREEN 6: THE HAPPY BIRTHDAY FINALE & WISH JAR REVEAL
   ========================================================================== */
function triggerConfettiShower() {
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.85 },
            colors: ['#ff758c', '#ff7eb3', '#f9d976', '#a29bfe']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.85 },
            colors: ['#ff758c', '#ff7eb3', '#f9d976', '#a29bfe']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

const revealWishJar = document.getElementById('reveal-wish-jar');
const wishBubble = document.getElementById('wish-display-bubble');
const wishDisplayText = document.getElementById('wish-display-text');
const closeWishBubble = document.getElementById('btn-close-wish-bubble');

if (revealWishJar && wishBubble) {
    revealWishJar.addEventListener('click', (e) => {
        e.stopPropagation();
        
        wishDisplayText.textContent = window.storedCrushWish || "Your secret wish is locked in the stars... 🌟";
        wishBubble.classList.add('visible');
        
        // Burst stars from reveal jar position
        const jarRect = revealWishJar.getBoundingClientRect();
        confetti({
            particleCount: 30,
            spread: 40,
            origin: { 
                x: (jarRect.left + jarRect.width / 2) / window.innerWidth, 
                y: (jarRect.top + jarRect.height / 2) / window.innerHeight 
            },
            colors: ['#f9d976', '#e9b646', '#ffffff', '#ff758c']
        });
    });
}

if (closeWishBubble) {
    closeWishBubble.addEventListener('click', (e) => {
        e.stopPropagation();
        wishBubble.classList.remove('visible');
    });
}

// Clicking away from wish bubble closes it
document.addEventListener('click', (e) => {
    if (wishBubble && wishBubble.classList.contains('visible') && !wishBubble.contains(e.target)) {
        wishBubble.classList.remove('visible');
    }
});


/* Replay Reset functionality */
document.getElementById('btn-replay').addEventListener('click', () => {
    candlesLit = 3;
    candleCounter.textContent = candlesLit;
    candles.forEach(c => c.classList.remove('extinguished'));
    document.getElementById('smoke').style.opacity = '0';

    currentCardIndex = 0;
    cards.forEach(c => {
        c.className = "stack-card";
    });
    updateCardStack();

    btnNo.style.position = 'relative';
    btnNo.style.left = 'auto';
    btnNo.style.top = 'auto';
    
    // Clear wish states
    window.storedCrushWish = "";
    if (wishBubble) wishBubble.classList.remove('visible');

    stopMusic();
    document.getElementById('main-envelope').classList.remove('open');
    showScreen('screen-envelope');
});
