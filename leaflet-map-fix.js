// leaflet-map-fix.js - Direct approach without property redefinition issues
// This version focuses on clean loading of Leaflet without conflicting with other scripts

// Execute immediately
(function() {
  console.log('Leaflet map fix running');
  
  // Wait for DOM to fully load
  document.addEventListener('DOMContentLoaded', function() {
    // Add our map button
    addMapButton();
    
    // Load Leaflet CSS directly
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  });
  
  // Add the map button
  function addMapButton() {
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Create a new button instead of modifying existing ones
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'leaflet-map');
    mapButton.textContent = 'Map View';
    
    // Add click handler that works differently
    mapButton.addEventListener('click', function(e) {
      // Prevent default behavior
      e.preventDefault();
      
      // Set active state
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Set current view but don't call renderView - render directly instead
      window.currentView = 'leaflet-map';
      showLeafletMap();
    });
    
    // Add to view controls
    viewControls.appendChild(mapButton);
  }
  
  // Show Leaflet map directly
  function showLeafletMap() {
    console.log('Showing Leaflet map directly');
    
    // Get the view container
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Clear the container
    viewContainer.innerHTML = '';
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'leaflet-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.position = 'relative';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    
    // Create loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '0';
    loadingDiv.style.left = '0';
    loadingDiv.style.width = '100%';
    loadingDiv.style.height = '100%';
    loadingDiv.style.display = 'flex';
    loadingDiv.style.alignItems = 'center';
    loadingDiv.style.justifyContent = 'center';
    loadingDiv.style.backgroundColor = '#1a1a1a';
    loadingDiv.style.color = 'cyan';
    loadingDiv.style.zIndex = '5';
    loadingDiv.innerHTML = '<p>Loading map...</p>';
    
    mapContainer.appendChild(loadingDiv);
    viewContainer.appendChild(mapContainer);
    
    // Get the map data
    const mapColors = getMapData();
    
    // If no map data, show empty message with test button
    if (!mapColors || mapColors.length === 0) {
      loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h3>No Colors With Location Data</h3>
          <p>Add colors with location data to see them on the map, or add a test color below.</p>
          <button id="add-test-map-color" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      document.getElementById('add-test-map-color').addEventListener('click', addTestColor);
      return;
    }
    
    // Load Leaflet script - Direct approach
    const script = document.createElement('script');
    script.onload = function() {
      console.log('Leaflet loaded successfully');
      initializeLeafletMap(mapColors);
    };
    
    script.onerror = function(error) {
      console.error('Error loading Leaflet:', error);
      loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #ff5555;">
          <h3>Error Loading Map</h3>
          <p>Could not load the map library. Please try again.</p>
          <button id="retry-map-btn" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-map-btn').addEventListener('click', showLeafletMap);
    };
    
    // Set src after event handlers to avoid issues
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(script);
  }
  
  // Initialize the Leaflet map after library loads
  function initializeLeafletMap(mapColors) {
    // Remove loading message
    const loadingDiv = document.querySelector('#leaflet-map-container > div');
    if (loadingDiv) loadingDiv.remove();
    
    // Create the map element
    const mapElement = document.createElement('div');
    mapElement.id = 'actual-leaflet-map';
    mapElement.style.width = '100%';
    mapElement.style.height = '100%';
    document.getElementById('leaflet-map-container').appendChild(mapElement);
    
    // Initialize map
    const map = L.map('actual-leaflet-map').setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Add markers
    const bounds = L.latLngBounds();
    
    mapColors.forEach(color => {
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
    if (mapColors.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Add test color button
    addTestColorButton(map);
  }
  
  // Add test color button to map
  function addTestColorButton(map) {
    // Create custom control
    const TestColorControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        container.innerHTML = `
          <a href="#" id="map-add-test-btn" style="background-color: rgba(0,0,0,0.7); color: cyan; display: block; width: auto; height: auto; line-height: normal; padding: 5px 10px; text-decoration: none; text-align: center; font-family: monospace;">Add Test Color</a>
        `;
        
        L.DomEvent.on(container, 'click', function(e) {
          L.DomEvent.stop(e);
          addTestColor();
        });
        
        return container;
      }
    });
    
    // Add control to map
    new TestColorControl().addTo(map);
  }
  
  // Add a test color
  function addTestColor() {
    // Get map data
    let mapColors = getMapData() || [];
    
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
    const index = mapColors.length % testColors.length;
    const testColor = { ...testColors[index], dateAdded: new Date() };
    
    // Add to array
    mapColors.push(testColor);
    
    // Save data
    saveMapData(mapColors);
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Reload map
    showLeafletMap();
  }
  
  // Get map data from storage
  function getMapData() {
    try {
      // Try localStorage first
      const stored = localStorage.getItem('mapColors');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Fall back to window.mapColors
      if (window.mapColors && Array.isArray(window.mapColors)) {
        return window.mapColors;
      }
    } catch (error) {
      console.error('Error getting map data:', error);
    }
    
    return [];
  }
  
  // Save map data
  function saveMapData(data) {
    try {
      // Save to window.mapColors
      window.mapColors = data;
      
      // Save to localStorage
      localStorage.setItem('mapColors', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving map data:', error);
    }
  }
  
  // Expose global functions
  window.showLeafletMap = showLeafletMap;
  window.addTestColor = addTestColor;
})();
