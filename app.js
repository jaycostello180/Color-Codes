// Default color collection with initial samples
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

// LocalStorage functions
function saveColorsToStorage() {
    try {
        localStorage.setItem('colorCollective', JSON.stringify(colors));
        console.log('Saved', colors.length, 'colors to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadColorsFromStorage() {
    try {
        const stored = localStorage.getItem('colorCollective');
        if (stored) {
            const parsed = JSON.parse(stored);
            console.log('Loaded', parsed.length, 'colors from localStorage');
            
            // Convert date strings back to Date objects
            return parsed.map(color => ({
                ...color,
                dateAdded: new Date(color.dateAdded)
            }));
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return null;
}

// Function to fetch colors from the serverless function
async function fetchColors() {
    try {
        console.log('Attempting to fetch colors from server...');
        const response = await fetch('/.netlify/functions/getColors');
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Successfully fetched', data.length, 'colors from server');
        
        // Convert date strings to Date objects
        return data.map(color => ({
            ...color,
            dateAdded: new Date(color.dateAdded)
        }));
    } catch (error) {
        console.error('Error fetching colors from server:', error);
        return null;
    }
}

// Function to add a new color with proximity data
async function addNewColorWithProximity(colorData, proximity) {
    try {
        console.log('Adding new color:', colorData.hex, 'with proximity:', proximity);
        
        // First add to local array for immediate display
        const newColor = {
            ...colorData,
            proximity,
            dateAdded: new Date()
        };
        
        colors.push(newColor);
        
        // Save to localStorage
        saveColorsToStorage();
        
        // Then try to save to server
        const response = await fetch('/.netlify/functions/addColor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...colorData,
                proximity
            })
        });
        
        if (!response.ok) {
            console.warn('Server save failed, but color was added locally');
            return newColor;
        }
        
        const result = await response.json();
        console.log('Color successfully saved to server');
        return result;
    } catch (error) {
        console.error('Error in addNewColorWithProximity:', error);
        // We already added it locally, so no need to do anything else
        return colorData;
    }
}

// Initialize
window.onload = async function() {
    console.log('Initializing Color Collective...');
    
    // Fix UI layout issues
    fixInputLayout();
    
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
    
    // Try to load colors from localStorage first
    const storedColors = loadColorsFromStorage();
    
    if (storedColors && storedColors.length > 0) {
        colors = storedColors;
        console.log('Using colors from localStorage');
    } else {
        // If no localStorage, try server
        const serverColors = await fetchColors();
        if (serverColors && serverColors.length > 0) {
            colors = serverColors;
            console.log('Using colors from server');
            // Save to localStorage for next time
            saveColorsToStorage();
        } else {
            console.log('Using default color set');
        }
    }
    
    // Render the initial view - skip title page
    renderView();
    updateCount();
    
    // Set up event listeners
    colorInput.addEventListener('input', updatePreviewAndFormat);
    
    addBtn.addEventListener('click', addNewColor);
    
    colorInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            addNewColor();
        }
    });
    
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
    
    console.log('Initialization complete');
};

// Fix layout issues
function fixInputLayout() {
    // Adjust input container layout
    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) {
        inputContainer.style.flexWrap = 'wrap';
        
        // Make sure input group has enough space
        const inputGroup = document.querySelector('.input-group');
        if (inputGroup) {
            inputGroup.style.minWidth = '200px';
            inputGroup.style.flexGrow = '1';
            inputGroup.style.flexBasis = '60%';
        }
        
        // Give the button some space
        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            addBtn.style.minWidth = '100px';
            addBtn.style.flexShrink = '0'; 
        }
    }
}

