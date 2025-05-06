// Enhanced color collection with metadata 
let colors = [ 
    { 
        hex: "#FF0000", 
        name: "Red", 
        dateAdded: new Date(2025, 0, 1), 
        proximity: "somewhat-close", 
        originalCode: "FF0000" 
    }, 
    { 
        hex: "#FF7F00", 
        name: "Orange", 
        dateAdded: new Date(2025, 0, 3), 
        proximity: "neutral", 
        originalCode: "FF7F00" 
    }, 
    { 
        hex: "#FFFF00", 
        name: "Yellow", 
        dateAdded: new Date(2025, 0, 5), 
        proximity: "very-close", 
        originalCode: "FFFF00" 
    }, 
    { 
        hex: "#00FF00", 
        name: "Green", 
        dateAdded: new Date(2025, 0, 7), 
        proximity: "somewhat-distant", 
        originalCode: "00FF00" 
    }, 
    { 
        hex: "#0000FF", 
        name: "Blue", 
        dateAdded: new Date(2025, 0, 9), 
        proximity: "very-distant", 
        originalCode: "0000FF" 
    } 
];

// Color code conversion database
const colorCodeMappings = {
    // Valspar paint color codes (format: XXXX-XXX)
    "8002-45C": "#92B2D1", // Moonglow - Light Blue
    "8002-30B": "#AEDE9E", // Cool Peridot - Light Green
    "8002-45G": "#7B9ECF", // Encore - Medium Blue
    "8002-20A": "#FFD493", // Example Orange
    "8002-10B": "#FFAFAF", // Example Pink
    "7006-12": "#6B8E8E",  // Sharkfin - Gray Blue
    "8003-38D": "#D8AC67", // Golden Straw - Warm Gold
    
    // Nissan paint color codes
    "K23": "#C0C0C0",    // Brilliant Silver Metallic
    "QAB": "#FFFFFF",    // Pearl White
    "NAH": "#B22222",    // Cayenne Red Pearl
    "NV245C": "#2B4B65", // Dark Blue Metallic
    "RAY": "#000000",    // Super Black
    "KAD": "#808080",    // Gun Metallic
    "EBL": "#003399"     // Coulis Blue
};

// Format detection patterns
const formatPatterns = [
    { name: "HEX", pattern: /^[0-9A-Fa-f]{6}$/i, prefix: "#" },
    { name: "VALSPAR", pattern: /^\d{4}-\d{2}[A-Z]$/i, prefix: "" },
    { name: "NISSAN", pattern: /^(NV)?\d{3}[A-Z]$|^[A-Z]{2,3}$/i, prefix: "" }
];

// Proximity values for color galaxy
const proximityValues = {
    "very-close": 0.2,
    "somewhat-close": 0.4,
    "neutral": 0.6,
    "somewhat-distant": 0.8,
    "very-distant": 1.0
};

// DOM elements
let preview, colorInput, formatDisplay, addBtn, viewContainer, countElement, viewButtons, notification;

// Current view
let currentView = 'grid';

// Function to fetch colors from the serverless function
async function fetchColors() {
    try {
        const response = await fetch('/.netlify/functions/getColors');
        if (!response.ok) throw new Error('Network response was not ok');
        const colors = await response.json();
        return colors;
    } catch (error) {
        console.error('Error fetching colors:', error);
        return [];
    }
}

// Function to add a new color with proximity data
async function addNewColorWithProximity(colorData, proximity) {
    try {
        const response = await fetch('/.netlify/functions/addColor', {
            method: 'POST',
            body: JSON.stringify({
                ...colorData,
                proximity
            })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding color:', error);
        // Fallback: Add to local array if server fails
        const newColor = {
            ...colorData,
            proximity,
            dateAdded: new Date()
        };
        colors.push(newColor);
        return newColor;
    }
}

// Initialize
window.onload = async function() {
    // Get DOM elements
    preview = document.getElementById('preview');
    colorInput = document.getElementById('color-code');
    formatDisplay = document.getElementById('format-display');
    addBtn = document.getElementById('add-btn');
    viewContainer = document.getElementById('view-container');
    countElement = document.getElementById('count');
    viewButtons = document.querySelectorAll('.view-btn');
    notification = document.getElementById('notification');
    
    // Add CSS for color spotlight to head
    addSpotlightStyles();
    
    // Try to fetch colors from the server
    const serverColors = await fetchColors();
    // If we got colors from the server, use them
    if (serverColors && serverColors.length > 0) {
        colors = serverColors;
    }
    
    renderView();
    updateCount();
    
    // Color input preview and format detection
    colorInput.addEventListener('input', function() {
        updatePreviewAndFormat();
    });
    
    // Add color button
    addBtn.addEventListener('click', function() {
        addNewColor();
    });
    
    // Add color on Enter key
    colorInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            addNewColor();
        }
    });
    
    // View buttons
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.getAttribute('data-view');
            
            // Add animation to container
            viewContainer.style.opacity = 0;
            setTimeout(() => {
                renderView();
                viewContainer.style.opacity = 1;
            }, 300);
        });
    });
};

