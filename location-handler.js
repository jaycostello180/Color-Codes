// location-handler.js - Adds location support to the color adding process
(function() {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Location handler loaded');
    
    // Add location styles to document
    addLocationStyles();
    
    // Enhance the Add Color button to ask for location
    enhanceAddColorButton();
  });
  
  // Add styles for location features
  function addLocationStyles() {
    if (document.getElementById('location-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'location-styles';
    styleEl.textContent = `
      /* Location prompt styles */
      .location-prompt {
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
      
      .location-prompt.show {
        opacity: 1;
      }
      
      .location-prompt-content {
        background-color: #111;
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 10px;
        padding: 20px;
        width: 90%;
        max-width: 400px;
        color: cyan;
        text-align: center;
        transform: translateY(20px);
        transition: transform 0.3s ease;
      }
      
      .location-prompt.show .location-prompt-content {
        transform: translateY(0);
      }
      
      .location-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
      }
      
      .location-btn {
        padding: 10px 15px;
        border-radius: 5px;
        border: 1px solid rgba(0, 255, 255, 0.3);
        background-color: rgba(0, 255, 255, 0.1);
        color: cyan;
        font-family: monospace;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .location-btn:hover {
        background-color: rgba(0, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      
      .location-btn.deny {
        border-color: rgba(255, 100, 100, 0.3);
        color: rgba(255, 100, 100, 0.8);
      }
      
      .location-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }
      
      .location-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 255, 255, 0.3);
        border-top: 3px solid rgba(0, 255, 255, 0.8);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  // Enhance the Add Color button to ask for location
  function enhanceAddColorButton() {
    // Find the button
    const addBtn = document.getElementById('add-btn');
    if (!addBtn) {
      console.warn('Add Color button not found');
      return;
    }
    
    console.log('Enhancing Add Color button with location support');
    
    // Store original onclick handler if it exists
    const originalOnClick = addBtn.onclick;
    
    // Replace with our enhanced version
    addBtn.onclick = async function(event) {
      // Prevent default (if any)
      event.preventDefault();
      
      // Get color code
      const colorCode = document.getElementById('color-code').value.trim();
      if (!colorCode) {
        showNotification('Please enter a color code');
        return;
      }
      
      // Process the color normally first (create the color object)
      // This is tricky because we need to reproduce what the original function does
      
      // Normalize the color code
      const normalizedCode = colorCode.startsWith('#') ? colorCode.substring(1) : colorCode;
      
      // Detect format and convert to hex
      let format, hexColor, colorName;
      
      if (typeof window.detectFormat === 'function') {
        format = window.detectFormat(normalizedCode);
        if (!format) {
          showNotification('Unknown color code format');
          return;
        }
        
        hexColor = window.convertToHex(normalizedCode, format);
        if (!hexColor) {
          showNotification('Could not convert color code to hex');
          return;
        }
        
        colorName = typeof window.getColorName === 'function' ? 
          window.getColorName(hexColor, normalizedCode, format.name) : 
          normalizedCode;
      } else {
        // Simplified fallback
        hexColor = normalizedCode.length === 6 ? '#' + normalizedCode.toUpperCase() : '#' + normalizedCode;
        colorName = 'Color ' + normalizedCode;
      }
      
      // At this point we have a valid color, now ask for location
      try {
        // Show location prompt
        const locationResult = await promptForLocation();
        
        if (locationResult.allowed) {
          // User allowed location sharing, add the color with location
          const colorWithLocation = {
            hex: hexColor,
            originalCode: normalizedCode,
            name: colorName,
            location: {
              latitude: locationResult.coords.latitude,
              longitude: locationResult.coords.longitude
            }
          };
          
          // Add to map colors
          if (!window.mapColors) {
            window.mapColors = [];
          }
          
          window.mapColors.push({
            hex: hexColor,
            name: colorName,
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            location: locationResult.locationName || '',
            dateAdded: new Date()
          });
          
          // Save map colors
          saveMapColors();
          
          // Show confirmation
          showNotification('Color added with location data!');
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
      
      // Finally, call the original handler or addNewColor function
      if (originalOnClick) {
        originalOnClick.call(this, event);
      } else if (typeof window.addNewColor === 'function') {
        window.addNewColor();
      } else {
        // Clear input fields at minimum
        document.getElementById('color-code').value = '';
        if (document.getElementById('preview')) {
          document.getElementById('preview').style.backgroundColor = '';
        }
        if (document.getElementById('format-display')) {
          document.getElementById('format-display').textContent = '';
        }
      }
    };
  }
  
  // Show location prompt to user
  function promptForLocation() {
    return new Promise((resolve, reject) => {
      // Create prompt element
      const prompt = document.createElement('div');
      prompt.className = 'location-prompt';
      prompt.innerHTML = `
        <div class="location-prompt-content">
          <h3>Share Location?</h3>
          <p>Would you like to add this color's location to the map?</p>
          <p>This helps build a global color collective!</p>
          <div class="location-buttons">
            <button class="location-btn deny">No Thanks</button>
            <button class="location-btn">Yes, Share Location</button>
          </div>
        </div>
      `;
      
      // Add to document
      document.body.appendChild(prompt);
      
      // Show with animation
      setTimeout(() => {
        prompt.classList.add('show');
      }, 10);
      
      // Handle button clicks
      const denyBtn = prompt.querySelector('.location-btn.deny');
      const allowBtn = prompt.querySelector('.location-btn:not(.deny)');
      
      denyBtn.addEventListener('click', () => {
        prompt.classList.remove('show');
        setTimeout(() => {
          prompt.remove();
        }, 300);
        resolve({ allowed: false });
      });
      
      allowBtn.addEventListener('click', async () => {
        // Show loading indicator
        const content = prompt.querySelector('.location-prompt-content');
        content.innerHTML = `
          <div class="location-loading">
            <h3>Getting Location...</h3>
            <div class="location-spinner"></div>
            <p>Please allow location access when prompted</p>
          </div>
        `;
        
        try {
          // Get user's location
          const position = await getCurrentPosition();
          
          // Try to get location name
          let locationName = '';
          try {
            locationName = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          } catch (error) {
            console.warn('Could not get location name:', error);
          }
          
          // Remove prompt
          prompt.classList.remove('show');
          setTimeout(() => {
            prompt.remove();
          }, 300);
          
          // Resolve with location data
          resolve({
            allowed: true,
            coords: position.coords,
            locationName
          });
        } catch (error) {
          // Show error
          content.innerHTML = `
            <h3>Location Error</h3>
            <p>${error.message || 'Could not get your location'}</p>
            <div class="location-buttons">
              <button class="location-btn">Continue Without Location</button>
            </div>
          `;
          
          // Handle continue button
          content.querySelector('.location-btn').addEventListener('click', () => {
            prompt.classList.remove('show');
            setTimeout(() => {
              prompt.remove();
            }, 300);
            
            resolve({ allowed: false });
          });
        }
      });
    });
  }
  
  // Get current position
  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  }
  
  // Reverse geocode to get location name
  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract a simpler location name if possible
        if (data.address) {
          const parts = [];
          
          // Try to get city/town
          if (data.address.city) {
            parts.push(data.address.city);
          } else if (data.address.town) {
            parts.push(data.address.town);
          } else if (data.address.village) {
            parts.push(data.address.village);
          }
          
          // Add state/province/region
          if (data.address.state) {
            parts.push(data.address.state);
          } else if (data.address.province) {
            parts.push(data.address.province);
          } else if (data.address.region) {
            parts.push(data.address.region);
          }
          
          // Add country
          if (data.address.country) {
            parts.push(data.address.country);
          }
          
          if (parts.length > 0) {
            return parts.join(', ');
          }
        }
        
        // Fall back to display name, but limit it
        const shortName = data.display_name.split(',').slice(0, 3).join(',');
        return shortName;
      }
      
      return '';
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return '';
    }
  }
  
  // Save map colors to localStorage
  function saveMapColors() {
    try {
      localStorage.setItem('mapColors', JSON.stringify(window.mapColors));
    } catch (error) {
      console.warn('Error saving map colors to localStorage:', error);
    }
  }
  
  // Show notification
  function showNotification(message) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message);
    } else {
      // Fallback notification
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
  }
})();
