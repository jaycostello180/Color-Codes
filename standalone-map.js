// standalone-map.js - A completely standalone map implementation
document.addEventListener('DOMContentLoaded', function() {
  console.log('Standalone map script loaded');
  
  // Add the map button if it doesn't exist yet
  const viewControls = document.querySelector('.view-controls');
  if (viewControls && !document.querySelector('[data-view="standalone-map"]')) {
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'standalone-map');
    mapButton.textContent = 'Map View';
    
    mapButton.addEventListener('click', function(e) {
      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();
      
      // Clear active state from other buttons
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Show the map immediately
      showStandaloneMap();
    });
    
    viewControls.appendChild(mapButton);
    console.log('Standalone Map button added');
  }
  
  // We will store our own colors with location
  if (!window.mapColors) {
    window.mapColors = [];
  }
});

// Show the standalone map
function showStandaloneMap() {
  console.log('Showing standalone map');
  
  // Get and clear the view container
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) {
    console.error('View container not found');
    return;
  }
  
  // Clear any existing content
  viewContainer.innerHTML = '';
  
  // Add map container
  const mapContainer = document.createElement('div');
  mapContainer.id = 'standalone-map-container';
  mapContainer.style.width = '100%';
  mapContainer.style.height = '600px';
  mapContainer.style.backgroundColor = '#1a1a1a';
  mapContainer.style.position = 'relative';
  mapContainer.style.borderRadius = '10px';
  mapContainer.style.overflow = 'hidden';
  viewContainer.appendChild(mapContainer);
  
  // Check if we have any colors with location in our separate array
  if (!window.mapColors) {
    window.mapColors = [];
  }
  
  console.log('Map colors:', window.mapColors);
  
  if (window.mapColors.length === 0) {
    mapContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white;">
        <h3>No Colors with Location Data</h3>
        <p>Add a test color to see it on the map.</p>
        <button onclick="addMapTestColor()" style="padding: 10px 15px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
      </div>
    `;
    return;
  }
  
  // Load the map directly in the container
  mapContainer.innerHTML = `<div id="standalone-map" style="width: 100%; height: 100%;"></div>`;
  
  // Load Leaflet CSS
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  
  // Load Leaflet JS
  loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
    .then(() => {
      console.log('Leaflet loaded, initializing map');
      
      // Create map
      const map = L.map('standalone-map').setView([20, 0], 2);
      
      // Add dark tile layer for better appearance
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      // Add markers
      const bounds = L.latLngBounds();
      
      window.mapColors.forEach(color => {
        const marker = L.circleMarker([color.latitude, color.longitude], {
          radius: 8,
          fillColor: color.hex,
          color: '#fff',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.8
        });
        
        marker.bindPopup(`
          <div style="text-align: center;">
            <div style="width: 50px; height: 50px; background-color: ${color.hex}; margin: 5px auto; border-radius: 5px;"></div>
            <div style="font-weight: bold;">${color.name || 'Unnamed Color'}</div>
            <div style="font-family: monospace;">${color.hex}</div>
            <div>${color.location || ''}</div>
          </div>
        `);
        
        marker.addTo(map);
        bounds.extend([color.latitude, color.longitude]);
      });
      
      // Fit map to bounds
      if (window.mapColors.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    })
    .catch(error => {
      console.error('Error loading Leaflet:', error);
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white;">
          <h3>Could Not Load Map</h3>
          <p>Error: ${error.message}</p>
        </div>
      `;
    });
}

// Helper function to load a script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Add a test color directly to our mapColors array
function addMapTestColor() {
  // Create array if it doesn't exist
  if (!window.mapColors) {
    window.mapColors = [];
  }
  
  // Create predefined test colors
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
  const testColor = testColors[index];
  
  window.mapColors.push(testColor);
  
  // Show message
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    } else {
      alert(`Added ${testColor.name} at ${testColor.location}`);
    }
  } catch (e) {
    console.log('Added test color:', testColor);
  }
  
  // Refresh the map
  showStandaloneMap();
  
  return testColor;
}

// Add to global scope for click handlers
window.addMapTestColor = addMapTestColor;
window.showStandaloneMap = showStandaloneMap;
