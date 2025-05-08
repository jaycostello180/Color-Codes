// direct-map.js - A very direct map implementation with fix for flashing issue
document.addEventListener('DOMContentLoaded', function() {
  console.log('Direct map script loaded');
  
  // Add the map button if it doesn't exist yet
  const viewControls = document.querySelector('.view-controls');
  if (viewControls && !document.querySelector('[data-view="direct-map"]')) {
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'direct-map');
    mapButton.textContent = 'Direct Map';
    
    mapButton.addEventListener('click', function(e) {
      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();
      
      // Clear active state from other buttons
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Set a timeout to ensure it runs after any other view changes
      setTimeout(() => {
        showDirectMap();
      }, 100);
    });
    
    viewControls.appendChild(mapButton);
    console.log('Direct Map button added');
  }
});

// Show the direct map
function showDirectMap() {
  console.log('Showing direct map');
  
  // Get and clear the view container
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) {
    console.error('View container not found');
    return;
  }
  
  // Clear any existing content
  viewContainer.innerHTML = '';
  
  // Set a flag on the window to indicate we're showing the direct map
  window.currentView = 'direct-map';
  
  // Make sure no other view takes over
  const originalRenderView = window.renderView;
  if (originalRenderView) {
    window.renderView = function() {
      if (window.currentView === 'direct-map') {
        console.log('Keeping direct map visible');
        return;
      }
      return originalRenderView.apply(this, arguments);
    };
  }
  
  // Add map container
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map-container';
  mapContainer.style.width = '100%';
  mapContainer.style.height = '600px';
  mapContainer.style.backgroundColor = '#1a1a1a';
  mapContainer.style.position = 'relative';
  mapContainer.style.borderRadius = '10px';
  mapContainer.style.overflow = 'hidden';
  viewContainer.appendChild(mapContainer);
  
  // Check for colors with location
  const colorsWithLocation = window.colors ? 
    window.colors.filter(c => c.location && c.location.latitude) : [];
  
  console.log('Colors with location for direct map:', colorsWithLocation);
  
  if (colorsWithLocation.length === 0) {
    mapContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white;">
        <h3>No Colors with Location Data</h3>
        <p>Add a color with location data to see it on the map.</p>
        <button id="add-test-color" style="padding: 10px 15px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
      </div>
    `;
    
    // Add event listener for test color button
    const addButton = document.getElementById('add-test-color');
    if (addButton) {
      addButton.addEventListener('click', function() {
        addTestColor();
        showDirectMap();
      });
    }
    
    return;
  }
  
  // Load the map directly in the container
  mapContainer.innerHTML = `<div id="direct-map" style="width: 100%; height: 100%;"></div>`;
  
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
      const map = L.map('direct-map').setView([20, 0], 2);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add markers
      const bounds = L.latLngBounds();
      
      colorsWithLocation.forEach(color => {
        const marker = L.circleMarker([color.location.latitude, color.location.longitude], {
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
          </div>
        `);
        
        marker.addTo(map);
        bounds.extend([color.location.latitude, color.location.longitude]);
      });
      
      // Fit map to bounds
      if (colorsWithLocation.length > 0) {
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

// Add a test color with location
function addTestColor() {
  const testColor = {
    hex: "#FF5500",
    name: "Test Orange",
    originalCode: "FF5500",
    dateAdded: new Date(),
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  };
  
  window.colors.push(testColor);
  
  if (typeof window.saveColorsToStorage === 'function') {
    window.saveColorsToStorage();
  }
  
  console.log('Test color added:', testColor);
  if (typeof window.showNotification === 'function') {
    window.showNotification('Test color added to map');
  } else {
    alert('Test color added to map');
  }
  
  return testColor;
}

// Add to global scope for console access
window.addTestColor = addTestColor;
window.showDirectMap = showDirectMap;
