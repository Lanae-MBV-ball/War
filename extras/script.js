const suits = ['hearts', 'diamonds', 'spades', 'clubs'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
const values = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'Jack': 11, 'Queen': 12, 'King': 13, 'Ace': 14
};


let deck = [];
let player1Hand = [];
let player2Hand = [];
let warPile = [];

// DOM element selections (update these selectors to match your HTML)
const player1CardDiv = document.getElementById('player1-card');
const player2CardDiv = document.getElementById('player2-card');
const player1CountDiv = document.getElementById('player1-count');
const player2CountDiv = document.getElementById('player2-count');
const winnerAnnouncement = document.getElementById('winner-announcement');


// Function to create a full deck of 52 cards
function createDeck() {
    deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank, value: values[rank] });
        }
    }
}


// Function to shuffle the deck (Fisher-Yates shuffle algorithm)
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}


// Function to deal cards evenly
function dealCards() {
    player1Hand = deck.slice(0, 26);
    player2Hand = deck.slice(26, 52);
    warPile = [];
    updateUICounts();
    updateUICards(null, null);
    winnerAnnouncement.textContent = '';
}


// Function to update UI for cards
function updateUICards(card1, card2) {
    player1CardDiv.textContent = card1 ? `${card1.rank} of ${card1.suit}` : '';
    player2CardDiv.textContent = card2 ? `${card2.rank} of ${card2.suit}` : '';
}

// Function to update UI for card counts
function updateUICounts() {
    player1CountDiv.textContent = `Cards: ${player1Hand.length}`;
    player2CountDiv.textContent = `Cards: ${player2Hand.length}`;
}



let gameOver = false;
let dealCount = 0;
const MAX_DEALS = 100;


function playRound(warCards = []) {
    if (gameOver) return;
    if (player1Hand.length === 0 || player2Hand.length === 0) {
        // Determine winner and end game
        if (player1Hand.length > player2Hand.length) {
            winnerAnnouncement.textContent = 'Congratulations, Player 1 wins the whole game!';
        } else if (player2Hand.length > player1Hand.length) {
            winnerAnnouncement.textContent = 'Congratulations, Player 2 wins the whole game!';
        } else {
            winnerAnnouncement.textContent = "It's a tie!";
        }
        updateUICards(null, null);
        gameOver = true;
        return;
    }

    // Only increment dealCount for top-level (not recursive war) calls
    if (warCards.length === 0) {
        dealCount++;
        if (dealCount >= MAX_DEALS) {
            // End game after 100 deals
            if (player1Hand.length > player2Hand.length) {
                winnerAnnouncement.textContent = 'Congratulations, Player 1 wins after 50 deals!';
            } else if (player2Hand.length > player1Hand.length) {
                winnerAnnouncement.textContent = 'Congratulations, Player 2 wins after 50 deals!';
            } else {
                winnerAnnouncement.textContent = "It's a tie after 100 deals!";
            }
            updateUICards(null, null);
            gameOver = true;
            updateUICounts();
            return;
        }
    }

    const player1Card = player1Hand.shift();
    const player2Card = player2Hand.shift();
    updateUICards(player1Card, player2Card);

    // Add played cards to war pile
    let currentWarPile = [...warCards, player1Card, player2Card];

    // If the player has a math advantage and this is a top-level round, award the pile to player1
    if (mathAdvantage && warCards.length === 0) {
        shuffleArray(currentWarPile);
        player1Hand.push(...currentWarPile);
        winnerAnnouncement.textContent = 'Player 1 wins the round (math advantage)!';
        mathAdvantage = false;
        // hide advantage badge if present
        const advBadgeHide = document.getElementById('math-adv-badge');
        if (advBadgeHide) advBadgeHide.hidden = true;
        updateUICounts();
        return;
    }

    if (player1Card.value > player2Card.value) {
        player1Hand.push(...currentWarPile);
        winnerAnnouncement.textContent = 'Player 1 wins the round!';
    } else if (player2Card.value > player1Card.value) {
        player2Hand.push(...currentWarPile);
        winnerAnnouncement.textContent = 'Player 2 wins the round!';
    } else {
        winnerAnnouncement.textContent = 'War!';
        let warCards1 = [];
        let warCards2 = [];
        for (let i = 0; i < 3; i++) {
            if (player1Hand.length > 0) warCards1.push(player1Hand.shift());
            if (player2Hand.length > 0) warCards2.push(player2Hand.shift());
        }
        // If either player runs out of cards during war, the other wins
        if (player1Hand.length === 0 || player2Hand.length === 0) {
            if (player1Hand.length > player2Hand.length) {
                winnerAnnouncement.textContent = 'Congratulations, Player 1 wins the whole game!';
            } else if (player2Hand.length > player1Hand.length) {
                winnerAnnouncement.textContent = 'Congratulations, Player 2 wins the whole game!';
            } else {
                winnerAnnouncement.textContent = "It's a tie!";
            }
            updateUICounts();
            gameOver = true;
            return;
        }
        playRound([...currentWarPile, ...warCards1, ...warCards2]);
        return;
    }
    updateUICounts();
}