// Update color preview and detect format
function updatePreviewAndFormat() {
    const code = colorInput.value.trim();
    
    // Reset
    preview.style.backgroundColor = '';
    formatDisplay.textContent = '';
    
    if (!code) return;
    
    // Detect format
    const format = detectFormat(code);
    if (format) {
        formatDisplay.textContent = format.name + " FORMAT";
        
        // Convert to hex for preview
        const hexColor = convertToHex(code, format);
        if (hexColor) {
            preview.style.backgroundColor = hexColor;
        }
    }
}

// Detect color code format
function detectFormat(code) {
    for (const format of formatPatterns) {
        if (format.pattern.test(code)) {
            return format;
        }
    }
    return null;
}

// Convert color code to hex based on format
function convertToHex(code, format) {
    // If it's already a hex code
    if (format.name === "HEX") {
        return format.prefix + code.toUpperCase();
    }
    
    // Check if it exists in our mapping
    if (colorCodeMappings[code]) {
        return colorCodeMappings[code];
    }
    
    // If not found in mapping, try to approximate based on the format
    switch (format.name) {
        case "VALSPAR":
            return approximateValsparColor(code);
        case "NISSAN":
            return approximateNissanColor(code);
        default:
            return null;
    }
}

// Approximate Valspar color when not in mapping
function approximateValsparColor(code) {
    // Format: XXXX-XXX (e.g., 8002-45C)
    const parts = code.split('-');
    if (parts.length !== 2) return '#CCCCCC';
    
    const baseCode = parts[0]; // e.g., "8002"
    const colorCode = parts[1]; // e.g., "45C"
    
    // Extract number and letter
    const number = parseInt(colorCode.slice(0, -1)) || 50;
    const letter = colorCode.slice(-1).toUpperCase();
    
    // Basic color approximation based on the letter
    let r = 128, g = 128, b = 128;
    
    // Letter indicates color family
    switch (letter) {
        case 'A': // Reds
            r = 200; g = 100; b = 100;
            break;
        case 'B': // Greens
            r = 100; g = 200; b = 100;
            break;
        case 'C': // Blues
            r = 100; g = 100; b = 200;
            break;
        case 'D': // Yellows
            r = 200; g = 200; b = 100;
            break;
        case 'E': // Purples
            r = 150; g = 100; b = 200;
            break;
        case 'F': // Oranges
            r = 200; g = 150; b = 100;
            break;
        case 'G': // Light Blues
            r = 100; g = 150; b = 200;
            break;
        default: // Neutral color
            r = g = b = 150;
    }
    
    // Use the number to adjust intensity/lightness
    const intensity = Math.min(100, number) / 100;
    r = Math.floor(r * intensity + (255 - r * intensity) * (1 - intensity));
    g = Math.floor(g * intensity + (255 - g * intensity) * (1 - intensity));
    b = Math.floor(b * intensity + (255 - b * intensity) * (1 - intensity));
    
    // Convert to hex
    return rgbToHex(r, g, b);
}

