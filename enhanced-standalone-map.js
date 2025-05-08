// enhanced-standalone-map.js - Captures locations when adding colors and cleans up navigation
document.addEventListener('DOMContentLoaded', function() {
  console.log('Enhanced standalone map script loaded');
  
  // Remove non-functional map buttons
  removeNonFunctionalButtons();
  
  // Add our functional map button if it doesn't exist yet
  const viewControls = document.querySelector('.view-controls');
  if (viewControls && !document.querySelector('[data-view="standalone-map"]')) {
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'standalone-map');
    mapButton.textContent = 'Map View';
    
    mapButton.addEventListener('click', function(e) {
      // Clear active state from other buttons
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Show the map immediately
      showStandaloneMap();
    });
    
    viewControls.appendChild(mapButton);
    console.log('Standalone Map button added');
  }
  
  // Initialize our colors array
  if (!window.mapColors) {
    window.mapColors = loadColorsFromStorage() || [];
  }
  
  // Override the original addNewColor function to capture location
  enhanceAddNewColorFunction();
});

// Remove non-functional map buttons
function removeNonFunctionalButtons() {
  const buttonsToRemove = [
    '[data-view="color-map"]',
    '[data-view="direct-map"]',
    '[data-view="location-map"]'
  ];
  
  buttonsToRemove.forEach(selector => {
    const button = document.querySelector(selector);
    if (button) {
      console.log('Removing non-functional button:', button.textContent);
      button.remove();
    }
  });
}

// Enhance the addNewColor function to capture location
function enhanceAddNewColorFunction() {
  // Find the Add Color button
  const addBtn = document.getElementById('add-btn');
  if (!addBtn) {
    console.log('Add Color button not found, cannot enhance');
    return;
  }
  
  // Store original click handler
  const originalOnclick = addBtn.onclick;
  
  // Replace with enhanced version
  addBtn.onclick = function(event) {
    event.preventDefault();
    
    // Get color input
    const colorCode = document.getElementById('color-code').value.trim();
    if (!colorCode) {
      showNotification('Please enter a color code');
      return;
    }
    
    // Process the color
    const normalizedCode = colorCode.startsWith('#') ? colorCode.substring(1) : colorCode;
    const format = window.detectFormat ? window.detectFormat(normalizedCode) : null;
    
    if (!format) {
      showNotification('Unknown color code format');
      return;
    }
    
    const hexColor = window.convertToHex ? window.convertToHex(normalizedCode, format) : '#' + normalizedCode;
    
    if (!hexColor) {
      showNotification('Could not convert color code to hex');
      return;
    }
    
    // Get name using the app's function if available
    let colorName = '';
    if (window.getColorName) {
      colorName = window.getColorName(hexColor, normalizedCode, format.name);
    } else {
      colorName = normalizedCode + ' Color';
    }
    
    // Ask for location
    requestLocation().then(location => {
      // With location - add to our map colors
      if (location) {
        // Create a new map color
        const newMapColor = {
          hex: hexColor,
          name: colorName,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        // Add to our map colors array
        if (!window.mapColors) {
          window.mapColors = [];
        }
        window.mapColors.push(newMapColor);
        
        // Reverse geocode to get location name
        reverseGeocode(location.coords.latitude, location.coords.longitude)
          .then(locationName => {
            newMapColor.location = locationName;
            saveColorsToStorage();
            console.log('Added color with location name:', newMapColor);
          })
          .catch(error => {
            console.log('Could not get location name:', error);
            saveColorsToStorage();
          });
        
        console.log('Added color with location to map:', newMapColor);
        showNotification('Color added with location data');
      } else {
        console.log('No location provided for color');
        showNotification('Color added without location data');
      }
      
      // Continue with original flow if it exists
      if (originalOnclick) {
        originalOnclick.call(this, event);
      } else if (window.addNewColor) {
        window.addNewColor();
      } else {
        // Clear input
        document.getElementById('color-code').value = '';
        document.getElementById('preview').style.backgroundColor = '';
        if (document.getElementById('format-display')) {
          document.getElementById('format-display').textContent = '';
        }
      }
    });
  };
  
  console.log('Enhanced addNewColor function to capture location');
}

// Request location from the user
function requestLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      resolve(null);
      return;
    }
    
    // Create a modal for the location prompt
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    
    modal.innerHTML = `
      <div style="background-color: #111; color: white; border-radius: 10px; padding: 20px; max-width: 400px; text-align: center; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);">
        <h3 style="margin-top: 0;">Share Location?</h3>
        <p>Code Swatch would like to know where this color was found. Your location will be displayed on the map.</p>
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
          <button id="location-deny" style="padding: 10px 20px; border-radius: 5px; border: 1px solid rgba(255, 100, 100, 0.3); background-color: rgba(255, 100, 100, 0.1); color: rgba(255, 100, 100, 0.8); cursor: pointer;">No Thanks</button>
          <button id="location-allow" style="padding: 10px 20px; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.3); background-color: rgba(255, 255, 255, 0.1); color: white; cursor: pointer;">Share Location</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('location-allow').addEventListener('click', () => {
      modal.remove();
      
      // Show loading indicator
      showNotification('Getting your location...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got location:', position);
          resolve(position);
        },
        (error) => {
          console.log('Error getting location:', error);
          showNotification('Could not get location: ' + error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
    
    document.getElementById('location-deny').addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
  });
}

// Reverse geocode to get a location name
function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`)
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          // Get a simpler name if possible
          let locationName = data.display_name;
          
          if (data.address) {
            if (data.address.city) {
              locationName = data.address.city;
              if (data.address.state) {
                locationName += `, ${data.address.state}`;
              }
              if (data.address.country) {
                locationName += `, ${data.address.country}`;
              }
            } else if (data.address.town) {
              locationName = data.address.town;
              if (data.address.state) {
                locationName += `, ${data.address.state}`;
              }
              if (data.address.country) {
                locationName += `, ${data.address.country}`;
              }
            }
          }
          
          resolve(locationName);
        } else {
          reject('No location name found');
        }
      })
      .catch(error => {
        console.error('Error in reverse geocoding:', error);
        reject(error);
      });
  });
}

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
    window.mapColors = loadColorsFromStorage() || [];
  }
  
  console.log('Map colors:', window.mapColors);
  
  if (window.mapColors.length === 0) {
    mapContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white;">
        <h3>No Colors with Location Data</h3>
        <p>Add a color with location data to see it on the map, or add a test color.</p>
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

// Add a test color
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
  
  // Save to storage
  saveColorsToStorage();
  
  // Show message
  showNotification(`Added ${testColor.name} at ${testColor.location}`);
  
  // Refresh the map
  showStandaloneMap();
  
  return testColor;
}

// Show a notification
function showNotification(message) {
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message);
    } else {
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
      } else {
        console.log('Notification:', message);
      }
    }
  } catch (e) {
    console.log('Notification:', message);
  }
}

// Save colors to localStorage
function saveColorsToStorage() {
  if (!window.mapColors) return;
  
  try {
    localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    console.log('Saved map colors to localStorage');
  } catch (error) {
    console.error('Error saving map colors to localStorage:', error);
  }
}

// Load colors from localStorage
function loadColorsFromStorage() {
  try {
    const stored = localStorage.getItem('mapColors');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Loaded map colors from localStorage:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading map colors from localStorage:', error);
  }
  return [];
}

// Add to global scope
window.addMapTestColor = addMapTestColor;
window.showStandaloneMap = showStandaloneMap;
window.saveColorsToStorage = saveColorsToStorage;
window.loadColorsFromStorage = loadColorsFromStorage;
