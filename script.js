// script.js

let grid = document.getElementById("grid");
const playButton = document.getElementById("play");
const saveButton = document.getElementById("save");
const clearButton = document.getElementById("clear");
const tempoInput = document.getElementById("tempo");
const instrumentSelect = document.getElementById("instrument");
const volumeInput = document.getElementById("volume");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const resizeButton = document.getElementById("resize");
const transposeInput = document.getElementById("transpose");
const transposeButton = document.getElementById("apply-transpose");

// MIDI array to store notes
let notes = [];
let gridWidth = parseInt(widthInput.value);
let gridHeight = parseInt(heightInput.value);
let history = []; // For undo/redo functionality
let undone = [];

// Initialize the grid
function initializeGrid() {
  grid.innerHTML = ""; // Clear existing grid
  for (let i = 0; i < gridWidth * gridHeight; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => toggleCell(cell));
    grid.appendChild(cell);
  }
  grid.style.gridTemplateColumns = `repeat(${gridWidth}, 40px)`;
  grid.style.gridTemplateRows = `repeat(${gridHeight}, 40px)`;
}
initializeGrid();

// Save state to history for undo
function saveToHistory() {
  history.push(JSON.parse(JSON.stringify(notes)));
  undone = []; // Clear undone history when a new change is made
}

// Toggle the cell's active state
function toggleCell(cell) {
  const index = parseInt(cell.dataset.index);
  const time = index % gridWidth;
  const pitch = Math.floor(index / gridWidth);
  cell.classList.toggle("active");

  saveToHistory(); // Save to history before making changes

  if (cell.classList.contains("active")) {
    notes.push({ time, pitch, duration: 1 });
  } else {
    notes = notes.filter((note) => !(note.time === time && note.pitch === pitch));
  }
}

// Play the music using the Web Audio API
playButton.addEventListener("click", () => {
  const tempo = parseInt(tempoInput.value);
  const volume = parseFloat(volumeInput.value);

  if (notes.length === 0) {
    alert("No notes to play!");
    return;
  }

  const context = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = context.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(context.destination);

  notes.forEach(({ time, pitch }) => {
    const oscillator = context.createOscillator();
    oscillator.frequency.value = 440 * Math.pow(2, (pitch - 9) / 12); // Calculate pitch frequency
    oscillator.type = getOscillatorType(instrumentSelect.value); // Change sound based on instrument
    oscillator.connect(gainNode);

    const cellIndex = time + pitch * gridWidth;
    const cell = grid.querySelector(`[data-index='${cellIndex}']`);
    setTimeout(() => {
      cell.classList.add("playback");
      setTimeout(() => cell.classList.remove("playback"), 500);
    }, time * (60 / tempo) * 1000);

    oscillator.start(context.currentTime + (time * (60 / tempo))); // Adjust timing based on tempo
    oscillator.stop(context.currentTime + (time * (60 / tempo)) + 0.4);
  });
});

// Get oscillator type based on instrument
function getOscillatorType(instrument) {
  switch (parseInt(instrument)) {
    case 0: return "sine";    // Piano
    case 1: return "square";  // Guitar
    case 2: return "sawtooth"; // Violin
    case 3: return "triangle"; // Flute
    default: return "sine";
  }
}

// Transpose notes
transposeButton.addEventListener("click", () => {
  const transposeAmount = parseInt(transposeInput.value);
  notes.forEach((note) => {
    note.pitch = Math.max(0, Math.min(gridHeight - 1, note.pitch + transposeAmount));
  });
  updateGrid();
});

// Update grid based on notes
function updateGrid() {
  document.querySelectorAll(".cell").forEach((cell) => cell.classList.remove("active"));
  notes.forEach(({ time, pitch }) => {
    const cellIndex = time + pitch * gridWidth;
    const cell = grid.querySelector(`[data-index='${cellIndex}']`);
    if (cell) cell.classList.add("active");
  });
}

// Save the notes as a MIDI file
saveButton.addEventListener("click", () => {
  // Same implementation as before
});

// Clear the grid and reset the notes
clearButton.addEventListener("click", () => {
  saveToHistory();
  notes = [];
  document.querySelectorAll(".cell").forEach((cell) => cell.classList.remove("active"));
});

// Resize the grid based on user input
resizeButton.addEventListener("click", () => {
  gridWidth = parseInt(widthInput.value);
  gridHeight = parseInt(heightInput.value);
  initializeGrid();
  updateGrid();
});