// Approximate Nissan color when not in mapping
function approximateNissanColor(code) {
    // For Nissan codes, use a hash-based approach for more consistent results
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate RGB components from hash
    let r = (hash & 0xFF0000) >> 16;
    let g = (hash & 0x00FF00) >> 8;
    let b = hash & 0x0000FF;
    
    // Make sure they're in range 0-255
    r = Math.abs(r % 256);
    g = Math.abs(g % 256);
    b = Math.abs(b % 256);
    
    // Convert to hex
    return rgbToHex(r, g, b);
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Add a new color
function addNewColor() {
    const code = colorInput.value.trim();
    if (!code) return;
    
    // Detect format
    const format = detectFormat(code);
    if (!format) {
        alert('Unknown color code format. Please try again.');
        return;
    }
    
    // Convert to hex
    const hexColor = convertToHex(code, format);
    if (!hexColor) {
        alert('Could not convert color code to hex.');
        return;
    }
    
    // Get color name
    let colorName = getColorName(hexColor, code, format.name);
    
    // Create a new color object with metadata
    const newColor = {
        hex: hexColor,
        originalCode: code,
        name: colorName
    };
    
    // Show the color spotlight with proximity question
    showColorSpotlight(newColor);
    
    // Clear input and preview
    colorInput.value = '';
    preview.style.backgroundColor = '';
    formatDisplay.textContent = '';
}

// Add CSS for spotlight
function addSpotlightStyles() {
    // Check if styles already exist
    if (document.getElementById('spotlight-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'spotlight-styles';
    styleSheet.textContent = `
        /* Color spotlight styles */
        .color-spotlight {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .proximity-question {
            background: rgba(0, 0, 0, 0.7);
            color: cyan;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            max-width: 500px;
            font-family: monospace;
        }
        
        .proximity-options {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .proximity-options button {
            background: rgba(0, 255, 255, 0.1);
            color: cyan;
            border: 1px solid cyan;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: monospace;
        }
        
        .proximity-options button:hover {
            background: rgba(0, 255, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .animated-square {
            position: fixed;
            width: 200px;
            height: 200px;
            z-index: 999;
            transition: all 0.5s ease;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        
        /* Galaxy view styles */
        .galaxy-view {
            position: relative;
            width: 100%;
            height: 600px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(0, 255, 255, 0.3);
        }
        
        .galaxy-star {
            position: absolute;
            width: 40px;
            height: 40px;
            margin: -20px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            transition: all 0.3s ease;
            animation: twinkle 4s infinite alternate;
        }
        
        .galaxy-star:hover {
            transform: scale(1.3);
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
        }
        
        .galaxy-center {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80px;
            height: 80px;
            margin: -40px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.7);
            animation: pulse 3s infinite alternate;
        }
        
        @keyframes pulse {
            from {
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
            }
            to {
                box-shadow: 0 0 50px rgba(0, 255, 255, 0.8);
            }
        }
        
        @keyframes twinkle {
            0% {
                opacity: 0.7;
            }
            50% {
                opacity: 1;
            }
            100% {
                opacity: 0.7;
            }
        }
        
        /* Color theory view styles */
        .color-theory-view {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .color-theory-section {
            background: rgba(0, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.3);
            padding: 15px;
            border-radius: 5px;
            animation: slideIn 0.5s ease-out;
        }
        
        .color-theory-title {
            font-size: 16px;
            margin-bottom: 10px;
            color: cyan;
            border-bottom: 1px solid rgba(0, 255, 255, 0.3);
            padding-bottom: 5px;
        }
        
        .color-theory-description {
            font-size: 12px;
            margin-bottom: 15px;
            color: rgba(0, 255, 255, 0.8);
        }
        
        .color-theory-combinations {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .color-theory-combination {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 5px;
            width: 150px;
        }
        
        .color-theory-swatches {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .color-theory-swatch {
            width: 30px;
            height: 30px;
            border-radius: 3px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .color-theory-swatch:hover {
            transform: scale(1.2);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .color-theory-info {
            font-size: 10px;
            color: rgba(0, 255, 255, 0.7);
            text-align: center;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Color spotlight animation and proximity question
function showColorSpotlight(color) {
    // Create spotlight container
    const spotlight = document.createElement('div');
    spotlight.className = 'color-spotlight';
    spotlight.style.backgroundColor = color.hex;
    
    // Create proximity question
    const question = document.createElement('div');
    question.className = 'proximity-question';
    question.innerHTML = `
        <h3>Does this color feel near or far to you?</h3>
        <div class="proximity-options">
            <button data-proximity="very-close">Very Close</button>
            <button data-proximity="somewhat-close">Somewhat Close</button>
            <button data-proximity="neutral">Neutral</button>
            <button data-proximity="somewhat-distant">Somewhat Distant</button>
            <button data-proximity="very-distant">Very Distant</button>
        </div>
    `;
    
    spotlight.appendChild(question);
    document.body.appendChild(spotlight);
    
    // Add event listeners to buttons
    const buttons = spotlight.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const proximity = button.dataset.proximity;
            
            // Save color with proximity
            await addNewColorWithProximity(color, proximity);
            
            // Animate color joining the collection
            animateColorJoining(spotlight, color);
        });
    });
}
