// fixed-map.js - Simple, standalone map solution that guarantees the map displays properly
(function() {
  // Run after page is fully loaded
  window.addEventListener('load', function() {
    console.log('Fixed map script loaded');
    
    // Add map button to navigation
    addMapButton();
  });
  
  // Add map button
  function addMapButton() {
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Clean up any existing map buttons
    document.querySelectorAll('button[data-view^="map"], button[data-view="direct-map"], button[data-view="fixed-map"], button[data-view="clean-map"], button[data-view="standalone-map"]').forEach(btn => {
      btn.parentNode.removeChild(btn);
    });
    
    // Create a simple map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'fixed-map');
    mapButton.textContent = 'Map View';
    
    // Add click handler
    mapButton.addEventListener('click', function() {
      // Mark as active
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Store current view
      window.currentView = 'fixed-map';
      
      // Show map immediately
      showMap();
    });
    
    // Add to navigation
    viewControls.appendChild(mapButton);
    console.log('Map button added');
  }
  
  // Show the map
  function showMap() {
    console.log('Showing map...');
    
    // Get container
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    // Clear container first
    viewContainer.innerHTML = '';
    
    // Create map container with loading state
    const mapContainer = document.createElement('div');
    mapContainer.id = 'fixed-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.position = 'relative';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    mapContainer.innerHTML = `
      <div style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; color:cyan;">
        <div style="text-align:center;">
          <div>Loading Map...</div>
          <div style="font-size:12px; margin-top:10px;">Initializing Leaflet</div>
        </div>
      </div>
    `;
    
    viewContainer.appendChild(mapContainer);
    
    // Load map library explicitly
    loadMapLibrary()
      .then(() => {
        // Double check the container still exists
        if (!document.getElementById('fixed-map-container')) {
          console.error('Map container was removed before map could be displayed');
          return;
        }
        
        // Create actual map div
        mapContainer.innerHTML = '';
        const mapDiv = document.createElement('div');
        mapDiv.id = 'leaflet-map';
        mapDiv.style.width = '100%';
        mapDiv.style.height = '100%';
        mapContainer.appendChild(mapDiv);
        
        // Initialize Leaflet map
        console.log('Initializing Leaflet map...');
        const map = L.map('leaflet-map', {
          center: [20, 0],
          zoom: 2,
          preferCanvas: true
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Get map data
        const mapColors = getMapColors();
        
        // Add markers if we have data
        if (mapColors.length > 0) {
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
          
          // Fit bounds with padding
          map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        // Add control to add test color
        addTestColorButton(map, mapContainer);
        
        // Debug - make sure the map is visible
        console.log('Map created and should be visible');
      })
      .catch(error => {
        console.error('Error loading map:', error);
        mapContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #FF5555;">
            <h3>Error Loading Map</h3>
            <p>${error.message || 'Could not initialize map'}</p>
            <button id="retry-map-btn" style="margin-top:15px; padding:8px 15px; background:rgba(0,255,255,0.1); color:cyan; border:1px solid rgba(0,255,255,0.3); border-radius:5px; cursor:pointer;">
              Retry
            </button>
          </div>
        `;
        
        // Add retry button handler
        const retryBtn = document.getElementById('retry-map-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', showMap);
        }
      });
  }
  
  // Add test color button to map
  function addTestColorButton(map, container) {
    // Create a control element
    const controlDiv = document.createElement('div');
    controlDiv.style.position = 'absolute';
    controlDiv.style.top = '10px';
    controlDiv.style.left = '10px';
    controlDiv.style.zIndex = '1000';
    
    // Add button
    const button = document.createElement('button');
    button.innerHTML = 'Add Test Color';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = 'rgba(0,0,0,0.7)';
    button.style.color = 'cyan';
    button.style.border = '1px solid rgba(0,255,255,0.3)';
    button.style.borderRadius = '4px';
    button.style.fontFamily = 'monospace';
    button.style.cursor = 'pointer';
    
    // Add click handler
    button.addEventListener('click', function() {
      addTestColor();
      showMap(); // Refresh map
    });
    
    controlDiv.appendChild(button);
    container.appendChild(controlDiv);
  }
  
  // Load Leaflet libraries
  function loadMapLibrary() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.L) {
        console.log('Leaflet already loaded');
        resolve();
        return;
      }
      
      console.log('Loading Leaflet CSS...');
      
      // Load CSS first
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      console.log('Loading Leaflet JS...');
      
      // Then load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      
      // Handle success
      script.onload = () => {
        console.log('Leaflet loaded successfully');
        resolve();
      };
      
      // Handle error
      script.onerror = () => {
        console.error('Failed to load Leaflet');
        reject(new Error('Failed to load Leaflet library'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Get map colors
  function getMapColors() {
    // Create if it doesn't exist
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
        console.warn('Could not load from localStorage:', e);
      }
      
      // If still empty, add sample colors
      if (window.mapColors.length === 0) {
        window.mapColors = [
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
          }
        ];
      }
    }
    
    return window.mapColors;
  }
  
  // Add a test color
  function addTestColor() {
    // Get colors
    if (!window.mapColors) {
      window.mapColors = [];
    }
    
    // Sample test colors
    const testColors = [
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
    
    // Add to array
    window.mapColors.push(testColor);
    
    // Save to localStorage
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    } else {
      alert(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    return testColor;
  }
  
  // Export to global scope
  window.showFixedMap = showMap;
  window.addFixedTestColor = addTestColor;
})();
