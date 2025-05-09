// spectrum-fix.js - Simple fix for the spectrum view
(function() {
  // Run after page is loaded
  window.addEventListener('load', function() {
    console.log('Spectrum fix loaded');
    
    // Fix spectrum view
    fixSpectrumView();
  });
  
  // Fix spectrum view functionality
  function fixSpectrumView() {
    // Find the spectrum button
    const spectrumBtn = document.querySelector('button[data-view="spectrum"]');
    if (!spectrumBtn) {
      console.error('Spectrum button not found');
      return;
    }
    
    // Remove any existing click handlers
    const newBtn = spectrumBtn.cloneNode(true);
    spectrumBtn.parentNode.replaceChild(newBtn, spectrumBtn);
    
    // Add our own click handler
    newBtn.addEventListener('click', function() {
      // Update active state
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Set view
      window.currentView = 'spectrum';
      
      // Render our fixed spectrum view
      renderFixedSpectrumView();
    });
    
    console.log('Spectrum button fixed');
  }
  
  // Our fixed spectrum view renderer
  function renderFixedSpectrumView() {
    console.log('Rendering fixed spectrum view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) {
      console.error('View container not found');
      return;
    }
    
    // Clear container
    viewContainer.innerHTML = '';
    
    // Safety check for colors array
    if (!window.colors || !Array.isArray(window.colors) || window.colors.length === 0) {
      viewContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: cyan;">
          <h3>No Colors Found</h3>
          <p>Add some colors to see the spectrum view.</p>
        </div>
      `;
      return;
    }
    
    // Create grid with spectrum class for seamless display
    const grid = document.createElement('div');
    grid.className = 'color-grid spectrum';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(20px, 1fr))';
    grid.style.gap = '0';
    grid.style.borderRadius = '10px';
    grid.style.overflow = 'hidden';
    grid.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    
    // Sort colors by hue
    const sortedColors = [...window.colors].sort((a, b) => {
      return getHue(a.hex) - getHue(b.hex);
    });
    
    // Generate smooth gradient with intermediate colors
    const smoothedColors = [];
    
    // Add original colors and blends
    sortedColors.forEach((color, index) => {
      // Add the original color
      smoothedColors.push(color);
      
      // If not the last color, add intermediate blends
      if (index < sortedColors.length - 1) {
        const nextColor = sortedColors[index + 1];
        
        // Add three blended colors between each pair
        for (let i = 1; i <= 3; i++) {
          const ratio = i / 4; // 1/4, 2/4, 3/4
          const blendedHex = blendColors(color.hex, nextColor.hex, ratio);
          
          smoothedColors.push({
            hex: blendedHex,
            name: `Blend ${i}`,
            originalCode: `blend-${i}`,
            dateAdded: new Date()
          });
        }
      }
    });
    
    // Create a color square for each color
    smoothedColors.forEach(color => {
      const square = document.createElement('div');
      square.className = 'color-square spectrum';
      square.style.height = '80px';
      square.style.borderRadius = '0';
      square.style.boxShadow = 'none';
      square.style.opacity = '1';
      square.style.margin = '0';
      square.style.padding = '0';
      square.style.backgroundColor = color.hex;
      square.title = color.name || 'Blended Color';
      
      grid.appendChild(square);
    });
    
    // Add to view container
    viewContainer.appendChild(grid);
    
    console.log('Spectrum view rendered with', smoothedColors.length, 'colors');
  }
  
  // Blend two colors
  function blendColors(color1, color2, ratio) {
    // Remove # if present
    color1 = color1.replace('#', '');
    color2 = color2.replace('#', '');
    
    // Parse the hex values to RGB
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
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`.toUpperCase();
  }
  
  // Get hue from hex color
  function getHue(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find min and max RGB values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    // Calculate hue
    let h = 0;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    
    return h;
  }
  
  // Make functions globally available
  window.renderFixedSpectrumView = renderFixedSpectrumView;
})();
