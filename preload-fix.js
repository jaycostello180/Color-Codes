// preload-fix.js
(function() {
  console.log('Preloader running - fixing script conflicts');
  
  // Block conflicting scripts
  const blockedScripts = [
    'enhanced-standalone-map.js',
    'direct-map.js',
    'direct-view-selector.js',
    'fixed-map-view.js',
    'map-cleanup.js',
    'clean-map.js',
    'fixed-map.js',
    'standalone-map.js',
    'spectrum-fix.js',
    'enhancements.js' // This one might be causing spectrum issues
  ];
  
  // Override document.createElement to block script loading
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      // Override the src setter
      let srcValue = '';
      Object.defineProperty(element, 'src', {
        get: function() { return srcValue; },
        set: function(value) {
          srcValue = value;
          
          // Check if this is a conflicting script
          for (const blockedScript of blockedScripts) {
            if (value.includes(blockedScript)) {
              console.log(`Blocking conflicting script: ${value}`);
              // Make it a no-op script
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
  
  // Override the renderView function when it becomes available
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for app.js to load
    setTimeout(() => {
      if (typeof window.renderView === 'function') {
        console.log('Overriding renderView function');
        const originalRenderView = window.renderView;
        
        window.renderView = function() {
          console.log('Enhanced renderView called for view:', window.currentView);
          
          // Handle our custom views
          if (window.currentView === 'unified-map') {
            if (typeof window.showUnifiedMap === 'function') {
              window.showUnifiedMap();
            }
            return;
          }
          
          if (window.currentView === 'spectrum') {
            if (typeof window.renderCleanSpectrum === 'function') {
              window.renderCleanSpectrum();
            }
            return;
          }
          
          // Fall back to original for other views
          originalRenderView.apply(this, arguments);
        };
      }
    }, 500);
  });
})();
