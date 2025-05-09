// clean-spectrum-fix.js
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced spectrum view loaded');
    
    // Fix the spectrum button
    setupSpectrumButton();
    
    // Add necessary CSS for the enhanced spectrum view
    addSpectrumStyles();
  });
  
  // Setup spectrum button properly
  function setupSpectrumButton() {
    // Find the spectrum button
    const spectrumBtn = document.querySelector('button[data-view="spectrum"]');
    if (!spectrumBtn) return;
    
    // Replace with a clean version
    const newBtn = spectrumBtn.cloneNode(true);
    spectrumBtn.parentNode.replaceChild(newBtn, spectrumBtn);
    
    // Add event listener
    newBtn.addEventListener('click', function() {
      // Update view state
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      window.currentView = 'spectrum';
      
      // Render spectrum directly
      renderEnhancedSpectrum();
    });
  }
  
  // Add special CSS styles for the enhanced spectrum view
  function addSpectrumStyles() {
    // Create stylesheet if it doesn't exist
    if (document.getElementById('enhanced-spectrum-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'enhanced-spectrum-styles';
    styleSheet.textContent = `
      /* Enhanced Spectrum View Styles */
      .spectrum-container {
        width: 100%;
        height: auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        margin-bottom: 20px;
        position: relative;
      }
      
      .spectrum-row {
        display: flex;
        width: 100%;
        height: 120px;
        transition: height 0.3s ease;
      }
      
      @media (max-width: 768px) {
        .spectrum-row {
          height: 100px;
        }
      }
      
      @media (max-width: 480px) {
        .spectrum-row {
          height: 80px;
        }
      }
      
      .spectrum-color {
        flex: 1;
        height: 100%;
        transition: all 0.3s ease;
        position: relative;
        min-width: 40px; /* Minimum width for each color */
      }
      
      .spectrum-color:hover {
        transform: scaleY(1.1);
        z-index: 10;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
      }
      
      .spectrum-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 10px;
        padding: 4px;
        text-align: center;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        pointer-events: none;
      }
      
      .spectrum-color:hover .spectrum-info {
        transform: translateY(0);
      }
      
      .spectrum-controls {
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .spectrum-slider-container {
        flex: 1;
        min-width: 200px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .spectrum-slider {
        flex: 1;
        height: 10px;
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(to right, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.3));
        outline: none;
        border-radius: 5px;
      }
      
      .spectrum-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: cyan;
        cursor: pointer;
      }
      
      .spectrum-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: cyan;
        cursor: pointer;
        border: none;
      }
      
      .spectrum-layout-options {
        display: flex;
        gap: 10px;
      }
      
      .spectrum-layout-btn {
        padding: 5px 10px;
        background-color: rgba(0, 255, 255, 0.1);
        color: rgba(0, 255, 255, 0.8);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 5px;
        cursor: pointer;
        font-family: monospace;
        font-size: 12px;
        transition: all 0.3s ease;
      }
      
      .spectrum-layout-btn:hover, .spectrum-layout-btn.active {
        background-color: rgba(0, 255, 255, 0.2);
        color: cyan;
      }
      
      .color-info-panel {
        margin-top: 15px;
        padding: 15px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        display: none;
      }
      
      .color-info-panel.show {
        display: block;
        animation: fadeIn 0.3s ease;
      }
      
      .color-info-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .color-info-swatch {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        margin-right: 15px;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      .color-info-details {
        flex: 1;
      }
      
      .color-info-name {
        font-size: 18px;
        margin: 0 0 5px 0;
        color: white;
      }
      
      .color-info-hex {
        font-family: monospace;
        color: rgba(255, 255, 255, 0.8);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Multi-row layout mode */
      .spectrum-container.multi-row .spectrum-row {
        height: 80px;
      }
      
      /* Original items in the spectrum get special treatment */
      .spectrum-color.original {
        position: relative;
      }
      
      .spectrum-color.original::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background-color: white;
        border-radius: 50%;
      }
    `;
    
    document.head.appendChild(styleSheet);
  }
  
  // Render our enhanced spectrum view
  function renderEnhancedSpectrum() {
    console.log('Rendering enhanced spectrum view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Clear the container
    viewContainer.innerHTML = '';
    
    // Check if colors array exists and is valid
    if (!window.colors || !Array.isArray(window.colors) || window.colors.length === 0) {
      viewContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: cyan;">
          <h3>No Colors Found</h3>
          <p>Add some colors to see the spectrum view.</p>
        </div>
      `;
      return;
    }
    
    // Create controls for the spectrum view
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'spectrum-controls';
    
    // Slider for height adjustment
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'spectrum-slider-container';
    sliderContainer.innerHTML = `
      <label for="height-slider">Height:</label>
      <input type="range" id="height-slider" class="spectrum-slider" min="60" max="300" value="120">
      <span id="height-value">120px</span>
    `;
    
    // Layout options
    const layoutOptions = document.createElement('div');
    layoutOptions.className = 'spectrum-layout-options';
    layoutOptions.innerHTML = `
      <button class="spectrum-layout-btn active" data-layout="single">Single Row</button>
      <button class="spectrum-layout-btn" data-layout="multi">Multi Row</button>
      <button class="spectrum-layout-btn" data-layout="smooth">Smooth Blend</button>
    `;
    
    controlsContainer.appendChild(sliderContainer);
    controlsContainer.appendChild(layoutOptions);
    viewContainer.appendChild(controlsContainer);
    
    // Create the main spectrum container
    const spectrumContainer = document.createElement('div');
    spectrumContainer.className = 'spectrum-container';
    spectrumContainer.id = 'spectrum-container';
    viewContainer.appendChild(spectrumContainer);
    
    // Create info panel for selected colors
    const infoPanel = document.createElement('div');
    infoPanel.className = 'color-info-panel';
    infoPanel.id = 'color-info-panel';
    viewContainer.appendChild(infoPanel);
    
    // Render the default single row view
    renderSingleRowSpectrum();
    
    // Add event listeners for controls
    document.getElementById('height-slider').addEventListener('input', function() {
      const height = this.value;
      document.getElementById('height-value').textContent = `${height}px`;
      
      document.querySelectorAll('.spectrum-row').forEach(row => {
        row.style.height = `${height}px`;
      });
    });
    
    // Layout button listeners
    document.querySelectorAll('.spectrum-layout-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        // Update active state
        document.querySelectorAll('.spectrum-layout-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Get layout type
        const layout = this.getAttribute('data-layout');
        
        // Clear the container
        document.getElementById('spectrum-container').innerHTML = '';
        
        // Render the appropriate layout
        if (layout === 'single') {
          renderSingleRowSpectrum();
        } else if (layout === 'multi') {
          spectrumContainer.classList.add('multi-row');
          renderMultiRowSpectrum();
        } else if (layout === 'smooth') {
          spectrumContainer.classList.remove('multi-row');
          renderSmoothBlendSpectrum();
        }
      });
    });
  }
  
  // Render a single row spectrum
  function renderSingleRowSpectrum() {
    const container = document.getElementById('spectrum-container');
    if (!container) return;
    
    container.innerHTML = '';
    container.className = 'spectrum-container';
    
    // Sort colors by hue - safely
    const sortedColors = [...window.colors].sort((a, b) => {
      const hueA = getHue(a.hex);
      const hueB = getHue(b.hex);
      return hueA - hueB;
    });
    
    // Create a single row
    const row = document.createElement('div');
    row.className = 'spectrum-row';
    
    // Add each color
    sortedColors.forEach(color => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'spectrum-color original';
      colorDiv.style.backgroundColor = color.hex;
      colorDiv.setAttribute('data-hex', color.hex);
      colorDiv.setAttribute('data-name', color.name || 'Unnamed Color');
      colorDiv.setAttribute('data-original-code', color.originalCode || color.hex);
      
      // Add info tooltip
      const infoDiv = document.createElement('div');
      infoDiv.className = 'spectrum-info';
      infoDiv.textContent = color.name || color.hex;
      colorDiv.appendChild(infoDiv);
      
      // Add click event to show info panel
      colorDiv.addEventListener('click', function() {
        showColorInfo(this);
      });
      
      row.appendChild(colorDiv);
    });
    
    container.appendChild(row);
  }
  
  // Render a multi-row spectrum
  function renderMultiRowSpectrum() {
    const container = document.getElementById('spectrum-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Define rows based on color ranges
    const hueRanges = [
      { name: "Reds", min: 330, max: 360 },
      { name: "Reds", min: 0, max: 30 },
      { name: "Oranges", min: 30, max: 60 },
      { name: "Yellows", min: 60, max: 90 },
      { name: "Yellow-Greens", min: 90, max: 120 },
      { name: "Greens", min: 120, max: 150 },
      { name: "Cyan", min: 150, max: 210 },
      { name: "Blues", min: 210, max: 240 },
      { name: "Purples", min: 240, max: 270 },
      { name: "Magentas", min: 270, max: 330 }
    ];
    
    // Sort colors into hue ranges
    const colorsByRange = {};
    
    // Initialize arrays for each range
    hueRanges.forEach(range => {
      colorsByRange[range.name] = [];
    });
    
    // Sort colors into ranges
    window.colors.forEach(color => {
      const hue = getHue(color.hex);
      
      for (const range of hueRanges) {
        if (range.min <= range.max) {
          // Normal range
          if (hue >= range.min && hue < range.max) {
            colorsByRange[range.name].push(color);
            break;
          }
        } else {
          // Range that wraps around (e.g., Reds: 330-30)
          if (hue >= range.min || hue < range.max) {
            colorsByRange[range.name].push(color);
            break;
          }
        }
      }
    });
    
    // Create rows for each range that has colors
    Object.entries(colorsByRange).forEach(([rangeName, colors]) => {
      if (colors.length === 0) return;
      
      // Sort the colors in this range by hue
      colors.sort((a, b) => getHue(a.hex) - getHue(b.hex));
      
      // Create row
      const row = document.createElement('div');
      row.className = 'spectrum-row';
      
      // Add each color
      colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'spectrum-color original';
        colorDiv.style.backgroundColor = color.hex;
        colorDiv.setAttribute('data-hex', color.hex);
        colorDiv.setAttribute('data-name', color.name || 'Unnamed Color');
        colorDiv.setAttribute('data-original-code', color.originalCode || color.hex);
        
        // Add info tooltip
        const infoDiv = document.createElement('div');
        infoDiv.className = 'spectrum-info';
        infoDiv.textContent = color.name || color.hex;
        colorDiv.appendChild(infoDiv);
        
        // Add click event to show info panel
        colorDiv.addEventListener('click', function() {
          showColorInfo(this);
        });
        
        row.appendChild(colorDiv);
      });
      
      container.appendChild(row);
    });
  }
  
  // Render a smooth blended spectrum
  function renderSmoothBlendSpectrum() {
    const container = document.getElementById('spectrum-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort colors by hue - safely
    const sortedColors = [...window.colors].sort((a, b) => {
      const hueA = getHue(a.hex);
      const hueB = getHue(b.hex);
      return hueA - hueB;
    });
    
    // Create a row
    const row = document.createElement('div');
    row.className = 'spectrum-row';
    
    // If we have very few colors, add more blend steps
    const blendSteps = sortedColors.length < 5 ? 8 : 4;
    
    // Add original colors and blends
    sortedColors.forEach((color, index) => {
      // Add the original color
      const colorDiv = document.createElement('div');
      colorDiv.className = 'spectrum-color original';
      colorDiv.style.backgroundColor = color.hex;
      colorDiv.setAttribute('data-hex', color.hex);
      colorDiv.setAttribute('data-name', color.name || 'Unnamed Color');
      colorDiv.setAttribute('data-original-code', color.originalCode || color.hex);
      
      // Add info tooltip
      const infoDiv = document.createElement('div');
      infoDiv.className = 'spectrum-info';
      infoDiv.textContent = color.name || color.hex;
      colorDiv.appendChild(infoDiv);
      
      // Add click event to show info panel
      colorDiv.addEventListener('click', function() {
        showColorInfo(this);
      });
      
      row.appendChild(colorDiv);
      
      // If not the last color, add blended steps
      if (index < sortedColors.length - 1) {
        const nextColor = sortedColors[index + 1];
        
        // Add blended steps between this color and the next
        for (let i = 1; i <= blendSteps; i++) {
          const ratio = i / (blendSteps + 1);
          const blendedHex = blendColors(color.hex, nextColor.hex, ratio);
          
          const blendDiv = document.createElement('div');
          blendDiv.className = 'spectrum-color';
          blendDiv.style.backgroundColor = blendedHex;
          blendDiv.setAttribute('data-hex', blendedHex);
          blendDiv.setAttribute('data-name', `Blend ${i}`);
          blendDiv.setAttribute('data-original-code', `blend-${i}`);
          
          // Add info tooltip for blend
          const blendInfoDiv = document.createElement('div');
          blendInfoDiv.className = 'spectrum-info';
          blendInfoDiv.textContent = blendedHex;
          blendDiv.appendChild(blendInfoDiv);
          
          // Add click event to show info panel
          blendDiv.addEventListener('click', function() {
            showColorInfo(this);
          });
          
          row.appendChild(blendDiv);
        }
      }
    });
    
    container.appendChild(row);
  }
  
  // Show color info in the panel
  function showColorInfo(colorElement) {
    const panel = document.getElementById('color-info-panel');
    if (!panel) return;
    
    const hex = colorElement.getAttribute('data-hex');
    const name = colorElement.getAttribute('data-name');
    const originalCode = colorElement.getAttribute('data-original-code');
    
    panel.innerHTML = `
      <div class="color-info-header">
        <div class="color-info-swatch" style="background-color: ${hex}"></div>
        <div class="color-info-details">
          <h3 class="color-info-name">${name}</h3>
          <div class="color-info-hex">${hex} (${originalCode})</div>
        </div>
      </div>
      <div class="color-info-more">
        <p>Hue: ${getHue(hex)}° | Saturation: ${getSaturation(hex)}% | Lightness: ${getLightness(hex)}%</p>
        <p>Click to copy: <span class="copyable" data-value="${hex.substring(1)}" style="cursor:pointer; text-decoration:underline">${hex}</span></p>
      </div>
    `;
    
    // Add copy functionality
    document.querySelector('.copyable').addEventListener('click', function() {
      const value = this.getAttribute('data-value');
      navigator.clipboard.writeText(value);
      
      // Show feedback
      const original = this.textContent;
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = original;
      }, 1000);
      
      // Also show notification if available
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Copied: ${value}`);
      }
    });
    
    panel.classList.add('show');
  }
  
  // Helper function to get hue from hex color
  function getHue(hex) {
    try {
      // Remove # if present
      hex = hex.replace(/^#/, '');
      
      // Parse hex values
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      
      let h = 0;
      
      if (delta === 0) {
        return 0;
      } else if (max === r) {
        h = ((g - b) / delta) % 6;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      
      return h;
    } catch (e) {
      console.error('Error calculating hue:', e);
      return 0;
    }
  }
  
  // Get saturation (0-100) from hex color
  function getSaturation(hex) {
    try {
      // Remove # if present
      hex = hex.replace(/^#/, '');
      
      // Parse hex values
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      
      if (max === min) {
        return 0;
      }
      
      const s = l > 0.5 ? 
        (max - min) / (2 - max - min) : 
        (max - min) / (max + min);
      
      return Math.round(s * 100);
    } catch (e) {
      console.error('Error calculating saturation:', e);
      return 0;
    }
  }
  
  // Get lightness (0-100) from hex color
  function getLightness(hex) {
    try {
      // Remove # if present
      hex = hex.replace(/^#/, '');
      
      // Parse hex values
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      
      return Math.round(((max + min) / 2) * 100);
    } catch (e) {
      console.error('Error calculating lightness:', e);
      return 0;
    }
  }
  
  // Blend two colors
  function blendColors(color1, color2, ratio) {
    try {
      // Remove # if present
      color1 = color1.replace(/^#/, '');
      color2 = color2.replace(/^#/, '');
      
      // Parse hex values
      const r1 = parseInt(color1.substring(0, 2), 16);
      const g1 = parseInt(color1.substring(2, 4), 16);
      const b1 = parseInt(color1.substring(4, 6), 16);
      
      const r2 = parseInt(color2.substring(0, 2), 16);
      const g2 = parseInt(color2.substring(2, 4), 16);
      const b2 = parseInt(color2.substring(4, 6), 16);
      
      // Blend colors
      const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
      const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
      const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
      
      // Convert back to hex
      const hex = "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
      return hex;
    } catch (e) {
      console.error('Error blending colors:', e);
      return '#CCCCCC'; // Default gray fallback
    }
  }
  
  // Expose to global scope
  window.renderEnhancedSpectrum = renderEnhancedSpectrum;
})();
