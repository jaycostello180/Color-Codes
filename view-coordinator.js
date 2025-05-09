// view-coordinator.js - Fixes conflicts between map view and spectrum view
(function() {
  // Wait for DOM to be loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('View Coordinator loaded - fixing view conflicts');
    
    // Fix the renderView function
    fixRenderViewFunction();
    
    // Fix the view buttons
    fixViewButtons();
    
    // Initialize map colors if needed
    initializeMapColors();
  });
  
  // Fix the renderView function to properly handle all views
  function fixRenderViewFunction() {
    if (typeof window.renderView !== 'function') {
      console.warn('Original renderView function not found, creating a new one');
      window.renderView = function() {
        const currentView = window.currentView || 'grid';
        
        if (currentView === 'spectrum') {
          renderEnhancedSpectrum();
        } else if (currentView === 'location-map') {
          renderLocationMap();
        }
      };
      return;
    }
    
    // Store the original function
    const originalRenderView = window.renderView;
    
    // Replace with our enhanced version
    window.renderView = function() {
      // Clear view container first to prevent conflicts
      const viewContainer = document.getElementById('view-container');
      if (viewContainer) {
        viewContainer.innerHTML = '';
      }
      
      console.log('Enhanced renderView called for view:', window.currentView);
      
      // Handle our custom views
      if (window.currentView === 'spectrum') {
        renderEnhancedSpectrum();
        return;
      } else if (window.currentView === 'location-map') {
        renderLocationMap();
        return;
      }
      
      // Use original function for other views
      originalRenderView.apply(this, arguments);
    };
    
    console.log('renderView function has been fixed');
  }
  
  // Fix the view buttons to use our enhanced renderView
  function fixViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
      // Clone button to remove existing event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add new event listener
      newButton.addEventListener('click', function() {
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Set current view
        window.currentView = this.getAttribute('data-view');
        
        // Render the view
        window.renderView();
      });
    });
    
    console.log('View buttons have been fixed');
  }
  
  // Enhanced spectrum view implementation
  function renderEnhancedSpectrum() {
    console.log('Rendering enhanced spectrum view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Create grid with spectrum class for seamless display
    const grid = document.createElement('div');
    grid.className = 'color-grid spectrum';
    
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
  
  // Map view implementation
  function renderLocationMap() {
    console.log('Rendering location map view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'location-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.position = 'relative';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'absolute';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.backgroundColor = '#1a1a1a';
    loadingOverlay.style.zIndex = '10';
    loadingOverlay.style.color = 'cyan';
    loadingOverlay.innerHTML = '<p>Loading map...</p>';
    
    mapContainer.appendChild(loadingOverlay);
    viewContainer.appendChild(mapContainer);
    
    // Check if we have any map colors
    if (!window.mapColors || window.mapColors.length === 0) {
      loadingOverlay.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h3>No Colors with Location Data</h3>
          <p>Add colors with location data to see them on the map, or add a test color.</p>
          <button id="add-test-map-color" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      // Add event listener for the test color button
      document.getElementById('add-test-map-color').addEventListener('click', addTestMapColor);
      return;
    }
    
    // Create map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'location-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet and initialize map
    loadLeaflet()
      .then(() => {
        // Remove loading overlay
        loadingOverlay.remove();
        
        // Create map
        const map = L.map('location-map').setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
        
        // Add markers
        const bounds = L.latLngBounds();
        
        window.mapColors.forEach(color => {
          // Create marker
          const marker = L.circleMarker([color.latitude, color.longitude], {
            radius: 8,
            fillColor: color.hex,
            color: '#fff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.8
          });
          
          // Add popup
          marker.bindPopup(`
            <div style="text-align: center;">
              <div style="width: 50px; height: 50px; background-color: ${color.hex}; margin: 5px auto; border-radius: 5px;"></div>
              <div style="font-weight: bold;">${color.name || 'Unnamed Color'}</div>
              <div style="font-family: monospace;">${color.hex}</div>
              ${color.location ? `<div>${color.location}</div>` : ''}
              <div style="font-size: 0.8em; margin-top: 5px;">${formatDate(color.dateAdded)}</div>
            </div>
          `);
          
          marker.addTo(map);
          bounds.extend([color.latitude, color.longitude]);
        });
        
        // Fit map to bounds
        if (window.mapColors.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        // Add test color button control
        addTestColorControl(map);
      })
      .catch(error => {
        console.error('Error loading Leaflet:', error);
        loadingOverlay.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #FF5555;">
            <h3>Could Not Load Map</h3>
            <p>Error: ${error.message}</p>
            <button id="retry-map-btn" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Retry</button>
          </div>
        `;
        
        // Add retry button handler
        document.getElementById('retry-map-btn').addEventListener('click', function() {
          renderLocationMap();
        });
      });
  }
  
  // Initialize map colors
  function initializeMapColors() {
    if (!window.mapColors) {
      // Try to load from localStorage first
      try {
        const stored = localStorage.getItem('mapColors');
        if (stored) {
          window.mapColors = JSON.parse(stored);
          console.log(`Loaded ${window.mapColors.length} map colors from localStorage`);
          return;
        }
      } catch (error) {
        console.warn('Error loading map colors from localStorage:', error);
      }
      
      // Create empty array
      window.mapColors = [];
    }
  }
  
  // Add test color control to the map
  function addTestColorControl(map) {
    // Create custom control
    const TestControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        container.innerHTML = `
          <a href="#" id="add-test-color-btn" style="background-color: rgba(0,0,0,0.7); color: cyan; display: block; padding: 7px 10px; text-decoration: none; font-family: monospace; border: 1px solid rgba(0,255,255,0.3);">Add Test Color</a>
        `;
        
        // Prevent map click events when clicking the button
        L.DomEvent.disableClickPropagation(container);
        
        // Add click handler
        container.querySelector('#add-test-color-btn').addEventListener('click', function(e) {
          e.preventDefault();
          addTestMapColor();
        });
        
        return container;
      }
    });
    
    // Add control to map
    new TestControl().addTo(map);
  }
  
  // Add a test color
  function addTestMapColor() {
    // Make sure the array exists
    if (!window.mapColors) {
      window.mapColors = [];
    }
    
    // Test colors
    const testColors = [
      {
        hex: "#FF5500",
        name: "Test Orange",
        latitude: 40.7128,
        longitude: -74.0060,
        location: "New York City, USA"
      },
      {
        hex: "#2196F3",
        name: "Material Blue",
        latitude: 51.5074,
        longitude: -0.1278,
        location: "London, UK"
      },
      {
        hex: "#4CAF50",
        name: "Material Green",
        latitude: 35.6762,
        longitude: 139.6503,
        location: "Tokyo, Japan"
      },
      {
        hex: "#FFC107",
        name: "Material Amber",
        latitude: -33.8688,
        longitude: 151.2093,
        location: "Sydney, Australia"
      },
      {
        hex: "#9C27B0",
        name: "Material Purple",
        latitude: 37.7749,
        longitude: -122.4194,
        location: "San Francisco, USA"
      }
    ];
    
    // Add a different test color each time
    const index = window.mapColors.length % testColors.length;
    const testColor = {...testColors[index], dateAdded: new Date()};
    
    // Add to array
    window.mapColors.push(testColor);
    
    // Save to localStorage
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (error) {
      console.warn('Error saving map colors to localStorage:', error);
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    } else {
      alert(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Refresh map
    renderLocationMap();
    
    return testColor;
  }
  
  // Load Leaflet JS
  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.L) {
        resolve();
        return;
      }
      
      // Load CSS if needed
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      
      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Format date helper
  function formatDate(date) {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (e) {
      return '';
    }
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
  
  // Expose global functions
  window.renderEnhancedSpectrum = renderEnhancedSpectrum;
  window.renderLocationMap = renderLocationMap;
  window.addTestMapColor = addTestMapColor;
})();
