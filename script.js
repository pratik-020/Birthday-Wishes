/* ==========================================================================
   PARTICLE CANVAS BACKGROUND (FAIRY DUST & HEARTS)
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 28; // slightly more for rich fairy dust texture

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class MagicParticle {
    constructor() {
        this.reset(true);
    }

    reset(initialSetup = false) {
        this.x = Math.random() * canvas.width;
        this.y = initialSetup ? Math.random() * canvas.height : canvas.height + 20;
        this.type = Math.random() > 0.45 ? 'sparkle' : 'heart'; // fairy dust mixed with hearts
        
        if (this.type === 'heart') {
            this.size = Math.random() * 10 + 6;
            this.speedY = Math.random() * 0.7 + 0.3;
            this.color = '#ff8fa4';
        } else {
            this.size = Math.random() * 3 + 1.5;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? '#ffeaa7' : '#ffffff'; // gold & white sparkles
        }
        
        this.opacity = Math.random() * 0.4 + 0.2;
        this.maxOpacity = this.opacity;
        this.wiggle = Math.random() * 0.015;
        this.wiggleSpeed = Math.random() * 0.02;
        this.twinkleRate = Math.random() * 0.01 + 0.005;
    }

    update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y * this.wiggle) * 0.35;
        
        // Twinkling effect
        if (this.type === 'sparkle') {
            this.opacity = Math.abs(Math.sin(this.y * this.twinkleRate)) * this.maxOpacity;
        } else {
            this.opacity -= 0.0003;
        }

        if (this.y < -20 || this.opacity <= 0) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        if (this.type === 'heart') {
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
            // Draw Sparkle (Twinkling Soft Dot with a glow aura)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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
   WEB AUDIO API SYNTHESIZER (MUSIC BOX)
   ========================================================================== */
let audioCtx = null;
let synthTimer = null;
let isPlaying = false;
let currentTempo = 105; // Slightly slower, gentler tempo
let beatTime = 60 / currentTempo;

// Chords Sequence: Cmaj9 -> Am9 -> Fmaj7 -> G7sus4 (Music Box Plucks)
const chordProgression = [
    // Cmaj9: C3, G3, E4, B4, D5
    [130.81, 196.00, 329.63, 493.88, 587.33],
    // Am9: A2, E3, C4, G4, B4
    [110.00, 164.81, 261.63, 392.00, 493.88],
    // Fmaj7: F2, C3, A3, E4, G4
    [87.31, 130.81, 220.00, 329.63, 392.00],
    // G7sus4/G7: G2, D3, G3, C4, F4 -> B4
    [98.00, 146.83, 196.00, 261.63, 349.23]
];

// Happy Birthday Melody
const happyBirthdayMelody = [
    [392.00, 0.75, 0.25], // Happy
    [392.00, 0.25, 0.05], // birth-
    [440.00, 1.00, 0.10], // day
    [392.00, 1.00, 0.10], // to
    [523.25, 1.00, 0.10], // you
    [493.88, 2.00, 0.20], // ---

    [392.00, 0.75, 0.25], // Happy
    [392.00, 0.25, 0.05], // birth-
    [440.00, 1.00, 0.10], // day
    [392.00, 1.00, 0.10], // to
    [587.33, 1.00, 0.10], // you
    [523.25, 2.00, 0.20], // ---

    [392.00, 0.75, 0.25], // Happy
    [392.00, 0.25, 0.05], // birth-
    [783.99, 1.00, 0.10], // day
    [659.25, 1.00, 0.10], // dear
    [523.25, 1.00, 0.10], // crush
    [493.88, 1.00, 0.10], // (name)
    [440.00, 2.00, 0.20], // ---

    [698.46, 0.75, 0.25], // Hap-
    [698.46, 0.25, 0.05], // py
    [659.25, 1.00, 0.10], // birth-
    [523.25, 1.00, 0.10], // day
    [587.33, 1.00, 0.10], // to
    [523.25, 2.50, 0.50]  // you
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

    // Warm, rounded music box filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);

    // Pluck amplitude envelope curve
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 1.55);
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
                // Triangle wave note for clean music box vibe
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
                playPluck(chord[0], nextEventTime, 0.14, 'sine'); // root note
            } else if (beatStep === 2) {
                playPluck(chord[2], nextEventTime, 0.09, 'sine');
            } else if (beatStep === 4) {
                playPluck(chord[3], nextEventTime, 0.10, 'sine');
                playPluck(chord[4], nextEventTime, 0.08, 'sine');
            } else if (beatStep === 6) {
                playPluck(chord[1], nextEventTime, 0.09, 'sine');
            }

            nextEventTime += beatTime * 0.5; // schedule every eighth note
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
        playMelodyMode = true;
        noteIndex = 0;
    } else if (screenId === 'screen-wishes') {
        triggerConfettiShower();
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
            particleCount: 40,
            spread: 70,
            origin: { y: 0.75 },
            colors: ['#ff8fa4', '#ff6b8b', '#ffffff', '#ffeaa7']
        });

        setTimeout(() => {
            showScreen('screen-intro');
        }, 1500);
    }
}

