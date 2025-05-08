// Add this to your simplified-location-services.js file or create a new dedicated map.js file

// Render the color map
function renderColorMap() {
  console.log('Rendering color map...');
  
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) {
    console.error('Could not find view container');
    return;
  }
  
  // Clear the container
  viewContainer.innerHTML = '';
  
  // Create map container
  const mapContainer = document.createElement('div');
  mapContainer.className = 'map-container';
  mapContainer.style.height = '600px';
  mapContainer.style.width = '100%';
  mapContainer.style.backgroundColor = '#1a1a1a';
  
  viewContainer.appendChild(mapContainer);
  
  // Check if we have colors with location
  const colorsWithLocation = window.colors ? 
    window.colors.filter(color => color.location && 
      (color.location.latitude || (color.location.x && color.location.y))) : 
    [];
  
  console.log('Colors with location:', colorsWithLocation);
  
  if (!colorsWithLocation.length) {
    mapContainer.innerHTML = `
      <div class="map-placeholder">
        <h3>No Location Data Yet</h3>
        <p>Colors with location information will appear on this map. Add a new color and share your location to see it here!</p>
        <p style="margin-top: 20px; font-size: 14px;">Code Swatch - Collecting colors from around the world</p>
      </div>
    `;
    return;
  }
  
  // Show loading message
  mapContainer.innerHTML = `
    <div class="map-loading">
      <h3>Loading Map...</h3>
      <p>Preparing to display ${colorsWithLocation.length} colors on the map.</p>
    </div>
  `;
  
  // Load Leaflet map library
  loadLeafletLibrary()
    .then(() => {
      console.log('Leaflet loaded successfully');
      
      // Clear the loading message
      mapContainer.innerHTML = '';
      
      // Create map div with explicit dimensions
      const mapDiv = document.createElement('div');
      mapDiv.id = 'color-map';
      mapDiv.style.height = '600px';
      mapDiv.style.width = '100%';
      mapDiv.style.zIndex = '1';
      mapContainer.appendChild(mapDiv);
      
      // Initialize map
      const map = L.map('color-map').setView([20, 0], 2);
      
      // Add dark tile layer for better appearance
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      // Debug info
      console.log(`Adding ${colorsWithLocation.length} markers to map`);
      
      // Add markers for each color
      const markers = [];
      
      if (colorsWithLocation.length > 0) {
        const bounds = L.latLngBounds();
        
        colorsWithLocation.forEach((color, index) => {
          let lat, lng;
          
          // Get coordinates
          if (color.location.latitude && color.location.longitude) {
            lat = color.location.latitude;
            lng = color.location.longitude;
            console.log(`Color ${index}: Using actual coordinates: ${lat}, ${lng}`);
          } else if (color.location.x && color.location.y) {
            // Convert from normalized coordinates
            lat = (color.location.y * 180) - 90;
            lng = (color.location.x * 360) - 180;
            console.log(`Color ${index}: Using converted coordinates: ${lat}, ${lng}`);
          } else {
            console.log(`Color ${index}: No valid coordinates found`);
            return;
          }
          
          // Create a circle marker
          const marker = L.circleMarker([lat, lng], {
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
              ${color.locationName ? `<div>${color.locationName}</div>` : ''}
              <div style="font-size: 0.8em;">${new Date(color.dateAdded).toLocaleDateString()}</div>
            </div>
          `);
          
          marker.addTo(map);
          markers.push(marker);
          bounds.extend([lat, lng]);
        });
        
        // Fit map to bounds
        if (markers.length > 0) {
          console.log('Fitting map to bounds');
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
      
      // Add a legend
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
          <div style="background: rgba(0,0,0,0.7); color: #fff; padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 5px 0;">Code Swatch</h4>
            <p style="margin: 0; font-size: 12px;">${markers.length} colors on the map</p>
          </div>
        `;
        return div;
      };
      legend.addTo(map);
      
      // Display note if no colors were plotted
      if (markers.length === 0) {
        const noDataDiv = document.createElement('div');
        noDataDiv.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: rgba(0,0,0,0.7); color: #fff; padding: 15px; border-radius: 5px; z-index: 1000;">
            <h3 style="margin-top: 0;">No Colors with Location Data</h3>
            <p>Add colors with location data to see them on the map.</p>
          </div>
        `;
        mapContainer.appendChild(noDataDiv);
      }
    })
    .catch(error => {
      console.error('Error loading Leaflet:', error);
      mapContainer.innerHTML = `
        <div class="map-error">
          <h3>Could Not Load Map</h3>
          <p>There was an error loading the map library: ${error.message}</p>
          <p>Technical details: ${error.toString()}</p>
        </div>
      `;
    });
}

// Load the Leaflet library
function loadLeafletLibrary() {
  return new Promise((resolve, reject) => {
    console.log('Loading Leaflet library...');
    
    // Check if Leaflet is already loaded
    if (window.L) {
      console.log('Leaflet already loaded');
      resolve();
      return;
    }
    
    // Add the CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);
    
    // Add the script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = () => {
      console.log('Leaflet script loaded successfully');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Leaflet script:', error);
      reject(new Error('Failed to load Leaflet library'));
    };
    
    document.head.appendChild(script);
  });
}
// Add this to your simplified-location-services.js file to help debug the map

// Debug function to check color location data
function debugMap() {
  console.log('Debugging map data:');
  
  // Check if colors array exists
  if (!window.colors) {
    console.error('No colors array found!');
    return;
  }
  
  console.log(`Total colors: ${window.colors.length}`);
  
  // Find colors with location data
  const colorsWithLocation = window.colors.filter(color => 
    color.location && (color.location.latitude || color.location.x)
  );
  
  console.log(`Colors with location data: ${colorsWithLocation.length}`);
  
  // Log each color with location
  colorsWithLocation.forEach((color, index) => {
    console.log(`Color ${index + 1}:`);
    console.log(`  Hex: ${color.hex}`);
    console.log(`  Name: ${color.name || 'Unnamed'}`);
    console.log(`  Location:`, color.location);
    
    if (color.location.latitude) {
      console.log(`  Coordinates: ${color.location.latitude}, ${color.location.longitude}`);
    } else if (color.location.x) {
      console.log(`  Normalized coordinates: ${color.location.x}, ${color.location.y}`);
    }
  });
  
  // Check localStorage
  try {
    const stored = localStorage.getItem('colorCollective');
    if (stored) {
      const parsed = JSON.parse(stored);
      const storedWithLocation = parsed.filter(color => 
        color.location && (color.location.latitude || color.location.x)
      );
      console.log(`Colors with location in localStorage: ${storedWithLocation.length}`);
    } else {
      console.log('No colors found in localStorage');
    }
  } catch (error) {
    console.error('Error checking localStorage:', error);
  }
  
  // Test if Leaflet can be loaded
  loadLeafletLibrary()
    .then(() => console.log('✅ Leaflet loaded successfully'))
    .catch(error => console.error('❌ Leaflet failed to load:', error));
  
  return colorsWithLocation;
}

// Add to window to call from console
window.debugMap = debugMap;

// Add the Color Map button if it doesn't exist
function ensureColorMapButton() {
  if (!document.querySelector('[data-view="location-map"]')) {
    console.log('Adding Color Map button...');
    
    // Get the view controls container
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) {
      console.error('Could not find view controls container');
      return;
    }
    
    // Create the button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'location-map');
    mapButton.textContent = 'Color Map';
    
    // Add click handler
    mapButton.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to this button
      this.classList.add('active');
      
      // Set current view
      window.currentView = 'location-map';
      
      // Render the color map
      renderColorMap();
    });
    
    // Append the button
    viewControls.appendChild(mapButton);
    console.log('Color Map button added successfully');
  }
}

// Run the button check when the page loads
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(ensureColorMapButton, 1000);
});
