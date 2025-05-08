// enhancements.js - Enhanced features for Chromatic Collective
(function() {
  // Wait for the page to be fully loaded
  window.addEventListener('load', function() {
    console.log('Enhancements initializing...');
    
    // Add click event to color squares to show detail modal
    addColorDetailModal();
    
    // Add support for enhanced views
    enhanceViews();
  });
  
  // Add click event to color squares
  function addColorDetailModal() {
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('color-square')) {
        // Find the color data for this square
        const index = Array.from(document.querySelectorAll('.color-square')).indexOf(e.target);
        if (index >= 0 && window.colors && window.colors[index]) {
          showColorDetailModal(window.colors[index]);
        }
      }
    });
  }
  
  // Add support for enhanced views
  function enhanceViews() {
    // Override the original renderView function to add support for our enhanced views
    if (window.renderView) {
      // Store the original function
      const originalRenderView = window.renderView;
      
      // Create enhanced version
      window.renderView = function() {
        const viewContainer = document.getElementById('view-container');
        
        // Use original function for standard views
        if (window.currentView === 'grid' || window.currentView === 'timeline') {
          originalRenderView();
          return;
        }
        
        // Enhanced spectrum view
        if (window.currentView === 'spectrum') {
          renderEnhancedSpectrum();
          return;
        }
        
        // Galaxy view
        if (window.currentView === 'galaxy') {
          renderGalaxyView();
          return;
        }
        
        // Color theory view
        if (window.currentView === 'theory') {
          renderColorTheoryView();
          return;
        }
        
        // Fall back to original for any other views
        originalRenderView();
      };
      
      console.log('Enhanced renderView function installed');
    } else {
      console.warn('Could not find original renderView function to enhance');
    }
  }
  
  // Render enhanced spectrum view with touching squares
  function renderEnhancedSpectrum() {
    const viewContainer = document.getElementById('view-container');
    viewContainer.innerHTML = '';
    
    // Create grid with spectrum class for no gaps
    const grid = document.createElement('div');
    grid.className = 'color-grid spectrum';
    
    // Sort colors by hue
    const sortedColors = [...window.colors].sort((a, b) => {
      return getHue(a.hex) - getHue(b.hex);
    });
    
    sortedColors.forEach((color, index) => {
      const square = document.createElement('div');
      square.className = 'color-square spectrum';
      square.style.backgroundColor = color.hex;
      square.style.animationDelay = `${index * 0.05}s`;
      
      // Set data attributes for info
      square.dataset.name = color.name || getBasicColorName(color.hex);
      square.dataset.hex = color.hex;
      
      grid.appendChild(square);
    });
    
    viewContainer.appendChild(grid);
  }
  
  // Render galaxy view
  function renderGalaxyView() {
    const viewContainer = document.getElementById('view-container');
    viewContainer.innerHTML = '';
    
    // Create galaxy container
    const galaxyView = document.createElement('div');
    galaxyView.className = 'galaxy-view';
    
    // Add galaxy center
    const center = document.createElement('div');
    center.className = 'galaxy-center';
    galaxyView.appendChild(center);
    
    if (window.colors.length === 0) {
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
    window.colors.forEach((color, index) => {
      // Get proximity value (defaults to neutral if not set)
      const proximityValue = window.proximityValues[color.proximity || 'neutral'];
      
      // Calculate angle (distribute colors evenly around the center)
      const angle = (index / window.colors.length) * Math.PI * 2;
      
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
      star.title = `${color.name || getBasicColorName(color.hex)} - ${color.proximity ? color.proximity.replace('-', ' ') : 'neutral'}`;
      
      // Add click handler
      star.addEventListener('click', function() {
        showColorDetailModal(color);
      });
      
      galaxyView.appendChild(star);
    });
    
    viewContainer.appendChild(galaxyView);
  }
  
  // Render color theory view
  function renderColorTheoryView() {
    const viewContainer = document.getElementById('view-container');
    viewContainer.innerHTML = '';
    
    if (window.colors.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No colors in the collection yet';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.marginTop = '40px';
      viewContainer.appendChild(emptyMessage);
      return;
    }
    
    // Get a limited set of base colors to avoid overwhelming the view
    const baseColors = window.colors.slice(0, Math.min(window.colors.length, 5));
    
    // 1. Complementary colors section
    const complementarySection = createHarmonySection(
      'Complementary Colors',
      'Colors directly opposite each other on the color wheel. They create maximum contrast and vibrance.',
      baseColors,
      getComplementaryColors
    );
    viewContainer.appendChild(complementarySection);
    
    // 2. Analogous colors section
    const analogousSection = createHarmonySection(
      'Analogous Colors',
      'Colors adjacent to each other on the color wheel. They create harmonious, serene combinations.',
      baseColors,
      getAnalogousColors
    );
    viewContainer.appendChild(analogousSection);
    
    // 3. Triadic colors section
    const triadicSection = createHarmonySection(
      'Triadic Colors',
      'Three colors equally spaced around the color wheel. They create a balanced, vibrant combination.',
      baseColors,
      getTriadicColors
    );
    viewContainer.appendChild(triadicSection);
    
    // 4. Split Complementary colors section
    const splitSection = createHarmonySection(
      'Split Complementary',
      'A base color plus two colors adjacent to its complement. Creates high contrast with less tension than complementary.',
      baseColors,
      getSplitComplementaryColors
    );
    viewContainer.appendChild(splitSection);
    
    // 5. Monochromatic colors section
    const monoSection = createHarmonySection(
      'Monochromatic',
      'Different shades, tints, and tones of a single color. Creates a cohesive, elegant look.',
      baseColors,
      getMonochromaticColors
    );
    viewContainer.appendChild(monoSection);
  }
  
  // Create a harmony section with examples
  function createHarmonySection(title, description, baseColors, harmoniesFunc) {
    const section = document.createElement('div');
    section.className = 'theory-section';
    
    // Title and description
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'theory-section-title';
    sectionTitle.textContent = title;
    
    const sectionDesc = document.createElement('p');
    sectionDesc.textContent = description;
    
    section.appendChild(sectionTitle);
    section.appendChild(sectionDesc);
    
    // Color combinations
    const combinations = document.createElement('div');
    combinations.className = 'color-combinations';
    
    baseColors.forEach(color => {
      const relatedColors = harmoniesFunc(color.hex);
      
      // Create combination
      const combo = document.createElement('div');
      combo.className = 'color-combination';
      
      // Color stripe
      const colorStripe = document.createElement('div');
      colorStripe.className = 'combination-colors';
      
      // Base color
      const baseColorEl = document.createElement('div');
      baseColorEl.className = 'combination-color';
      baseColorEl.style.backgroundColor = color.hex;
      colorStripe.appendChild(baseColorEl);
      
      // Related colors
      relatedColors.forEach(relatedHex => {
        const relatedColorEl = document.createElement('div');
        relatedColorEl.className = 'combination-color';
        relatedColorEl.style.backgroundColor = relatedHex;
        colorStripe.appendChild(relatedColorEl);
      });
      
      // Info
      const infoEl = document.createElement('div');
      infoEl.className = 'combination-info';
      infoEl.textContent = `${color.name || getBasicColorName(color.hex)} with ${title}`;
      
      combo.appendChild(colorStripe);
      combo.appendChild(infoEl);
      combinations.appendChild(combo);
    });
    
    section.appendChild(combinations);
    return section;
  }
  
  // Show color detail modal
  function showColorDetailModal(color) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'color-detail-modal';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'color-detail-content';
    
    // Create color swatch
    const swatch = document.createElement('div');
    swatch.className = 'color-detail-swatch';
    swatch.style.backgroundColor = color.hex;
    
    // Create info section
    const info = document.createElement('div');
    info.className = 'color-detail-info';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'color-detail-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Create name
    const name = document.createElement('h2');
    name.className = 'color-detail-name';
    name.textContent = color.name || getBasicColorName(color.hex);
    
    // Create color code
    const colorCode = document.createElement('div');
    colorCode.className = 'color-detail-code';
    colorCode.textContent = color.hex;
    colorCode.addEventListener('click', function() {
      navigator.clipboard.writeText(color.hex);
      const originalText = this.textContent;
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = originalText;
      }, 1000);
    });
    
    // Create additional info
    const dateInfo = document.createElement('p');
    dateInfo.textContent = `Added: ${color.dateAdded.toLocaleDateString()}`;
    
    const proximityInfo = document.createElement('p');
    proximityInfo.textContent = `Emotional proximity: ${color.proximity.replace('-', ' ')}`;
    
    const originalInfo = document.createElement('p');
    originalInfo.textContent = `Original code: ${color.originalCode}`;
    
    // Assemble the modal
    info.appendChild(closeBtn);
    info.appendChild(name);
    info.appendChild(colorCode);
    info.appendChild(dateInfo);
    info.appendChild(proximityInfo);
    info.appendChild(originalInfo);
    
    content.appendChild(swatch);
    content.appendChild(info);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add show class after a brief delay for animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });
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
  
  // Helper function to get hue from hex color
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
  
  // Helper function to get saturation from hex color
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
  
  // Helper function to get lightness from hex color
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
  
  // Helper function to convert hex to RGB
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
  
  // Helper function to get basic color name
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
})();