// Bind to envelope and wax seal for multiple touch points
seal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
});
envelope.addEventListener('click', openEnvelope);


/* ==========================================================================
   SCREEN 2: HEARTFELT INTRO (TYPING EFFECT)
   ========================================================================== */
const introText1 = "Today is a beautiful day, because it's the day that a truly incredible person was brought into this world... 💝";
const introText2 = "I wanted to create something small, cute, and completely unique to say Happy Birthday to you. Let's start! ✨";

function startTypingIntro() {
    const line1Element = document.getElementById('intro-text-line-1');
    const line2Element = document.getElementById('intro-text-line-2');
    const actionBtn = document.getElementById('btn-to-carousel');

    line1Element.textContent = "";
    line2Element.textContent = "";
    actionBtn.classList.remove('visible');

    let i = 0;
    function typeLine1() {
        if (i < introText1.length) {
            line1Element.textContent += introText1.charAt(i);
            i++;
            setTimeout(typeLine1, 35);
        } else {
            let j = 0;
            function typeLine2() {
                if (j < introText2.length) {
                    line2Element.textContent += introText2.charAt(j);
                    j++;
                    setTimeout(typeLine2, 35);
                } else {
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
   SCREEN 3: WHY YOU'RE AMAZING CAROUSEL (SWIPEABLE POLAROID DECK)
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
}

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


/* ==========================================================================
   SCREEN 4: PLAYFUL ESCAPING "NO" DATE BUTTON GAME
   ========================================================================== */
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const escapeContainer = document.getElementById('escape-container');

function escapeButton() {
    const containerRect = escapeContainer.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Max bounds offset within the container
    const maxX = containerRect.width - btnRect.width;
    const maxY = 155; // vertical offset area

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor((Math.random() - 0.5) * maxY);

    btnNo.style.position = 'absolute';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
}

btnNo.addEventListener('mouseenter', escapeButton);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    escapeButton();
});

btnYes.addEventListener('click', () => {
    confetti({
        particleCount: 160,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#ff6b8b', '#ff8a9f', '#ffeaa7', '#a29bfe']
    });

    setTimeout(() => {
        showScreen('screen-cake');
    }, 1250);
});


/* ==========================================================================
   SCREEN 5: THE BIRTHDAY CAKE CANDLES GAME
   ========================================================================== */
const candles = document.querySelectorAll('.candle');
const candleCounter = document.getElementById('candle-counter');
let candlesLit = 3;

candles.forEach(candle => {
    candle.addEventListener('click', () => {
        if (!candle.classList.contains('extinguished')) {
            candle.classList.add('extinguished');
            candlesLit--;
            candleCounter.textContent = candlesLit;
            
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
   SCREEN 6: THE HAPPY BIRTHDAY FINALE
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
            colors: ['#ff8fa4', '#ff6b8b', '#ffeaa7', '#a29bfe']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.85 },
            colors: ['#ff8fa4', '#ff6b8b', '#ffeaa7', '#a29bfe']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

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

    stopMusic();
    document.getElementById('main-envelope').classList.remove('open');
    showScreen('screen-envelope');
});
