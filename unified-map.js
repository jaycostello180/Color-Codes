// unified-map.js - A single clean implementation to fix map issues
(function() {
  // Only initialize once
  let initialized = false;
  
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    if (initialized) return;
    initialized = true;
    
    console.log('Unified Map implementation loaded');
    
    // Add our map button
    addMapButton();
    
    // Initialize map colors array
    initMapColors();
    
    // Override renderView to handle map view
    overrideRenderView();
    
    // Load Leaflet CSS early
    loadLeafletCSS();
    
    // Fix other view buttons to ensure they work after map view
    fixOtherViewButtons();
  });
  
  // Fix other view buttons to make sure they work after map view
  function fixOtherViewButtons() {
    // Get all view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Add click handlers that properly switch views
    viewButtons.forEach(button => {
      // Skip our map button
      if (button.getAttribute('data-view') === 'unified-map') {
        return;
      }
      
      // Store original onclick if it exists
      const originalOnClick = button.onclick;
      
      // Set new onclick handler
      button.onclick = function(e) {
        // Prevent default
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.view-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Get view name
        const view = this.getAttribute('data-view');
        
        // Set current view
        window.currentView = view;
        
        // Call original handler if it exists
        if (originalOnClick) {
          originalOnClick.call(this, e);
        } else {
          // Otherwise use the app's renderView function
          if (typeof window.renderView === 'function') {
            window.renderView();
          }
        }
      };
    });
    
    console.log('Fixed other view buttons to work properly');
  }
  
  // Add map button
  function addMapButton() {
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Remove any existing map buttons to avoid conflicts
    const existingMapButtons = viewControls.querySelectorAll(
      '[data-view="map-view"], [data-view="standalone-map"], ' +
      '[data-view="direct-map"], [data-view="location-map"], ' +
      '[data-view="fixed-map"], [data-view="direct-map-view"], ' +
      '[data-view="clean-map"], [data-view="fixed-map-view"], ' +
      '[data-view="unified-map"], [data-view="leaflet-map"]'
    );
    
    existingMapButtons.forEach(btn => {
      if (btn.textContent.includes('Map') && btn.textContent !== 'Map View') {
        btn.remove();
      }
    });
    
    // Keep the original Galaxy View button if it exists
    const galaxyButton = viewControls.querySelector('[data-view="map"]');
    
    // Create our map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'unified-map');
    mapButton.textContent = 'Map View';
    
    // Add click handler
    mapButton.addEventListener('click', function() {
      // Update active button state
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Set current view
      window.currentView = 'unified-map';
      
      // Render the map
      renderUnifiedMap();
    });
    
    // Add to view controls after galaxy button if it exists
    if (galaxyButton) {
      viewControls.insertBefore(mapButton, galaxyButton.nextSibling);
    } else {
      viewControls.appendChild(mapButton);
    }
    
    console.log('Unified Map button added');
  }
  
  // Override renderView function for integration
  function overrideRenderView() {
    if (typeof window.renderView !== 'function') {
      console.log('Original renderView not found, creating one');
      window.renderView = function() {
        if (window.currentView === 'unified-map') {
          renderUnifiedMap();
        }
      };
      return;
    }
    
    // Store original function
    const originalRenderView = window.renderView;
    
    // Replace with enhanced version
    window.renderView = function() {
      // Handle our map view
      if (window.currentView === 'unified-map') {
        renderUnifiedMap();
        return;
      }
      
      // Use original for other views
      originalRenderView.apply(this, arguments);
    };
    
    console.log('renderView function enhanced to handle map view');
  }
  
  // Initialize map colors from storage or existing colors
  function initMapColors() {
    if (!window.mapColors) {
      // Try to load from localStorage first
      let storedColors = loadColorsFromStorage();
      
      if (!storedColors || storedColors.length === 0) {
        // If no stored colors, try to extract location data from main colors array
        storedColors = extractLocationFromMainColors();
      }
      
      window.mapColors = storedColors || [];
    }
    
    console.log(`Map colors initialized with ${window.mapColors.length} colors`);
  }
  
  // Load colors from localStorage
  function loadColorsFromStorage() {
    try {
      const stored = localStorage.getItem('mapColors');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading map colors from localStorage:', error);
    }
    return null;
  }
  
  // Extract location data from main colors array
  function extractLocationFromMainColors() {
    if (!window.colors || !Array.isArray(window.colors)) {
      return [];
    }
    
    const extractedColors = [];
    
    window.colors.forEach(color => {
      if (color && color.location) {
        let latitude, longitude, locationName;
        
        // Handle different location formats
        if (color.location.latitude && color.location.longitude) {
          latitude = color.location.latitude;
          longitude = color.location.longitude;
          locationName = color.location.name || '';
        } else if (color.location.x && color.location.y) {
          // Convert normalized coordinates to lat/lng
          latitude = (color.location.y * 180) - 90;
          longitude = (color.location.x * 360) - 180;
          locationName = color.location.name || '';
        }
        
        if (latitude && longitude) {
          extractedColors.push({
            hex: color.hex,
            name: color.name || 'Unnamed Color',
            latitude: latitude,
            longitude: longitude,
            location: locationName,
            dateAdded: color.dateAdded || new Date()
          });
        }
      }
    });
    
    return extractedColors;
  }
  
  // Save colors to localStorage
  function saveColorsToStorage() {
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (error) {
      console.warn('Error saving map colors to localStorage:', error);
    }
  }
  
  // Load Leaflet CSS early
  function loadLeafletCSS() {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }
  
  // Render the unified map
  function renderUnifiedMap() {
    console.log('Rendering unified map view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) {
      console.error('View container not found');
      return;
    }
    
    // Clear the container
    viewContainer.innerHTML = '';
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'unified-map-container';
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
    mapDiv.id = 'unified-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet and initialize map
    loadLeaflet()
      .then(() => {
        // Remove loading overlay
        loadingOverlay.remove();
        
        // Create map
        const map = L.map('unified-map').setView([20, 0], 2);
        
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
        document.getElementById('retry-map-btn').addEventListener('click', renderUnifiedMap);
      });
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
        
        // Prevent map click events from firing when clicking the button
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
    
    // Predefined test colors
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
    saveColorsToStorage();
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    } else {
      alert(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Refresh map
    renderUnifiedMap();
    
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
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      
      // Add to document
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
  
  // Add to global scope
  window.renderUnifiedMap = renderUnifiedMap;
  window.addTestMapColor = addTestMapColor;
})();
