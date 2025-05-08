// simplified-location-services.js - A simpler version that doesn't rely on existing functions

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Location services script loaded');
  
  // Add the Color Map button directly
  addColorMapButton();
  
  // Add the location styles
  addLocationStyles();
  
  // Try to override the addNewColor function
  setupLocationPrompt();
});

// Add the Color Map button directly to the navigation
function addColorMapButton() {
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
    
    // Set current view and render the map
    window.currentView = 'location-map';
    renderColorMap();
  });
  
  // Append the button
  viewControls.appendChild(mapButton);
  console.log('Color Map button added');
}

// Add CSS styles for location features
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
  `;
  
  document.head.appendChild(styleSheet);
}

// Set up the location prompt
function setupLocationPrompt() {
  console.log('Setting up location prompt...');
  
  // Find the Add Color button
  const addBtn = document.getElementById('add-btn');
  if (!addBtn) {
    console.error('Could not find Add Color button');
    return;
  }
  
  // Store the original onclick handler
  const originalOnClick = addBtn.onclick;
  
  // Override the click handler
  addBtn.onclick = async function(event) {
    event.preventDefault();
    
    // Get the color code
    const colorCode = document.getElementById('color-code').value.trim();
    if (!colorCode) {
      showNotification('Please enter a color code');
      return;
    }
    
    // Prompt for location
    const locationResult = await promptForLocation();
    console.log('Location result:', locationResult);
    
    // Continue with original click handler or default behavior
    if (originalOnClick) {
      originalOnClick.call(this, event);
    } else {
      // If no original handler, try to call addNewColor function
      if (typeof window.addNewColor === 'function') {
        window.addNewColor();
      }
    }
  };
  
  console.log('Location prompt set up');
}

// Show a notification
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  } else {
    alert(message);
  }
}

// Prompt for location
async function promptForLocation() {
  return new Promise((resolve) => {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'location-prompt-modal';
    modal.innerHTML = `
      <div class="location-prompt-content">
        <h3>Share Location?</h3>
        <p>Code Swatch would like to know where this color was found. Your location will be displayed on the collective map.</p>
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
        
        // Find the current color in the colors array
        if (window.colors && window.colors.length > 0) {
          const lastColor = window.colors[window.colors.length - 1];
          if (lastColor) {
            lastColor.location = {
              latitude: location.latitude,
              longitude: location.longitude
            };
            
            // Save to localStorage if function exists
            if (typeof window.saveColorsToStorage === 'function') {
              window.saveColorsToStorage();
            }
          }
        }
        
        resolve({ allowed: true, location });
      } catch (error) {
        console.error('Error getting location:', error);
        modal.remove();
        resolve({ allowed: false, error });
      }
    });
    
    document.getElementById('location-deny').addEventListener('click', () => {
      modal.remove();
      resolve({ allowed: false });
    });
    
    // Show the modal
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  });
}

// Get current location
async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
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

// Render the color map
function renderColorMap() {
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
  
  // Check if we have colors with location
  const colorsWithLocation = window.colors ? 
    window.colors.filter(color => color.location && 
      (color.location.latitude || (color.location.x && color.location.y))) : 
    [];
  
  if (!colorsWithLocation.length) {
    mapContainer.innerHTML = `
      <div class="map-placeholder">
        <h3>No Location Data Yet</h3>
        <p>Colors with location information will appear on this map. Add a new color and share your location to see it here!</p>
        <p style="margin-top: 20px; font-size: 14px;">Code Swatch - Collecting colors from around the world</p>
      </div>
    `;
    viewContainer.appendChild(mapContainer);
    return;
  }
  
  // Show loading message
  mapContainer.innerHTML = `
    <div class="map-loading">Loading map...</div>
  `;
  viewContainer.appendChild(mapContainer);
  
  // Load Leaflet map library
  loadLeafletLibrary().then(() => {
    // Remove loading message
    mapContainer.innerHTML = '';
    
    // Create map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'color-map';
    mapDiv.style.height = '600px';
    mapDiv.style.width = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Create the map
    const map = L.map(mapDiv).setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for each color
    const markers = [];
    const bounds = L.latLngBounds();
    
    colorsWithLocation.forEach(color => {
      let lat, lng;
      
      if (color.location.latitude && color.location.longitude) {
        lat = color.location.latitude;
        lng = color.location.longitude;
      } else if (color.location.x && color.location.y) {
        // Approximate coordinates from normalized values
        lat = (color.location.y * 180) - 90;
        lng = (color.location.x * 360) - 180;
      } else {
        return;
      }
      
      // Create marker
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color.hex,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
      
      // Add popup
      marker.bindPopup(`
        <div style="text-align: center;">
          <div style="width: 50px; height: 50px; background-color: ${color.hex}; margin: 5px auto; border-radius: 5px;"></div>
          <div style="font-weight: bold;">${color.name}</div>
          <div style="font-family: monospace;">${color.hex}</div>
        </div>
      `);
      
      marker.addTo(map);
      markers.push(marker);
      bounds.extend([lat, lng]);
    });
    
    // Fit map to bounds if we have markers
    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }).catch(error => {
    console.error('Error loading Leaflet:', error);
    mapContainer.innerHTML = `
      <div class="map-error">
        <h3>Could Not Load Map</h3>
        <p>There was an error loading the map library: ${error.message}</p>
      </div>
    `;
  });
}

// Load the Leaflet library
function loadLeafletLibrary() {
  return new Promise((resolve, reject) => {
    // Check if Leaflet is already loaded
    if (window.L) {
      resolve();
      return;
    }
    
    // Add the CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(cssLink);
    
    // Add the script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
