// direct-view-selector.js - A simpler, more direct approach to fix the map view issue
// This script directly hooks into the view buttons without overriding any functions

(function() {
  // Run when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct view selector script loaded');
    
    // Add our map button
    addMapButton();
    
    // Fix all view buttons to use direct rendering
    setupDirectViewRendering();
    
    // Initialize map colors
    initMapColors();
  });
  
  // Add map button if not already present
  function addMapButton() {
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Skip if our button already exists
    if (document.querySelector('[data-view="direct-map-view"]')) return;
    
    // Create map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'direct-map-view');
    mapButton.textContent = 'Map View';
    viewControls.appendChild(mapButton);
    
    console.log('Map View button added');
  }
  
  // Set up direct view rendering for all buttons
  function setupDirectViewRendering() {
    // Get all view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
      // Get the view type from data attribute
      const viewType = button.getAttribute('data-view');
      if (!viewType) return;
      
      // Create a copy of the button with no event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add our direct click handler
      newButton.addEventListener('click', function(e) {
        // Prevent default and stop propagation
        e.preventDefault();
        e.stopPropagation();
        
        // Update active state
        document.querySelectorAll('.view-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Handle view rendering based on the view type
        renderViewDirectly(viewType);
      });
    });
    
    console.log('Direct view rendering set up for all buttons');
  }
  
  // Render the appropriate view based on type
  function renderViewDirectly(viewType) {
    // Update current view
    window.currentView = viewType;
    
    // Get view container
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;
    
    console.log(`Rendering view: ${viewType}`);
    
    // Handle each view type
    switch (viewType) {
      case 'direct-map-view':
        renderMapView(viewContainer);
        break;
      case 'grid':
        if (typeof window.renderGridView === 'function') {
          // Clear container first
          viewContainer.innerHTML = '';
          window.renderGridView();
        } else {
          renderFallbackView(viewContainer, 'Grid');
        }
        break;
      case 'spectrum':
        if (typeof window.renderSpectrumView === 'function') {
          // Clear container first
          viewContainer.innerHTML = '';
          window.renderSpectrumView();
        } else {
          renderFallbackView(viewContainer, 'Spectrum');
        }
        break;
      case 'timeline':
        if (typeof window.renderTimelineView === 'function') {
          // Clear container first
          viewContainer.innerHTML = '';
          window.renderTimelineView();
        } else {
          renderFallbackView(viewContainer, 'Timeline');
        }
        break;
      case 'relationship':
      case 'color-theory':
        if (typeof window.renderColorTheoryView === 'function') {
          // Clear container first
          viewContainer.innerHTML = '';
          window.renderColorTheoryView();
        } else {
          renderFallbackView(viewContainer, 'Color Theory');
        }
        break;
      case 'map':
        if (typeof window.renderGalaxyView === 'function') {
          // Clear container first
          viewContainer.innerHTML = '';
          window.renderGalaxyView();
        } else {
          renderFallbackView(viewContainer, 'Galaxy');
        }
        break;
      default:
        // For any other view, try to find a matching render function
        const funcName = 'render' + viewType.charAt(0).toUpperCase() + viewType.slice(1) + 'View';
        if (typeof window[funcName] === 'function') {
          // Clear container first
          viewContainer.innerHTML = '';
          window[funcName]();
        } else if (typeof window.renderView === 'function') {
          // Try the main render function
          window.renderView();
        } else {
          renderFallbackView(viewContainer, viewType);
        }
    }
  }
  
  // Render a fallback view when the specific render function can't be found
  function renderFallbackView(container, viewName) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3>${viewName} View</h3>
        <p>The render function for this view could not be found.</p>
      </div>
    `;
  }
  
  // Render the map view
  function renderMapView(container) {
    // Clear the container
    container.innerHTML = '';
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'direct-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.position = 'relative';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    container.appendChild(mapContainer);
    
    // Check if we have map colors
    if (!window.mapColors || window.mapColors.length === 0) {
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: cyan;">
          <h3>No Colors with Location Data</h3>
          <p>Add colors with location data to see them on the map.</p>
          <button id="add-direct-test-color" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      // Add event listener to test button
      setTimeout(() => {
        const button = document.getElementById('add-direct-test-color');
        if (button) {
          button.addEventListener('click', addTestColor);
        }
      }, 100);
      
      return;
    }
    
    // Create map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'direct-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet and create map
    loadLeaflet()
      .then(() => {
        // Initialize map
        const map = L.map('direct-map').setView([20, 0], 2);
        
        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
        
        // Add event listener
        setTimeout(() => {
          const button = document.getElementById('map-add-test');
          if (button) {
            button.addEventListener('click', function(e) {
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
  
  // Initialize map colors
  function initMapColors() {
    // Try to load from localStorage first
    try {
      const stored = localStorage.getItem('mapColors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          window.mapColors = parsed;
          console.log(`Loaded ${parsed.length} map colors from localStorage`);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load map colors from localStorage:', e);
    }
    
    // Initialize empty array if not loaded
    if (!window.mapColors) {
      window.mapColors = [];
    }
    
    // Add sample colors if the array is empty
    if (window.mapColors.length === 0) {
      // Try to import from main colors array
      if (window.colors && Array.isArray(window.colors)) {
        const colorsWithLocation = window.colors.filter(color => 
          color && color.location && (
            (color.location.latitude && color.location.longitude) || 
            (color.location.x && color.location.y)
          )
        );
        
        // Convert and add to map colors
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
  
  // Add a test color
  function addTestColor() {
    // Make sure map colors array exists
    if (!window.mapColors) {
      window.mapColors = [];
    }
    
    // Predefined test colors
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
    
    // Add to the array
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
    
    // Re-render the map view
    const viewContainer = document.getElementById('view-container');
    if (viewContainer) {
      renderMapView(viewContainer);
    }
    
    return testColor;
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
  
  // Export functions to global scope
  window.directRenderMapView = renderMapView;
  window.directAddTestColor = addTestColor;
})();
