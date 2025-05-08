// clean-map.js - A clean, minimal solution that integrates well with the existing app
// This script avoids conflicts with other scripts and ensures the map stays visible

(function() {
  // Only initialize once
  if (window.cleanMapInitialized) return;
  window.cleanMapInitialized = true;
  
  // Wait for DOM to be fully loaded
  window.addEventListener('load', function() {
    console.log('Clean map script loaded');
    
    // Add map button
    addCleanMapButton();
    
    // Initialize map colors array
    initMapColors();
    
    // Add special handling for view selection
    handleViewSelection();
  });

  // Add the map button to navigation
  function addCleanMapButton() {
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Remove existing competing map buttons
    document.querySelectorAll('[data-view="standalone-map"], [data-view="direct-map"], [data-view="fixed-map"], [data-view="direct-map-view"]').forEach(btn => {
      btn.remove();
    });
    
    // Keep any original "map" button for the galaxy view
    const originalMapBtn = document.querySelector('[data-view="map"]');
    
    // Add our clean map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'clean-map');
    mapButton.textContent = 'Map View';
    
    mapButton.addEventListener('click', function(e) {
      // Set active class
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Store current view
      window.currentView = 'clean-map';
      
      // Show map - important to handle this ourselves
      showCleanMap();
    });
    
    // Add to nav after any existing map button
    if (originalMapBtn) {
      viewControls.insertBefore(mapButton, originalMapBtn.nextSibling);
    } else {
      viewControls.appendChild(mapButton);
    }
  }
  
  // Initialize map colors array
  function initMapColors() {
    // Create map colors array if it doesn't exist
    if (!window.mapColors) {
      window.mapColors = [];
      
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem('mapColors');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            window.mapColors = parsed;
            console.log(`Loaded ${parsed.length} map colors from localStorage`);
          }
        }
      } catch (e) {
        console.warn('Could not load map colors from localStorage:', e);
      }
      
      // If still empty, try to import from main colors array
      if (window.mapColors.length === 0 && window.colors && Array.isArray(window.colors)) {
        const colorsWithLocation = window.colors.filter(color => 
          color && color.location && (
            (color.location.latitude && color.location.longitude) || 
            (color.location.x && color.location.y)
          )
        );
        
        if (colorsWithLocation.length > 0) {
          colorsWithLocation.forEach(color => {
            let latitude, longitude;
            
            if (color.location.latitude && color.location.longitude) {
              latitude = color.location.latitude;
              longitude = color.location.longitude;
            } else if (color.location.x && color.location.y) {
              // Convert normalized coordinates to lat/lng
              latitude = (color.location.y * 180) - 90;
              longitude = (color.location.x * 360) - 180;
            }
            
            if (latitude && longitude) {
              window.mapColors.push({
                hex: color.hex,
                name: color.name || 'Unnamed Color',
                latitude: latitude,
                longitude: longitude,
                location: color.location.name || '',
                dateAdded: color.dateAdded || new Date()
              });
            }
          });
          
          console.log(`Imported ${window.mapColors.length} colors with location from main colors array`);
          
          // Save to localStorage
          try {
            localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
          } catch (e) {
            console.warn('Could not save map colors to localStorage:', e);
          }
        }
      }
    }
  }
  
  // Special handling for view selection
  function handleViewSelection() {
    // Monitor currentView to ensure map stays visible
    let lastView = window.currentView;
    
    // Check every 100ms if we're still on map view
    const viewWatcher = setInterval(() => {
      // If we switched to map view
      if (window.currentView === 'clean-map' && lastView !== 'clean-map') {
        showCleanMap();
      }
      
      lastView = window.currentView;
    }, 100);
    
    // Clear interval after 10 seconds (once everything should be stable)
    setTimeout(() => clearInterval(viewWatcher), 10000);
  }
  
  // Main function to show the map
  function showCleanMap() {
    console.log('Showing clean map view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // First, immediately clear the container to prevent other views
    viewContainer.innerHTML = '';
    
    // Create a unique container for our map
    const mapContainer = document.createElement('div');
    mapContainer.id = 'clean-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.position = 'relative';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    
    // Add to page
    viewContainer.appendChild(mapContainer);
    
    // Check for map colors
    if (!window.mapColors || window.mapColors.length === 0) {
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: cyan;">
          <h3>No Colors with Location Data</h3>
          <p>Add colors with location data to see them on the map, or add a test color.</p>
          <button id="clean-test-color-btn" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      // Add event listener for test color button
      const testColorBtn = document.getElementById('clean-test-color-btn');
      if (testColorBtn) {
        testColorBtn.addEventListener('click', function() {
          addTestColor();
        });
      }
      
      return;
    }
    
    // Create a div for the map
    const mapDiv = document.createElement('div');
    mapDiv.id = 'clean-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet and create map
    loadLeaflet()
      .then(() => {
        // Make sure we can still access the map div
        if (!document.getElementById('clean-map')) {
          console.error('Map container was removed before map could be created');
          return;
        }
        
        // Create map
        const map = L.map('clean-map').setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
        
        // Add markers
        const bounds = L.latLngBounds();
        
        // Process each color
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
        
        // Add a legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
          const div = L.DomUtil.create('div', 'info legend');
          div.innerHTML = `
            <div style="background: rgba(0,0,0,0.7); color: cyan; padding: 10px; border-radius: 5px; font-family: monospace;">
              <h4 style="margin: 0 0 5px 0;">Color Map</h4>
              <p style="margin: 0; font-size: 12px;">${window.mapColors.length} colors</p>
            </div>
          `;
          return div;
        };
        legend.addTo(map);
        
        // Add test color button
        const testColorControl = L.control({ position: 'topleft' });
        testColorControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'test-color-control');
          div.innerHTML = `
            <button id="map-add-test" style="background: rgba(0,0,0,0.7); color: cyan; border: 1px solid rgba(0,255,255,0.3); padding: 8px 12px; border-radius: 4px; cursor: pointer; font-family: monospace;">Add Test Color</button>
          `;
          return div;
        };
        testColorControl.addTo(map);
        
        // Add event listener for test color button
        setTimeout(() => {
          const addButton = document.getElementById('map-add-test');
          if (addButton) {
            addButton.addEventListener('click', function(e) {
              e.stopPropagation();
              addTestColor();
            });
          }
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
      
      // Load JavaScript
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Add a test color
  function addTestColor() {
    // Create array if it doesn't exist
    if (!window.mapColors) {
      window.mapColors = [];
    }
    
    // Create test colors
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
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (e) {
      console.warn('Could not save map colors to localStorage:', e);
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Refresh map
    showCleanMap();
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
  
  // Export to global scope
  window.showCleanMap = showCleanMap;
  window.addCleanTestColor = addTestColor;
})();