// Update color preview and detect format
function updatePreviewAndFormat() {
    const code = colorInput.value.trim();
    
    // Reset preview and format display
    preview.style.backgroundColor = '';
    formatDisplay.textContent = '';
    
    if (!code) return;
    
    // Normalize input by removing '#' if present for hex codes
    const normalizedCode = code.startsWith('#') ? code.substring(1) : code;
    
    // Detect format
    const format = detectFormat(normalizedCode);
    if (format) {
        formatDisplay.textContent = format.name + " FORMAT";
        
        // Convert to hex for preview
        const hexColor = convertToHex(normalizedCode, format);
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
        return "#" + code.toUpperCase();
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
    r = Math.min(255, Math.max(0, Math.round(r)));
    g = Math.min(255, Math.max(0, Math.round(g)));
    b = Math.min(255, Math.max(0, Math.round(b)));
    
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
}

// Add a new color
function addNewColor() {
    const code = colorInput.value.trim();
    if (!code) {
        showNotification('Please enter a color code');
        return;
    }
    
    // Normalize input by removing '#' if present for hex codes
    const normalizedCode = code.startsWith('#') ? code.substring(1) : code;
    
    // Detect format
    const format = detectFormat(normalizedCode);
    if (!format) {
        showNotification('Unknown color code format');
        return;
    }
    
    // Convert to hex
    const hexColor = convertToHex(normalizedCode, format);
    if (!hexColor) {
        showNotification('Could not convert color code to hex');
        return;
    }
    
    // Get color name
    let colorName = getColorName(hexColor, normalizedCode, format.name);
    
    // Create a new color object with metadata
    const newColor = {
        hex: hexColor,
        originalCode: normalizedCode,
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

// Animate color joining the collection
function animateColorJoining(spotlight, color) {
    // Get position of the color grid
    const grid = document.querySelector('.color-grid') || viewContainer;
    const gridRect = grid.getBoundingClientRect();
    
    // Create a small square that will animate
    const animatedSquare = document.createElement('div');
    animatedSquare.className = 'animated-square';
    animatedSquare.style.backgroundColor = color.hex;
    document.body.appendChild(animatedSquare);
    
    // Set initial position (center of spotlight)
    const spotlightRect = spotlight.getBoundingClientRect();
    animatedSquare.style.top = `${spotlightRect.top + spotlightRect.height/2}px`;
    animatedSquare.style.left = `${spotlightRect.left + spotlightRect.width/2}px`;
    
    // Animate to final position
    setTimeout(() => {
        animatedSquare.style.transform = 'scale(0.2)';
        animatedSquare.style.top = `${gridRect.top + 25}px`;
        animatedSquare.style.left = `${gridRect.left + 25}px`;
        
        // Remove elements after animation
        setTimeout(() => {
            spotlight.remove();
            animatedSquare.remove();
            
            // Refresh the view to show the new color
            renderView();
            updateCount();
            
            // Show notification
            showNotification('Color added to collective!');
            
            // Save to localStorage
            saveColorsToStorage();
        }, 500);
    }, 100);
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Get a descriptive name for a color
function getColorName(hex, originalCode, formatName) {
    if (formatName !== "HEX") {
        return originalCode + ' - ' + getBasicColorName(hex);
    }
    return getBasicColorName(hex);
}

// Get a basic color name based on HSL values
function getBasicColorName(hex) {
    const hue = getHue(hex);
    const sat = getSaturation(hex);
    const light = getLightness(hex);
    
    // Create a descriptive name based on HSL values
    let prefix = '';
    let name = '';
    
    // Brightness prefix
    if (light < 20) {
        prefix = 'Dark';
    } else if (light > 80) {
        prefix = 'Light';
    } else if (sat < 20) {
        prefix = 'Grayish';
    } else if (sat > 80) {
        prefix = 'Vivid';
    }
    
    // Hue name
    if (hue >= 0 && hue < 30) {
        name = 'Red';
    } else if (hue >= 30 && hue < 60) {
        name = 'Orange';
    } else if (hue >= 60 && hue < 90) {
        name = 'Yellow';
    } else if (hue >= 90 && hue < 150) {
        name = 'Green';
    } else if (hue >= 150 && hue < 210) {
        name = 'Cyan';
    } else if (hue >= 210 && hue < 270) {
        name = 'Blue';
    } else if (hue >= 270 && hue < 330) {
        name = 'Purple';
    } else {
        name = 'Pink';
    }
    
    return prefix ? `${prefix} ${name}` : name;
}

// Render the current view
function renderView() {
    viewContainer.innerHTML = '';
    switch(currentView) {
        case 'grid':
            renderGridView();
            break;
        case 'spectrum':
            renderSpectrumView();
            break;
        case 'timeline':
            renderTimelineView();
            break;
        case 'map': // Galaxy view
            renderGalaxyView();
            break;
        case 'relationship': // Color theory
            renderColorTheoryView();
            break;
    }
}

// Render Grid View
function renderGridView() {
    const grid = document.createElement('div');
    grid.className = 'color-grid';
    
    colors.forEach((color, index) => {
        const square = createColorSquare(color, index);
        grid.appendChild(square);
    });
    
    viewContainer.appendChild(grid);
}

// Render Spectrum View
function renderSpectrumView() {
    const grid = document.createElement('div');
    grid.className = 'color-grid';
    
    // Sort colors by hue
    const sortedColors = [...colors].sort((a, b) => {
        return getHue(a.hex) - getHue(b.hex);
    });
    
    sortedColors.forEach((color, index) => {
        const square = createColorSquare(color, index);
        square.style.animationDelay = `${index * 0.05}s`;
        grid.appendChild(square);
    });
    
    viewContainer.appendChild(grid);
}

// Render Timeline View
function renderTimelineView() {
    const timeline = document.createElement('div');
    timeline.className = 'timeline-view';
    
    const line = document.createElement('div');
    line.className = 'timeline-line';
    timeline.appendChild(line);
    
    if (colors.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No colors in the collection yet';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.marginTop = '40px';
        timeline.appendChild(emptyMessage);
        viewContainer.appendChild(timeline);
        return;
    }
    
    // Sort colors by date
    const sortedColors = [...colors].sort((a, b) => {
        // Ensure we're comparing Date objects
        const dateA = a.dateAdded instanceof Date ? a.dateAdded : new Date(a.dateAdded);
        const dateB = b.dateAdded instanceof Date ? b.dateAdded : new Date(b.dateAdded);
        return dateA - dateB;
    });
    
    // Find date range
    const startDate = sortedColors[0].dateAdded instanceof Date ? 
        sortedColors[0].dateAdded : new Date(sortedColors[0].dateAdded);
    
    const endDate = sortedColors[sortedColors.length - 1].dateAdded instanceof Date ? 
        sortedColors[sortedColors.length - 1].dateAdded : new Date(sortedColors[sortedColors.length - 1].dateAdded);
    
    const dateRange = endDate - startDate || 1; // Avoid division by zero
    
    sortedColors.forEach((color, index) => {
        const colorDate = color.dateAdded instanceof Date ? 
            color.dateAdded : new Date(color.dateAdded);
        
        const position = (colorDate - startDate) / dateRange;
        
        // Create marker
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.backgroundColor = color.hex;
        marker.style.left = `${position * 100}%`;
        marker.style.animationDelay = `${index * 0.05}s`;
        
        // Set title based on original code
        marker.title = color.originalCode || color.hex;
        
        // Add click handler
        marker.addEventListener('click', function() {
            // Copy original code
            const copyText = color.originalCode || color.hex.substring(1);
            navigator.clipboard.writeText(copyText);
            this.style.boxShadow = '0 0 15px white';
            setTimeout(() => {
                this.style.boxShadow = '0 0 5px white';
            }, 500);
            
            // Show feedback
            showNotification('Copied: ' + copyText);
        });
        
        // Add date label
        const dateLabel = document.createElement('div');
        dateLabel.className = 'timeline-date';
        dateLabel.textContent = formatDate(colorDate);
        marker.appendChild(dateLabel);
        
        timeline.appendChild(marker);
    });
    
    viewContainer.appendChild(timeline);
}

// Render Galaxy View
function renderGalaxyView() {
    const galaxyView = document.createElement('div');
    galaxyView.className = 'galaxy-view';
    
    // Add galaxy center
    const center = document.createElement('div');
    center.className = 'galaxy-center';
    galaxyView.appendChild(center);
    
    if (colors.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No colors in the collection yet';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.marginTop = '300px';
        emptyMessage.style.color = 'cyan';
        galaxyView.appendChild(emptyMessage);
        viewContainer.appendChild(galaxyView);
        return;
    }
    
    // Calculate coordinates for each color based on proximity
    colors.forEach((color, index) => {
        // Get proximity value (defaults to neutral if not set)
        const proximityValue = proximityValues[color.proximity || 'neutral'];
        
        // Calculate angle (distribute colors evenly around the center)
        const angle = (index / colors.length) * Math.PI * 2;
        
        // Calculate distance from center based on proximity
        // Very close = near center, very distant = far from center
        const distance = proximityValue * 45; // % of available space
        
        // Calculate x and y coordinates (center of galaxy is at 50%)
        const x = 50 + Math.cos(angle) * distance;
        const y = 50 + Math.sin(angle) * distance;
        
        // Create star for this color
        const star = document.createElement('div');
        star.className = 'galaxy-star';
        star.style.backgroundColor = color.hex;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        
        // Size based on inverse of proximity (closer feels bigger)
        const size = 40 + ((1 - proximityValue) * 20);
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.margin = `-${size/2}px`;
        
        // Set animation delay for twinkling effect
        star.style.animationDelay = `${index * 0.5}s`;
        
        // Add tooltip
        star.title = `${color.name} - ${color.proximity ? color.proximity.replace('-', ' ') : 'neutral'}`;
        
        // Add click handler
        star.addEventListener('click', function() {
            // Copy original code
            const copyText = color.originalCode || color.hex.substring(1);
            navigator.clipboard.writeText(copyText);
            
            // Visual feedback
            this.style.boxShadow = '0 0 25px white';
            setTimeout(() => {
                this.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.5)';
            }, 500);
            
            // Show notification
            showNotification('Copied: ' + copyText);
        });
        
        galaxyView.appendChild(star);
    });
    
    viewContainer.appendChild(galaxyView);
}

// Render Color Theory View
function renderColorTheoryView() {
    const theoryView = document.createElement('div');
    theoryView.className = 'color-theory-view';
    
    if (colors.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No colors in the collection yet';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.marginTop = '40px';
        theoryView.appendChild(emptyMessage);
        viewContainer.appendChild(theoryView);
        return;
    }
    
    // Get a limited set of base colors to avoid overwhelming the view
    const baseColors = colors.slice(0, Math.min(colors.length, 5));
    
    // 1. Complementary colors section
    renderColorTheorySection(
        theoryView,
        baseColors,
        'complementary',
        'Complementary Colors',
        'Colors directly opposite each other on the color wheel. High contrast and vibrant combinations.',
        getComplementaryColors
    );
    
    // 2. Analogous colors section
    renderColorTheorySection(
        theoryView,
        baseColors,
        'analogous',
        'Analogous Colors',
        'Colors adjacent on the color wheel. Harmonious and natural combinations.',
        getAnalogousColors
    );
    
    // 3. Triadic colors section
    renderColorTheorySection(
        theoryView,
        baseColors,
        'triadic',
        'Triadic Colors',
        'Three colors equally spaced around the color wheel. Balanced and vibrant combinations.',
        getTriadicColors
    );
    
    // 4. Split complementary colors section
    renderColorTheorySection(
        theoryView,
        baseColors,
        'split',
        'Split Complementary',
        'A base color plus two colors adjacent to its complement. High contrast with less tension.',
        getSplitComplementaryColors
    );
    
    // 5. Monochromatic colors section
    renderColorTheorySection(
        theoryView,
        baseColors,
        'monochromatic',
        'Monochromatic',
        'Different shades, tints, and tones of a single color. Elegant and cohesive combinations.',
        getMonochromaticColors
    );
    
    viewContainer.appendChild(theoryView);
}

// Helper function to render a color theory section
function renderColorTheorySection(container, baseColors, type, title, description, getColorsFn) {
    const section = document.createElement('div');
    section.className = 'color-theory-section';
    
    // Add title
    const titleElem = document.createElement('div');
    titleElem.className = 'color-theory-title';
    titleElem.textContent = title;
    section.appendChild(titleElem);
    
    // Add description
    const descElem = document.createElement('div');
    descElem.className = 'color-theory-description';
    descElem.textContent = description;
    section.appendChild(descElem);
    
    // Container for color combinations
    const combosContainer = document.createElement('div');
    combosContainer.className = 'color-theory-combinations';
    
    // Generate combinations for each base color
    baseColors.forEach(baseColor => {
        // Get related colors based on the color theory type
        const relatedColors = getColorsFn(baseColor.hex);
        
        // Create combination element
        const combo = document.createElement('div');
        combo.className = 'color-theory-combination';
        
        // Create swatches container
        const swatches = document.createElement('div');
        swatches.className = 'color-theory-swatches';
        
        // Add base color swatch
        const baseSwatch = document.createElement('div');
        baseSwatch.className = 'color-theory-swatch';
        baseSwatch.style.backgroundColor = baseColor.hex;
        baseSwatch.title = baseColor.name;
        swatches.appendChild(baseSwatch);
        
        // Add related color swatches
        relatedColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-theory-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            
            // Add click handler to copy color code
            swatch.addEventListener('click', function() {
                const copyText = color.substring(1); // Remove # from hex
                navigator.clipboard.writeText(copyText);
                
                // Visual feedback
                this.style.boxShadow = '0 0 15px white';
                setTimeout(() => {
                    this.style.boxShadow = '';
                }, 500);
                
                // Show notification
                showNotification('Copied: ' + copyText);
            });
            
            swatches.appendChild(swatch);
        });
        
        // Add swatches to combo
        combo.appendChild(swatches);
        
        // Add info text
        const info = document.createElement('div');
        info.className = 'color-theory-info';
        info.textContent = `${baseColor.name} ${type}`;
        combo.appendChild(info);
        
        // Add combo to container
        combosContainer.appendChild(combo);
    });
    
    section.appendChild(combosContainer);
    container.appendChild(section);
}

// Get complementary color
function getComplementaryColors(baseHex) {
    const hue = getHue(baseHex);
    const complementaryHue = (hue + 180) % 360;
    return [getColorFromHue(complementaryHue)];
}

// Get analogous colors
function getAnalogousColors(baseHex) {
    const hue = getHue(baseHex);
    const hue1 = (hue + 30) % 360;
    const hue2 = (hue + 330) % 360;
    return [getColorFromHue(hue1), getColorFromHue(hue2)];
}

// Get triadic colors
function getTriadicColors(baseHex) {
    const hue = getHue(baseHex);
    const hue1 = (hue + 120) % 360;
    const hue2 = (hue + 240) % 360;
    return [getColorFromHue(hue1), getColorFromHue(hue2)];
}

// Get split complementary colors
function getSplitComplementaryColors(baseHex) {
    const hue = getHue(baseHex);
    const complementaryHue = (hue + 180) % 360;
    const hue1 = (complementaryHue + 30) % 360;
    const hue2 = (complementaryHue + 330) % 360;
    return [getColorFromHue(hue1), getColorFromHue(hue2)];
}

// Get monochromatic colors
function getMonochromaticColors(baseHex) {
    const hue = getHue(baseHex);
    const sat = getSaturation(baseHex);
    const light = getLightness(baseHex);
    
    // Create lighter and darker versions
    const lighter = hslToHex(hue, Math.min(sat, 100), Math.min(light + 30, 100));
    const darker = hslToHex(hue, Math.min(sat, 100), Math.max(light - 30, 0));
    
    return [lighter, darker];
}

// Create a color from a hue value
function getColorFromHue(hue) {
    return hslToHex(hue, 70, 50);
}

// Convert HSL to hex
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Create a color square with animation and info overlay
function createColorSquare(color, index) {
    const square = document.createElement('div');
    square.className = 'color-square';
    square.style.backgroundColor = color.hex;
    square.style.animationDelay = `${index * 0.05}s`;
    
    // Set title based on original code
    square.title = color.originalCode || color.hex;
    
    // Add info overlay
    const info = document.createElement('div');
    info.className = 'color-info';
    info.textContent = color.originalCode || color.hex;
    square.appendChild(info);
    
    // Add click handler (copy color code)
    square.addEventListener('click', function() {
        const copyText = color.originalCode || color.hex.substring(1);
        navigator.clipboard.writeText(copyText);
        this.classList.add('color-added');
        setTimeout(() => {
            this.classList.remove('color-added');
        }, 1000);
        
        // Show feedback
        showNotification('Copied: ' + copyText);
    });
    
    return square;
}

// Update count with animation
function updateCount() {
    const oldCount = parseInt(countElement.textContent) || 0;
    const newCount = colors.length;
    
    // Animate count changing
    if (oldCount !== newCount) {
        countElement.textContent = oldCount;
        let current = oldCount;
        const step = newCount > oldCount ? 1 : -1;
        const interval = setInterval(() => {
            current += step;
            countElement.textContent = current;
            if (current === newCount) {
                clearInterval(interval);
            }
        }, 50);
    } else {
        countElement.textContent = newCount;
    }
}

// Format date (e.g., "Jan 1")
function formatDate(date) {
    try {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    } catch (e) {
        console.error('Error formatting date:', e, date);
        return 'Unknown date';
    }
}

// Get hue value (0-360) from hex color
function getHue(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let hue = 0;
    if (delta === 0) {
        return 0;
    }
    
    if (max === r) {
        hue = ((g - b) / delta) % 6;
    } else if (max === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    return hue;
}

// Get saturation (0-100) from hex color
function getSaturation(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    const lightness = (max + min) / 2;
    let saturation = 0;
    
    if (delta !== 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }
    
    return Math.round(saturation * 100);
}

// Get lightness (0-100) from hex color
function getLightness(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    const lightness = (max + min) / 2;
    
    return Math.round(lightness * 100);
}

// Convert hex to RGB
function hexToRgb(hex) {
    try {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse hex values
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return { r, g, b };
    } catch (e) {
        console.error('Error parsing hex color:', e, hex);
        return { r: 0, g: 0, b: 0 };
    }
}
