// map-cleanup.js - Cleans up conflicting map implementations
(function() {
  // Execute as early as possible
  console.log('Map cleanup script running');
  
  // Remove conflicting scripts from DOM
  function removeConflictingScripts() {
    const conflictingScripts = [
      'enhanced-standalone-map.js',
      'standalone-map.js',
      'direct-map.js',
      'direct-view-selector.js',
      'fixed-map-view.js',
      'map.js'
    ];
    
    let removed = 0;
    document.querySelectorAll('script').forEach(script => {
      if (script.src) {
        for (const conflictScript of conflictingScripts) {
          if (script.src.includes(conflictScript)) {
            console.log(`Removing conflicting script: ${script.src}`);
            script.remove();
            removed++;
          }
        }
      }
    });
    
    console.log(`Removed ${removed} conflicting scripts`);
  }
  
  // Remove DOM manipulation from scripts that haven't loaded yet
  function disableConflictingScripts() {
    // Save original createElement to hijack future script tags
    const originalCreateElement = document.createElement;
    
    document.createElement = function(tagName) {
      // Call original method to create the element
      const element = originalCreateElement.call(document, tagName);
      
      // If it's a script tag, monitor its src attribute
      if (tagName.toLowerCase() === 'script') {
        // Override the src setter
        let srcValue = '';
        Object.defineProperty(element, 'src', {
          get: function() { return srcValue; },
          set: function(value) {
            srcValue = value;
            
            // Check if this is a conflicting script
            const conflictingScripts = [
              'enhanced-standalone-map.js',
              'standalone-map.js', 
              'direct-map.js',
              'direct-view-selector.js',
              'fixed-map-view.js',
              'map.js'
            ];
            
            for (const conflictScript of conflictingScripts) {
              if (value.includes(conflictScript)) {
                console.log(`Blocking conflicting script: ${value}`);
                // Replace with empty script
                setTimeout(() => {
                  element.onload?.();
                }, 0);
                return;
              }
            }
          }
        });
      }
      
      return element;
    };
  }
  
  // Prevent other scripts from overriding map view
  function protectMapFunctions() {
    // Block other scripts from changing the view when showing map
    const originalRenderView = window.renderView;
    
    if (originalRenderView) {
      window.renderView = function() {
        // If we're on map view, don't let other scripts change it
        if (window.currentView === 'clean-map') {
          console.log('Protecting map view from being overridden');
          if (typeof window.showCleanMap === 'function') {
            window.showCleanMap();
          }
          return;
        }
        
        // Otherwise, call original function
        return originalRenderView.apply(this, arguments);
      };
    }
  }
  
  // Run cleanup immediately
  removeConflictingScripts();
  disableConflictingScripts();
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Protect map functions after DOM is ready
    protectMapFunctions();
    
    // Remove all map-related buttons except the Clean Map
    document.querySelectorAll('[data-view="map-view"], [data-view="standalone-map"], [data-view="direct-map"], [data-view="location-map"], [data-view="fixed-map"], [data-view="direct-map-view"]').forEach(btn => {
      console.log('Removing conflicting map button:', btn.textContent);
      btn.remove();
    });
    
    console.log('Map cleanup complete');
  });
})();