// Event listener for the deal/next round button


document.getElementById('deal-button').addEventListener('click', () => {
    if (deck.length === 0 || player1Hand.length === 0 || player2Hand.length === 0) {
        createDeck();
        shuffleDeck();
        dealCards();
        gameOver = false;
        dealCount = 0;
        // hide advantage badge when starting a new game
        const advBadgeReset = document.getElementById('math-adv-badge');
        if (advBadgeReset) advBadgeReset.hidden = true;
        return;
    }
    playRound();
});

// -----------------------------
// Math game UI + logic
// -----------------------------
const mathOpSelect = document.getElementById('math-op');
const mathNewBtn = document.getElementById('math-new');
const mathProblemDiv = document.getElementById('math-problem');
const mathAnswerInput = document.getElementById('math-answer');
const mathSubmitBtn = document.getElementById('math-submit');
const mathFeedbackDiv = document.getElementById('math-feedback');
const mathScoreSpan = document.getElementById('math-score');

let currentAnswer = null;
let mathScore = 0;
let mathAdvantage = false; // when true, player1 will auto-win next top-level War round

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to shuffle an array in place (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateProblem() {
    const op = mathOpSelect.value;
    let a, b;
    if (op === 'add') {
        a = randInt(1, 50);
        b = randInt(1, 50);
        currentAnswer = a + b;
        mathProblemDiv.textContent = `${a} + ${b} = ?`;
    } else if (op === 'sub') {
        a = randInt(1, 50);
        b = randInt(1, a); // ensure non-negative
        currentAnswer = a - b;
        mathProblemDiv.textContent = `${a} − ${b} = ?`;
    } else if (op === 'mul') {
        a = randInt(1, 12);
        b = randInt(1, 12);
        currentAnswer = a * b;
        mathProblemDiv.textContent = `${a} × ${b} = ?`;
    }
    mathFeedbackDiv.textContent = '';
    mathAnswerInput.value = '';
    mathAnswerInput.focus();
}

function submitAnswer() {
    if (currentAnswer === null) {
        mathFeedbackDiv.textContent = 'Click "New Problem" first.';
        return;
    }
    const userVal = Number(mathAnswerInput.value);
    if (Number.isNaN(userVal) || mathAnswerInput.value === '') {
        mathFeedbackDiv.textContent = 'Please enter a numeric answer.';
        return;
    }
    if (userVal === currentAnswer) {
        mathScore += 1;
        mathFeedbackDiv.textContent = 'Correct! ✅ You earned an advantage: your next War round will auto-win.';
        mathScoreSpan.textContent = mathScore;
        mathAdvantage = true;
        // show advantage badge (if present)
        const advBadge = document.getElementById('math-adv-badge');
        if (advBadge) advBadge.hidden = false;
        // generate a new problem automatically
        setTimeout(generateProblem, 700);
    } else {
        mathFeedbackDiv.textContent = `Incorrect — the correct answer was ${currentAnswer}.`;
        // keep currentAnswer so user can try another or get a new one
    }
    mathAnswerInput.value = '';
    mathAnswerInput.focus();
}

mathNewBtn.addEventListener('click', generateProblem);
mathSubmitBtn.addEventListener('click', submitAnswer);
mathAnswerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
});

// generate an initial problem so the UI isn't empty
generateProblem();
