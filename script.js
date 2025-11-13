function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function wrapLetters(str, element, seed = 1, style = 'chaotic') {
  const fonts = [
    'caveat',
    'cedarville-cursive',
    'indie-flower',
    'nothing-you-could-do',
    'oooh-baby',
    'reenie-beanie',
    'shadows-into-light',
    'pacifico',
    'permanent-marker',
    'satisfy',
    'fredoka-one'
  ];

  const blacklist = {
    l: ['cedarville-cursive', 'oooh-baby', 'nothing-you-could-do', 'fredoka-one']
  };

  // Font grouping for different styles
  const fontGroups = {
    flowing: ['caveat', 'indie-flower', 'shadows-into-light', 'satisfy'],
    quirky: ['nothing-you-could-do', 'oooh-baby', 'reenie-beanie', 'fredoka-one'],
    cursive: ['cedarville-cursive', 'pacifico'],
    playful: ['permanent-marker', 'fredoka-one', 'oooh-baby'],
    elegant: ['satisfy', 'caveat', 'shadows-into-light', 'pacifico']
  };

  const lastUsed = {};
  element.innerHTML = '';

  let currentSeed = seed;

  for (const char of str) {
    const lowerChar = char.toLowerCase();
    let font;

    if (style === 'chaotic') {
      // Original algorithm: avoid repetition and blacklist
      let availableFonts = fonts;

      if (blacklist[lowerChar]) {
        availableFonts = fonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      if (lastUsed[lowerChar]) {
        availableFonts = availableFonts.filter(f => f !== lastUsed[lowerChar]);
      }

      const fontIndex = Math.floor(seededRandom(currentSeed) * availableFonts.length);
      font = availableFonts[fontIndex] || fonts[0];
      lastUsed[lowerChar] = font;

    } else if (style === 'flowing') {
      // Group fonts by style - stays within groups more often
      let availableGroups = Object.keys(fontGroups);
      const groupIndex = Math.floor(seededRandom(currentSeed) * availableGroups.length);
      const selectedGroup = availableGroups[groupIndex];
      const groupFonts = fontGroups[selectedGroup];

      let availableFonts = groupFonts;

      if (blacklist[lowerChar]) {
        availableFonts = groupFonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      if (availableFonts.length === 0) {
        availableFonts = fonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      const fontIndex = Math.floor(seededRandom(currentSeed + 0.5) * availableFonts.length);
      font = availableFonts[fontIndex] || fonts[0];

    } else if (style === 'pure-random') {
      // Pure random - each character is completely random (ignores last used)
      let availableFonts = fonts;

      if (blacklist[lowerChar]) {
        availableFonts = fonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      const fontIndex = Math.floor(seededRandom(currentSeed) * availableFonts.length);
      font = availableFonts[fontIndex] || fonts[0];

    } else if (style === 'elegant') {
      // Elegant style - prefers refined fonts, avoids playful ones
      const elegantFonts = ['satisfy', 'caveat', 'shadows-into-light', 'pacifico', 'indie-flower'];
      let availableFonts = elegantFonts;

      if (blacklist[lowerChar]) {
        availableFonts = elegantFonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      if (lastUsed[lowerChar]) {
        availableFonts = availableFonts.filter(f => f !== lastUsed[lowerChar]);
      }

      if (availableFonts.length === 0) {
        availableFonts = fonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      const fontIndex = Math.floor(seededRandom(currentSeed) * availableFonts.length);
      font = availableFonts[fontIndex] || fonts[0];
      lastUsed[lowerChar] = font;

    } else if (style === 'playful') {
      // Playful style - prefers quirky and fun fonts
      const playfulFonts = ['permanent-marker', 'fredoka-one', 'oooh-baby', 'nothing-you-could-do', 'reenie-beanie'];
      let availableFonts = playfulFonts;

      if (blacklist[lowerChar]) {
        availableFonts = playfulFonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      if (availableFonts.length === 0) {
        availableFonts = fonts.filter(f => !blacklist[lowerChar].includes(f));
      }

      const fontIndex = Math.floor(seededRandom(currentSeed + 1) * availableFonts.length);
      font = availableFonts[fontIndex] || fonts[0];
    }

    const span = document.createElement('span');
    span.className = font;
    span.textContent = char;
    element.appendChild(span);

    currentSeed++;
  }
}

// Get elements
const textInput = document.querySelector('#textInput');
const outputElement = document.querySelector('#output');
const clearBtn = document.querySelector('#clearBtn');
const copyBtn = document.querySelector('#copyBtn');
const colorPicker = document.querySelector('#colorPicker');
const styleSelect = document.querySelector('#styleSelect');

// Start with empty textarea
textInput.value = '';
outputElement.innerHTML = '';

// Function to apply color to all spans in output
function applyColorToOutput(color) {
  const spans = outputElement.querySelectorAll('span');
  spans.forEach(span => {
    span.style.color = color;
  });
}

// Function to update output with current style
function updateOutput() {
  const text = textInput.value;
  if (text.length > 0) {
    wrapLetters(text, outputElement, 12, styleSelect.value);
    applyColorToOutput(colorPicker.value);
  } else {
    outputElement.innerHTML = '';
  }
}

// Listen for input changes
textInput.addEventListener('input', updateOutput);

// Listen for style changes
styleSelect.addEventListener('change', updateOutput);

// Listen for color changes
colorPicker.addEventListener('input', (e) => {
  applyColorToOutput(e.target.value);
});

// Clear button
clearBtn.addEventListener('click', () => {
  textInput.value = '';
  outputElement.innerHTML = '';
});

// Copy button - copy styled output as image
copyBtn.addEventListener('click', async () => {
  if (outputElement.innerHTML.length === 0) {
    alert('Please type something first!');
    return;
  }

  try {
    // Convert the output element to canvas
    const canvas = await html2canvas(outputElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    // Convert canvas to blob and copy to clipboard
    canvas.toBlob((blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied as PNG!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy image to clipboard');
      });
    });
  } catch (err) {
    console.error('Error capturing image:', err);
    alert('Error creating image');
  }
});