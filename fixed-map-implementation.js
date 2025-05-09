// fixed-map-implementation.js
(function() {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Fixed map implementation loaded');
    
    // Setup the map button
    setupMapButton();
  });
  
  // Setup the map button correctly
  function setupMapButton() {
    // Find view controls
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Remove any existing map buttons to avoid conflicts
    document.querySelectorAll('button[data-view^="map"], button[data-view="unified-map"], button[data-view="standalone-map"]').forEach(btn => {
      btn.remove();
    });
    
    // Create a simple map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'fixed-map');
    mapButton.textContent = 'Map View';
    
    // Add click handler
    mapButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Update active status
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update state and render map
      window.currentView = 'fixed-map';
      renderFixedMap();
    });
    
    // Add button to controls
    viewControls.appendChild(mapButton);
  }
  
  // Render the fixed map - avoiding property redefinition issues
  function renderFixedMap() {
    console.log('Rendering fixed map view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Clear container
    viewContainer.innerHTML = '';
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'fixed-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    mapContainer.style.position = 'relative';
    
    viewContainer.appendChild(mapContainer);
    
    // Check if we have any map data
    const mapData = getMapData();
    
    if (!mapData || mapData.length === 0) {
      // Show empty state with add test button
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: cyan;">
          <h3>No Colors With Location Data</h3>
          <p>Add colors with location data to see them on the map, or add a test color below.</p>
          <button id="add-test-map-btn" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      // Add button handler
      document.getElementById('add-test-map-btn').addEventListener('click', addTestMapColor);
      return;
    }
    
    // Create the map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'fixed-map-element';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet safely - WITHOUT property redefinition
    safeLoadLeaflet()
      .then(() => {
        initializeMap(mapDiv.id, mapData);
      })
      .catch(error => {
        console.error('Error loading Leaflet:', error);
        mapContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #FF5555;">
            <h3>Could Not Load Map Library</h3>
            <p>Error: ${error.message || 'Unknown error'}</p>
            <button id="retry-map-btn" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Retry</button>
          </div>
        `;
        
        document.getElementById('retry-map-btn')?.addEventListener('click', renderFixedMap);
      });
  }
  
  // Safe Leaflet loading without property redefinition
  function safeLoadLeaflet() {
    return new Promise((resolve, reject) => {
      // Check if Leaflet is already loaded
      if (window.L) {
        console.log('Leaflet already loaded, using existing instance');
        resolve();
        return;
      }
      
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      
      // Load JS safely, avoiding redefinition
      const script = document.createElement('script');
      
      // Set onload before src to prevent race conditions
      script.onload = () => {
        console.log('Leaflet loaded successfully');
        resolve();
      };
      
      script.onerror = (err) => {
        console.error('Failed to load Leaflet', err);
        reject(new Error('Failed to load Leaflet library'));
      };
      
      // Set src after handlers are set up
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      
      document.head.appendChild(script);
    });
  }
  
  // Initialize map safely
  function initializeMap(mapElementId, mapData) {
    if (!window.L) {
      console.error('Leaflet not loaded');
      return;
    }
    
    // Create map instance
    const map = L.map(mapElementId).setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Add markers
    const bounds = L.latLngBounds();
    
    mapData.forEach(color => {
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
        </div>
      `);
      
      marker.addTo(map);
      bounds.extend([color.latitude, color.longitude]);
    });
    
    // Fit map to bounds
    if (mapData.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Add a test color button
    addTestColorButton(map);
  }
  
  // Add test color button to map
  function addTestColorButton(map) {
    // Create a custom control
    const TestColorControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'test-color-control');
        container.innerHTML = `
          <button id="map-add-test-btn" style="background: rgba(0,0,0,0.7); color: cyan; border: 1px solid rgba(0,255,255,0.3); padding: 8px 12px; border-radius: 4px; cursor: pointer; font-family: monospace;">Add Test Color</button>
        `;
        
        L.DomEvent.on(container, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          addTestMapColor();
        });
        
        return container;
      }
    });
    
    // Add the control to map
    new TestColorControl().addTo(map);
  }
  
  // Add a test color
  function addTestMapColor() {
    // Get map data
    let mapColors = getMapData() || [];
    
    // Test color options
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
    const index = mapColors.length % testColors.length;
    const testColor = { ...testColors[index], dateAdded: new Date() };
    
    // Add to data
    mapColors.push(testColor);
    
    // Save data
    saveMapData(mapColors);
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Rerender map
    renderFixedMap();
    
    return testColor;
  }
  
  // Get map data from storage
  function getMapData() {
    try {
      // Try localStorage first
      const stored = localStorage.getItem('mapColors');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Fall back to window.mapColors if available
      if (window.mapColors && Array.isArray(window.mapColors)) {
        return window.mapColors;
      }
    } catch (error) {
      console.error('Error getting map data:', error);
    }
    
    return [];
  }
  
  // Save map data to storage
  function saveMapData(data) {
    try {
      // Update window.mapColors
      window.mapColors = data;
      
      // Save to localStorage
      localStorage.setItem('mapColors', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving map data:', error);
    }
  }
  
  // Expose to global scope
  window.renderFixedMap = renderFixedMap;
  window.addTestMapColor = addTestMapColor;
})();
