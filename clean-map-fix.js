// clean-map-fix.js
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Clean map fix loaded');
    
    // Fix the map view buttons
    setupMapButtons();
    
    // Initialize our map data
    if (!window.mapColors) {
      window.mapColors = loadStoredMapColors() || [];
    }
  });
  
  // Setup map buttons properly
  function setupMapButtons() {
    // Find the view controls
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Remove any conflicting map buttons
    document.querySelectorAll('[data-view^="map"], [data-view="standalone-map"], [data-view="direct-map"], [data-view="clean-map"]').forEach(btn => {
      btn.remove();
    });
    
    // Add our unified map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'unified-map');
    mapButton.textContent = 'Map View';
    
    mapButton.addEventListener('click', function() {
      // Update view state
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      window.currentView = 'unified-map';
      
      // Show map directly
      showUnifiedMap();
    });
    
    viewControls.appendChild(mapButton);
  }
  
  // Show the unified map
  function showUnifiedMap() {
    console.log('Showing unified map');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Clear container and show loading
    viewContainer.innerHTML = '';
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'unified-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    
    // Add to DOM before proceeding
    viewContainer.appendChild(mapContainer);
    
    // Check if we have any map data
    if (!window.mapColors || window.mapColors.length === 0) {
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: cyan;">
          <h3>No Colors With Location Data</h3>
          <p>Add colors with location data to see them on the map, or add a test color below.</p>
          <button id="add-map-test-color" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      document.getElementById('add-map-test-color').addEventListener('click', addTestMapColor);
      return;
    }
    
    // Create map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'leaflet-unified-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet library
    loadLeaflet()
      .then(() => {
        // Initialize map
        console.log('Initializing Leaflet map');
        const map = L.map('leaflet-unified-map').setView([20, 0], 2);
        
        // Add dark tile layer
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
            </div>
          `);
          
          marker.addTo(map);
          bounds.extend([color.latitude, color.longitude]);
        });
        
        // Fit map to bounds
        if (window.mapColors.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        // Add control for adding test colors
        const testColorControl = L.control({ position: 'topleft' });
        testColorControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'test-color-control');
          div.innerHTML = `
            <button id="map-add-test" style="background: rgba(0,0,0,0.7); color: cyan; border: 1px solid rgba(0,255,255,0.3); padding: 8px 12px; border-radius: 4px; cursor: pointer; font-family: monospace;">Add Test Color</button>
          `;
          return div;
        };
        testColorControl.addTo(map);
        
        // Add event listener
        setTimeout(() => {
          document.getElementById('map-add-test')?.addEventListener('click', addTestMapColor);
        }, 100);
      })
      .catch(error => {
        console.error('Error loading Leaflet:', error);
        mapContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #FF5555;">
            <h3>Could Not Load Map</h3>
            <p>Error: ${error.message}</p>
          </div>
        `;
      });
  }
  
  // Load map colors from localStorage
  function loadStoredMapColors() {
    try {
      const stored = localStorage.getItem('mapColors');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load map colors from localStorage:', e);
    }
    return null;
  }
  
  // Save map colors to localStorage
  function saveMapColors() {
    if (!window.mapColors) return;
    
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (e) {
      console.warn('Could not save map colors to localStorage:', e);
    }
  }
  
  // Add a test color
  function addTestMapColor() {
    // Create array if it doesn't exist
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
    
    // Save to storage
    saveMapColors();
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Refresh map
    showUnifiedMap();
  }
  
  // Load Leaflet library
  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.L) {
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
      
      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Expose to global scope
  window.showUnifiedMap = showUnifiedMap;
  window.addTestMapColor = addTestMapColor;
})();
