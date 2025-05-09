// enhanced-spectrum.js - Restores and enhances the spectrum view
(function() {
  // Wait for DOM to load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced spectrum view loaded');
    
    // Add the enhanced spectrum styles
    addSpectrumStyles();
    
    // Fix the spectrum button
    enhanceSpectrumButton();
  });
  
  // Add enhanced spectrum styles
  function addSpectrumStyles() {
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
        min-width: 20px;
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
        background-color: rgba(0, 0, 0, 0.7);
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
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Seamless grid for spectrum */
      .color-grid.seamless {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(20px, 1fr));
        gap: 0;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
      }
      
      .color-square.seamless {
        height: 80px;
        border-radius: 0;
        box-shadow: none;
        animation: none;
        opacity: 1;
        margin: 0;
        padding: 0;
      }
    `;
    
    document.head.appendChild(styleSheet);
  }
  
  // Enhance the spectrum button
  function enhanceSpectrumButton() {
    // Find the spectrum button
    const spectrumBtn = document.querySelector('button[data-view="spectrum"]');
    if (!spectrumBtn) {
      console.warn('Spectrum button not found');
      return;
    }
    
    // Store the original click handler
    const originalOnClick = spectrumBtn.onclick;
    
    // Replace with enhanced handler
    spectrumBtn.onclick = function(e) {
      // Prevent default
      e.preventDefault();
      
      // Update active state
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Set current view
      window.currentView = 'spectrum';
      
      // Render enhanced spectrum
      renderEnhancedSpectrum();
    };
    
    console.log('Spectrum button enhanced');
  }
  
  // Render enhanced spectrum view
  function renderEnhancedSpectrum() {
    console.log('Rendering enhanced spectrum view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) {
      console.error('View container not found');
      return;
    }
    
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
      <input type="range" id="height-slider" class="spectrum-slider" min="60" max="200" value="80">
      <span id="height-value">80px</span>
    `;
    
    // Layout options
    const layoutOptions = document.createElement('div');
    layoutOptions.className = 'spectrum-layout-options';
    layoutOptions.innerHTML = `
      <button class="spectrum-layout-btn active" data-layout="smooth">Smooth Blend</button>
      <button class="spectrum-layout-btn" data-layout="original">Original Colors</button>
      <button class="spectrum-layout-btn" data-layout="multi">Color Ranges</button>
    `;
    
    controlsContainer.appendChild(sliderContainer);
    controlsContainer.appendChild(layoutOptions);
    viewContainer.appendChild(controlsContainer);
    
    // Create grid for spectrum
    const grid = document.createElement('div');
    grid.className = 'color-grid seamless';
    viewContainer.appendChild(grid);
    
    // Create info panel for selected colors
    const infoPanel = document.createElement('div');
    infoPanel.className = 'color-info-panel';
    infoPanel.id = 'color-info-panel';
    viewContainer.appendChild(infoPanel);
    
    // Render smooth spectrum initially
    renderSmoothSpectrum(grid);
    
    // Add event listeners for controls
    document.getElementById('height-slider').addEventListener('input', function() {
      const height = this.value;
      document.getElementById('height-value').textContent = `${height}px`;
      
      // Update all color squares
      document.querySelectorAll('.color-square.seamless').forEach(square => {
        square.style.height = `${height}px`;
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
        
        // Clear the grid
        grid.innerHTML = '';
        
        // Render the appropriate layout
        if (layout === 'smooth') {
          renderSmoothSpectrum(grid);
        } else if (layout === 'original') {
          renderOriginalSpectrum(grid);
        } else if (layout === 'multi') {
          renderColorRanges(grid);
        }
      });
    });
  }
  
  // Render smooth blended spectrum
  function renderSmoothSpectrum(grid) {
    // Sort colors by hue
    const sortedColors = [...window.colors].sort((a, b) => {
      return getHue(a.hex) - getHue(b.hex);
    });
    
    // Generate blended colors for smoother spectrum
    const blendedColors = [];
    
    // If we have very few colors, add more intermediate steps
    const blendSteps = sortedColors.length < 5 ? 4 : 2;
    
    sortedColors.forEach((color, index) => {
      // Add the original color
      blendedColors.push(color);
      
      // If not the last color, add blended steps
      if (index < sortedColors.length - 1) {
        const nextColor = sortedColors[index + 1];
        
        for (let i = 1; i <= blendSteps; i++) {
          const ratio = i / (blendSteps + 1);
          const blendedHex = blendColors(color.hex, nextColor.hex, ratio);
          
          blendedColors.push({
            hex: blendedHex,
            name: `Blend ${i}`,
            originalCode: `blend-${i}`,
            isBlend: true
          });
        }
      }
    });
    
    // Create color squares for the grid
    blendedColors.forEach(color => {
      const square = document.createElement('div');
      square.className = 'color-square seamless';
      square.style.backgroundColor = color.hex;
      
      // Original colors get a tooltip
      if (!color.isBlend) {
        square.title = color.name || color.hex;
        
        // Add click handler for original colors
        square.addEventListener('click', function() {
          showColorInfo(color);
        });
      }
      
      grid.appendChild(square);
    });
    
    console.log(`Rendered smooth spectrum with ${blendedColors.length} colors`);
  }
  
  // Render original colors only
  function renderOriginalSpectrum(grid) {
    // Sort colors by hue
    const sortedColors = [...window.colors].sort((a, b) => {
      return getHue(a.hex) - getHue(b.hex);
    });
    
    // Create color squares for the grid
    sortedColors.forEach(color => {
      const square = document.createElement('div');
      square.className = 'color-square seamless';
      square.style.backgroundColor = color.hex;
      square.title = color.name || color.hex;
      
      // Add click handler
      square.addEventListener('click', function() {
        showColorInfo(color);
      });
      
      grid.appendChild(square);
    });
    
    console.log(`Rendered original spectrum with ${sortedColors.length} colors`);
  }
  
  // Render color ranges (grouped by hue)
  function renderColorRanges(grid) {
    // Define color ranges
    const ranges = [
      { name: "Reds", minHue: 345, maxHue: 15 },
      { name: "Oranges", minHue: 15, maxHue: 45 },
      { name: "Yellows", minHue: 45, maxHue: 75 },
      { name: "Greens", minHue: 75, maxHue: 165 },
      { name: "Blues", minHue: 165, maxHue: 255 },
      { name: "Purples", minHue: 255, maxHue: 315 },
      { name: "Pinks", minHue: 315, maxHue: 345 }
    ];
    
    // Group colors by range
    const colorsByRange = {};
    ranges.forEach(range => {
      colorsByRange[range.name] = [];
    });
    
    // Sort colors into ranges
    window.colors.forEach(color => {
      const hue = getHue(color.hex);
      
      for (const range of ranges) {
        if (range.minHue > range.maxHue) {
          // Range wraps around (e.g., Reds: 345-15)
          if (hue >= range.minHue || hue < range.maxHue) {
            colorsByRange[range.name].push(color);
            break;
          }
        } else {
          // Normal range
          if (hue >= range.minHue && hue < range.maxHue) {
            colorsByRange[range.name].push(color);
            break;
          }
        }
      }
    });
    
    // For each range with colors, sort and add to grid
    let totalColors = 0;
    
    ranges.forEach(range => {
      const colors = colorsByRange[range.name];
      if (colors.length === 0) return;
      
      // Sort by hue
      colors.sort((a, b) => getHue(a.hex) - getHue(b.hex));
      
      // Add to grid
      colors.forEach(color => {
        const square = document.createElement('div');
        square.className = 'color-square seamless';
        square.style.backgroundColor = color.hex;
        square.title = `${color.name} (${range.name})`;
        
        // Add click handler
        square.addEventListener('click', function() {
          showColorInfo(color, range.name);
        });
        
        grid.appendChild(square);
        totalColors++;
      });
    });
    
    console.log(`Rendered color ranges with ${totalColors} colors`);
  }
  
  // Show color information in the panel
  function showColorInfo(color, rangeName) {
    const panel = document.getElementById('color-info-panel');
    if (!panel) return;
    
    const hue = getHue(color.hex);
    const sat = getSaturation(color.hex);
    const light = getLightness(color.hex);
    
    panel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="width: 50px; height: 50px; background-color: ${color.hex}; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2);"></div>
        <div>
          <h3 style="margin: 0 0 5px 0;">${color.name || 'Unnamed Color'}</h3>
          <div style="font-family: monospace;">${color.hex} ${rangeName ? `(${rangeName})` : ''}</div>
        </div>
      </div>
      <div>
        <p>Original Code: ${color.originalCode || color.hex}</p>
        <p>HSL Values: ${hue}° / ${sat}% / ${light}%</p>
        ${color.proximity ? `<p>Emotional Proximity: ${color.proximity.replace('-', ' ')}</p>` : ''}
        <p style="cursor: pointer; text-decoration: underline;" id="copy-color-code">Click to copy: ${color.hex}</p>
      </div>
    `;
    
    // Add copy functionality
    document.getElementById('copy-color-code').addEventListener('click', function() {
      const hexCode = color.hex.substring(1); // Remove # from hex
      navigator.clipboard.writeText(hexCode);
      
      // Show feedback
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = `Click to copy: ${color.hex}`;
      }, 1000);
      
      // Also show notification if available
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Copied: ${hexCode}`);
      }
    });
    
    panel.classList.add('show');
  }
  
  // Blend two colors together
  function blendColors(color1, color2, ratio) {
    // Remove # if present
    color1 = color1.replace(/^#/, '');
    color2 = color2.replace(/^#/, '');
    
    // Parse the hex colors to RGB
    const r1 = parseInt(color1.substring(0, 2), 16);
    const g1 = parseInt(color1.substring(2, 4), 16);
    const b1 = parseInt(color1.substring(4, 6), 16);
    
    const r2 = parseInt(color2.substring(0, 2), 16);
    const g2 = parseInt(color2.substring(2, 4), 16);
    const b2 = parseInt(color2.substring(4, 6), 16);
    
    // Blend the colors
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    // Convert back to hex
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
  }
  
  // Get hue from hex color (0-360)
  function getHue(hex) {
    // Parse hex to rgb
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
  
  // Get saturation from hex color (0-100)
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
    
    if (delta === 0) {
      return 0;
    }
    
    const saturation = lightness <= 0.5 ?
      (delta / (max + min)) :
      (delta / (2 - max - min));
    
    return Math.round(saturation * 100);
  }
  
  // Get lightness from hex color (0-100)
  function getLightness(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    return Math.round(((max + min) / 2) * 100);
  }
  
  // Convert hex to RGB
  function hexToRgb(hex) {
    try {
      hex = hex.replace(/^#/, '');
      
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      
      return { r, g, b };
    } catch (e) {
      console.error('Error parsing hex color:', e);
      return null;
    }
  }
  
  // Expose to global scope
  window.renderEnhancedSpectrum = renderEnhancedSpectrum;
})();
