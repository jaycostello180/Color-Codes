// location-services.js - Location services for Chromatic Collective

// Location service module
const LocationService = (function() {
  // Store for successful location requests
  let locationCache = null;
  
  // Request user's location
  async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          // Store in cache for potential reuse
          locationCache = location;
          
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }
  
  // Prompt user for location with a custom UI
  async function promptForLocation() {
    return new Promise((resolve) => {
      // Create a modal for the prompt
      const modal = document.createElement('div');
      modal.className = 'location-prompt-modal';
      modal.innerHTML = `
        <div class="location-prompt-content">
          <h3>Share Location?</h3>
          <p>Chromatic Collective would like to know where this color was found. Your location will be displayed on the collective map.</p>
          <div class="location-prompt-buttons">
            <button id="location-deny" class="location-btn deny">No Thanks</button>
            <button id="location-allow" class="location-btn allow">Share Location</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add button event listeners
      document.getElementById('location-allow').addEventListener('click', async () => {
        try {
          const location = await getCurrentLocation();
          modal.remove();
          resolve({ allowed: true, location });
        } catch (error) {
          console.error('Error getting location:', error);
          // Show error message in modal
          const content = modal.querySelector('.location-prompt-content');
          content.innerHTML = `
            <h3>Location Error</h3>
            <p>Could not access your location: ${error.message}</p>
            <div class="location-prompt-buttons">
              <button id="location-error-ok" class="location-btn allow">OK</button>
            </div>
          `;
          
          document.getElementById('location-error-ok').addEventListener('click', () => {
            modal.remove();
            resolve({ allowed: false, error });
          });
        }
      });
      
      document.getElementById('location-deny').addEventListener('click', () => {
        modal.remove();
        resolve({ allowed: false });
      });
      
      // Add animation class after a brief delay
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    });
  }
  
  // Get location name based on coordinates
  async function getLocationName(latitude, longitude) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }
      
      const data = await response.json();
      
      // Extract a friendly location name
      let locationName = data.display_name || 'Unknown Location';
      
      // Try to get a more concise name if available
      if (data.address) {
        if (data.address.city) {
          locationName = data.address.city;
        } else if (data.address.town) {
          locationName = data.address.town;
        } else if (data.address.village) {
          locationName = data.address.village;
        } else if (data.address.suburb) {
          locationName = data.address.suburb + (data.address.city ? `, ${data.address.city}` : '');
        }
        
        // Add state/country for context
        if (data.address.state) {
          locationName += `, ${data.address.state}`;
        }
      }
      
      return {
        success: true,
        name: locationName,
        raw: data
      };
    } catch (error) {
      console.error('Error getting location name:', error);
      return {
        success: false,
        name: 'Unknown Location',
        error
      };
    }
  }
  
  return {
    getCurrentLocation,
    promptForLocation,
    getLocationName
  };
})();

// MAP RENDERING FUNCTIONALITY

// Initialize and render the map view
function renderMapView() {
  const viewContainer = document.getElementById('view-container');
  viewContainer.innerHTML = '';
  
  // Check if we have colors with location data
  const colorsWithLocation = window.colors.filter(color => color.location && 
    (color.location.latitude || (color.location.x && color.location.y)));
  
  // Create map container
  const mapContainer = document.createElement('div');
  mapContainer.className = 'map-container';
  
  if (colorsWithLocation.length === 0) {
    // No location data yet
    mapContainer.innerHTML = `
      <div class="map-placeholder">
        <h3>No Location Data Yet</h3>
        <p>Colors with location information will appear on this map. Add a new color and share your location to see it here!</p>
      </div>
    `;
    viewContainer.appendChild(mapContainer);
    return;
  }
  
  // Add map loading message
  mapContainer.innerHTML = `
    <div class="map-loading">Loading color map...</div>
  `;
  viewContainer.appendChild(mapContainer);
  
  // Load Leaflet CSS and JS
  loadLeaflet().then(() => {
    // Remove loading message
    mapContainer.innerHTML = '';
    
    // Create map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'color-map';
    mapDiv.style.height = '600px';
    mapDiv.style.width = '100%';
    mapDiv.style.borderRadius = '10px';
    mapDiv.style.border = '1px solid rgba(0, 255, 255, 0.3)';
    mapContainer.appendChild(mapDiv);
    
    // Initialize map
    initializeMap(mapDiv, colorsWithLocation);
  }).catch(error => {
    console.error('Error loading map libraries:', error);
    mapContainer.innerHTML = `
      <div class="map-error">
        <h3>Could Not Load Map</h3>
        <p>There was an error loading the map: ${error.message}</p>
      </div>
    `;
  });
}

// Load Leaflet library
function loadLeaflet() {
  return new Promise((resolve, reject) => {
    // Check if Leaflet is already loaded
    if (window.L) {
      resolve();
      return;
    }
    
    // Load CSS
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    leafletCss.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    leafletCss.crossOrigin = '';
    document.head.appendChild(leafletCss);
    
    // Load JS
    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletJs.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
    leafletJs.crossOrigin = '';
    
    leafletJs.onload = () => resolve();
    leafletJs.onerror = (error) => reject(new Error('Failed to load Leaflet library'));
    
    document.head.appendChild(leafletJs);
  });
}

// Initialize the map with colors
function initializeMap(mapElement, colors) {
  // Create map
  const map = L.map(mapElement).setView([20, 0], 2); // Default world view
  
  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Create marker cluster group if many markers
  let markers = [];
  let bounds = L.latLngBounds();
  
  // Add markers for each color with location
  colors.forEach(color => {
    let lat, lng;
    
    // Handle different location formats
    if (color.location.latitude && color.location.longitude) {
      lat = color.location.latitude;
      lng = color.location.longitude;
    } else if (color.location.x && color.location.y) {
      // Convert from normalized coordinates to rough world coordinates
      // This is just an approximation for colors with simulated positions
      lat = (color.location.y * 180) - 90;
      lng = (color.location.x * 360) - 180;
    } else {
      return; // Skip colors without proper location
    }
    
    // Create marker with color
    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: color.hex,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
    
    // Add popup with color info
    const locationName = color.locationName || 'Unknown Location';
    marker.bindPopup(`
      <div style="text-align: center;">
        <div style="width: 50px; height: 50px; background-color: ${color.hex}; margin: 5px auto; border-radius: 5px;"></div>
        <div style="font-weight: bold;">${color.name}</div>
        <div style="font-family: monospace;">${color.hex}</div>
        <div>${locationName}</div>
        <div style="font-size: 0.8em;">${new Date(color.dateAdded).toLocaleDateString()}</div>
      </div>
    `);
    
    marker.addTo(map);
    markers.push(marker);
    bounds.extend([lat, lng]);
  });
  
  // Fit map to markers if we have any
  if (markers.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  
  // Add legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div style="background: rgba(0,0,0,0.7); color: #fff; padding: 10px; border-radius: 5px;">
        <h4 style="margin: 0 0 5px 0;">Chromatic Collective</h4>
        <p style="margin: 0; font-size: 12px;">${markers.length} colors with location data</p>
      </div>
    `;
    return div;
  };
  legend.addTo(map);
}

// Function to add a new map view button to the UI
function addMapViewButton() {
  const viewControls = document.querySelector('.view-controls');
  
  // Check if the button already exists
  if (document.querySelector('[data-view="location-map"]')) {
    return;
  }
  
  // Create the new button
  const mapButton = document.createElement('button');
  mapButton.className = 'view-btn';
  mapButton.setAttribute('data-view', 'location-map');
  mapButton.textContent = 'Color Map';
  
  // Add to the view controls after Galaxy View
  const galaxyBtn = document.querySelector('[data-view="map"]');
  if (galaxyBtn && galaxyBtn.nextSibling) {
    viewControls.insertBefore(mapButton, galaxyBtn.nextSibling);
  } else {
    viewControls.appendChild(mapButton);
  }
  
  // Update the renderView function to handle the new view
  const originalRenderView = window.renderView;
  window.renderView = function() {
    if (window.currentView === 'location-map') {
      renderMapView();
    } else {
      originalRenderView();
    }
  };
}

// MODIFYING COLOR ADDITION FLOW

// Override the original addNewColor function to include location prompt
function enhanceAddColorFunction() {
  // Store the original function
  const originalAddNewColor = window.addNewColor;
  
  // Replace with our enhanced version
  window.addNewColor = async function() {
    const code = document.getElementById('color-code').value.trim();
    if (!code) {
      window.showNotification('Please enter a color code');
      return;
    }
    
    // Normalize input by removing '#' if present for hex codes
    const normalizedCode = code.startsWith('#') ? code.substring(1) : code;
    
    // Detect format
    const format = window.detectFormat(normalizedCode);
    if (!format) {
      window.showNotification('Unknown color code format');
      return;
    }
    
    // Convert to hex
    const hexColor = window.convertToHex(normalizedCode, format);
    if (!hexColor) {
      window.showNotification('Could not convert color code to hex');
      return;
    }
    
    // Get color name
    let colorName = window.getColorName(hexColor, normalizedCode, format.name);
    
    // Create a new color object with metadata
    const newColor = {
      hex: hexColor,
      originalCode: normalizedCode,
      name: colorName
    };
    
    // Instead of immediately showing proximity question, first ask for location
    const locationResult = await LocationService.promptForLocation();
    
    // If location was allowed, add it to the color data
    if (locationResult.allowed && locationResult.location) {
      // Add location data to the color
      newColor.location = {
        latitude: locationResult.location.latitude,
        longitude: locationResult.location.longitude,
        accuracy: locationResult.location.accuracy
      };
      
      // Try to get a friendly location name (async, will be updated later)
      LocationService.getLocationName(
        locationResult.location.latitude, 
        locationResult.location.longitude
      ).then(nameResult => {
        if (nameResult.success) {
          // Find the color in the array and update it
          const colorIndex = window.colors.findIndex(c => 
            c.hex === newColor.hex && c.originalCode === newColor.originalCode);
          
          if (colorIndex >= 0) {
            window.colors[colorIndex].locationName = nameResult.name;
            // Save to localStorage
            window.saveColorsToStorage();
          }
        }
      });
    }
    
    // Continue with the original flow - show proximity question
    window.showColorSpotlight(newColor);
    
    // Clear input and preview
    document.getElementById('color-code').value = '';
    document.getElementById('preview').style.backgroundColor = '';
    document.getElementById('format-display').textContent = '';
  };
}

// CSS styles for location prompt
function addLocationStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'location-styles';
  styleSheet.textContent = `
    /* Location prompt modal */
    .location-prompt-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .location-prompt-modal.show {
      opacity: 1;
    }
    
    .location-prompt-content {
      background-color: #111;
      color: cyan;
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 10px;
      padding: 20px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }
    
    .location-prompt-modal.show .location-prompt-content {
      transform: translateY(0);
    }
    
    .location-prompt-buttons {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
    }
    
    .location-btn {
      padding: 10px 20px;
      border-radius: 5px;
      border: 1px solid rgba(0, 255, 255, 0.3);
      background-color: rgba(0, 255, 255, 0.1);
      color: cyan;
      cursor: pointer;
      font-family: monospace;
      transition: all 0.3s ease;
    }
    
    .location-btn:hover {
      background-color: rgba(0, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    .location-btn.allow {
      border-color: rgba(0, 255, 255, 0.5);
    }
    
    .location-btn.deny {
      border-color: rgba(255, 100, 100, 0.3);
      color: rgba(255, 100, 100, 0.8);
    }
    
    /* Map styles */
    .map-container {
      width: 100%;
      height: 600px;
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 255, 255, 0.3);
    }
    
    .map-placeholder, .map-loading, .map-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      text-align: center;
      color: rgba(0, 255, 255, 0.8);
    }
    
    .map-error {
      color: rgba(255, 100, 100, 0.8);
    }
    
    /* Override some Leaflet styles to match our theme */
    .leaflet-container {
      background: #111;
    }
    
    .leaflet-popup-content-wrapper {
      background: rgba(0, 0, 0, 0.8);
      color: cyan;
    }
    
    .leaflet-popup-tip {
      background: rgba(0, 0, 0, 0.8);
    }
  `;
  document.head.appendChild(styleSheet);
}

// Initialize location services
function initLocationServices() {
  console.log('Initializing location services...');
  
  // Add CSS styles
  addLocationStyles();
  
  // Add new map view button
  addMapViewButton();
  
  // Enhance the add color function
  enhanceAddColorFunction();
  
  console.log('Location services initialized!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for the main app to initialize first
  setTimeout(initLocationServices, 500);
});
