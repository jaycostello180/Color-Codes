// fixed-map-view.js - A fixed implementation that properly integrates with the main app
// This script fixes the disappearing map issue by properly integrating with the app's view system

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Fixed map view script loaded');
    
    // Add our map view button
    addMapViewButton();
    
    // Override the original renderView function to handle our map view
    overrideRenderView();
    
    // Initialize our colors array with location data
    initializeMapColors();
    
    // Fix all view buttons after a short delay to ensure they're all loaded
    setTimeout(fixViewButtons, 500);
  });
  
  // Add the map view button to the navigation
  function addMapViewButton() {
    const viewControls = document.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Check if our button already exists to avoid duplicates
    if (document.querySelector('[data-view="fixed-map"]')) {
      return;
    }
    
    // Remove conflicting map buttons only - be more selective
    const conflictingButtons = viewControls.querySelectorAll('[data-view="standalone-map"], [data-view="direct-map"], [data-view="location-map"]');
    conflictingButtons.forEach(btn => btn.remove());
    
    // Create our map button
    const mapButton = document.createElement('button');
    mapButton.className = 'view-btn';
    mapButton.setAttribute('data-view', 'fixed-map');
    mapButton.textContent = 'Map View';
    
    // Add click handler that works with the app's view system
    mapButton.addEventListener('click', function() {
      // Set active button
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Set current view - this is critical for proper integration
      window.currentView = 'fixed-map';
      
      // Render the view through the app's rendering system
      if (typeof window.renderView === 'function') {
        window.renderView();
      } else {
        // Fallback if renderView isn't available
        renderFixedMapView();
      }
    });
    
    viewControls.appendChild(mapButton);
    console.log('Fixed Map button added');
  }
  
  // Override the original renderView function
  function overrideRenderView() {
    if (typeof window.renderView !== 'function') {
      console.warn('Original renderView function not found, creating a new one');
      window.renderView = function() {
        const currentView = window.currentView || 'grid';
        if (currentView === 'fixed-map') {
          renderFixedMapView();
        }
      };
      return;
    }
    
    // Store the original function
    const originalRenderView = window.renderView;
    
    // Replace with our enhanced version
    window.renderView = function() {
      // Check if it's our map view
      if (window.currentView === 'fixed-map') {
        renderFixedMapView();
        return;
      }
      
      // Otherwise, use the original function
      originalRenderView.apply(this, arguments);
    };
    
    // Add event listeners to all view buttons to ensure they work correctly
    fixViewButtons();
    
    console.log('Successfully overrode renderView function');
  }
  
  // Fix the view buttons to ensure they call the correct view function
  function fixViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
      // Skip our own map button
      if (button.getAttribute('data-view') === 'fixed-map') {
        return;
      }
      
      // Remove existing click listeners to avoid conflicts
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add a proper click listener
      newButton.addEventListener('click', function() {
        // Set active button
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Set current view based on the button's data-view attribute
        window.currentView = this.getAttribute('data-view');
        
        // Render the view through the app's rendering system
        if (typeof window.renderView === 'function') {
          window.renderView();
        }
      });
    });
  }
  
  // Initialize map colors from existing color data
  function initializeMapColors() {
    if (!window.mapColors) {
      window.mapColors = [];
      
      // Try to import colors with location from the main colors array
      if (window.colors && Array.isArray(window.colors)) {
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
        }
      }
    }
    
    console.log(`Initialized map colors: ${window.mapColors.length} colors with location`);
  }
  
  // Render the fixed map view
  function renderFixedMapView() {
    console.log('Rendering fixed map view');
    
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) {
      console.error('View container not found');
      return;
    }
    
    // Clear the view container
    viewContainer.innerHTML = '';
    
    // Create map container with a unique ID
    const mapContainer = document.createElement('div');
    mapContainer.id = 'fixed-map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundColor = '#1a1a1a';
    mapContainer.style.position = 'relative';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    viewContainer.appendChild(mapContainer);
    
    // Check if we have any map colors
    if (!window.mapColors || window.mapColors.length === 0) {
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: cyan;">
          <h3>No Colors with Location Data</h3>
          <p>Add colors with location data to see them on the map, or add a test color.</p>
          <button id="add-test-map-color" style="padding: 10px 15px; background: rgba(0,255,255,0.1); color: cyan; border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; cursor: pointer; margin-top: 15px;">Add Test Color</button>
        </div>
      `;
      
      // Add event listener for the test color button
      const addButton = document.getElementById('add-test-map-color');
      if (addButton) {
        addButton.addEventListener('click', function() {
          addTestMapColor();
        });
      }
      
      return;
    }
    
    // Create a div for the map
    const mapDiv = document.createElement('div');
    mapDiv.id = 'fixed-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.appendChild(mapDiv);
    
    // Load Leaflet library
    loadLeaflet()
      .then(() => {
        // Initialize the map
        const map = L.map('fixed-map').setView([20, 0], 2);
        
        // Add a dark tile layer for better appearance
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
        
        // Add markers and create bounds
        const bounds = L.latLngBounds();
        
        window.mapColors.forEach(color => {
          // Create a circle marker
          const marker = L.circleMarker([color.latitude, color.longitude], {
            radius: 8,
            fillColor: color.hex,
            color: '#fff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.8
          });
          
          // Add popup with color information
          marker.bindPopup(`
            <div style="text-align: center;">
              <div style="width: 50px; height: 50px; background-color: ${color.hex}; margin: 5px auto; border-radius: 5px;"></div>
              <div style="font-weight: bold;">${color.name}</div>
              <div style="font-family: monospace;">${color.hex}</div>
              ${color.location ? `<div>${color.location}</div>` : ''}
              <div style="font-size: 0.8em; margin-top: 5px;">${formatDate(color.dateAdded)}</div>
            </div>
          `);
          
          marker.addTo(map);
          bounds.extend([color.latitude, color.longitude]);
        });
        
        // Fit the map to the bounds with some padding
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
        
        // Add control to add a test color
        const testColorControl = L.control({ position: 'topleft' });
        testColorControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'test-color-control');
          div.innerHTML = `
            <button id="map-add-test" style="background: rgba(0,0,0,0.7); color: cyan; border: 1px solid rgba(0,255,255,0.3); padding: 8px 12px; border-radius: 4px; cursor: pointer; font-family: monospace;">Add Test Color</button>
          `;
          return div;
        };
        testColorControl.addTo(map);
        
        // Add event listener for the test color button
        setTimeout(() => {
          const addButton = document.getElementById('map-add-test');
          if (addButton) {
            addButton.addEventListener('click', function(e) {
              e.stopPropagation(); // Prevent map click
              addTestMapColor();
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
  
  // Load the Leaflet library
  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      // Check if Leaflet is already loaded
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
  function addTestMapColor() {
    // Create map colors array if it doesn't exist
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
    const testColor = {...testColors[index], dateAdded: new Date()};
    
    // Add to the array
    window.mapColors.push(testColor);
    
    // Save to local storage for persistence
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (e) {
      console.warn('Could not save map colors to localStorage:', e);
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Added ${testColor.name} at ${testColor.location}`);
    }
    
    // Re-render the map
    renderFixedMapView();
    
    return testColor;
  }
  
  // Format date helper
  function formatDate(date) {
    if (!date) return '';
    
    try {
      // Convert to Date object if it's a string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }
  
  // Add functions to global scope
  window.renderFixedMapView = renderFixedMapView;
  window.addTestMapColor = addTestMapColor;
  
  // Load map colors from localStorage on init
  function loadMapColorsFromStorage() {
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
  }
  
  // Call this on init
  loadMapColorsFromStorage();
})();
