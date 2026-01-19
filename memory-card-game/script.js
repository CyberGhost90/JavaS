// Game State
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let isProcessing = false;

// Card emojis (8 pairs)
const cardSymbols = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎹', '🎺'];

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const matchesDisplay = document.getElementById('matches');
const resetBtn = document.getElementById('resetBtn');
const victoryModal = document.getElementById('victoryModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');

// Initialize game
function initGame() {
    // Reset state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    isProcessing = false;

    // Stop and reset timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Update displays
    updateDisplays();

    // Hide victory modal
    victoryModal.classList.remove('active');

    // Create card pairs
    const cardPairs = [...cardSymbols, ...cardSymbols];

    // Shuffle cards
    const shuffledCards = shuffleArray(cardPairs);

    // Clear board
    gameBoard.innerHTML = '';

    // Create card elements
    shuffledCards.forEach((symbol, index) => {
        const card = createCard(symbol, index);
        cards.push({
            element: card,
            symbol: symbol,
            id: index,
            isFlipped: false,
            isMatched: false
        });
        gameBoard.appendChild(card);
    });
}

// Create card element
function createCard(symbol, id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;

    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.textContent = symbol;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    card.addEventListener('click', () => handleCardClick(id));

    return card;
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Handle card click
function handleCardClick(id) {
    // Prevent clicking if processing or card already flipped
    if (isProcessing) return;

    const card = cards[id];

    if (card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Start timer on first click
    if (moves === 0 && !timerInterval) {
        startTimer();
    }

    // Flip card
    flipCard(card);

    // Add to flipped cards
    flippedCards.push(card);

    // Check for match when 2 cards are flipped
    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        updateDisplays();
        checkMatch();
    }
}

// Flip card
function flipCard(card) {
    card.isFlipped = true;
    card.element.classList.add('flipped');
}

// Unflip card
function unflipCard(card) {
    card.isFlipped = false;
    card.element.classList.remove('flipped');
}

// Check if cards match
function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.symbol === card2.symbol) {
        // Match found
        setTimeout(() => {
            markAsMatched(card1);
            markAsMatched(card2);
            flippedCards = [];
            isProcessing = false;
            matchedPairs++;
            updateDisplays();
            checkWin();
        }, 600);
    } else {
        // No match
        setTimeout(() => {
            unflipCard(card1);
            unflipCard(card2);
            flippedCards = [];
            isProcessing = false;
        }, 1000);
    }
}

// Mark card as matched
function markAsMatched(card) {
    card.isMatched = true;
    card.element.classList.add('matched');
}

// Check for win
function checkWin() {
    if (matchedPairs === cardSymbols.length) {
        stopTimer();
        setTimeout(() => {
            showVictoryModal();
        }, 500);
    }
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateTimerDisplay();
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Update all displays
function updateDisplays() {
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = `${matchedPairs}/8`;
    updateTimerDisplay();
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Show victory modal
function showVictoryModal() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    finalMoves.textContent = moves;
    finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    victoryModal.classList.add('active');
}

// Event listeners
resetBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Initialize game on load
initGame();
