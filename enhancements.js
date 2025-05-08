// enhancements.js - Add this file to your project
(function() {
  // Wait for the page to be fully loaded
  window.addEventListener('load', function() {
    console.log('Enhancements initializing...');
    
    // Add click event to color squares to show detail modal
    addColorDetailModal();
  });
  
  // Add click event to color squares
  function addColorDetailModal() {
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('color-square')) {
        // Find the color data for this square
        const index = Array.from(document.querySelectorAll('.color-square')).indexOf(e.target);
        if (index >= 0 && window.colors && window.colors[index]) {
          showColorDetailModal(window.colors[index]);
        }
      }
    });
  }
  
  // Show color detail modal
  function showColorDetailModal(color) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'color-detail-modal';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'color-detail-content';
    
    // Create color swatch
    const swatch = document.createElement('div');
    swatch.className = 'color-detail-swatch';
    swatch.style.backgroundColor = color.hex;
    
    // Create info section
    const info = document.createElement('div');
    info.className = 'color-detail-info';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'color-detail-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Create name
    const name = document.createElement('h2');
    name.className = 'color-detail-name';
    name.textContent = color.name;
    
    // Create color code
    const colorCode = document.createElement('div');
    colorCode.className = 'color-detail-code';
    colorCode.textContent = color.hex;
    colorCode.addEventListener('click', function() {
      navigator.clipboard.writeText(color.hex);
      const originalText = this.textContent;
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = originalText;
      }, 1000);
    });
    
    // Create additional info
    const dateInfo = document.createElement('p');
    dateInfo.textContent = `Added: ${color.dateAdded.toLocaleDateString()}`;
    
    const proximityInfo = document.createElement('p');
    proximityInfo.textContent = `Emotional proximity: ${color.proximity.replace('-', ' ')}`;
    
    const originalInfo = document.createElement('p');
    originalInfo.textContent = `Original code: ${color.originalCode}`;
    
    // Assemble the modal
    info.appendChild(closeBtn);
    info.appendChild(name);
    info.appendChild(colorCode);
    info.appendChild(dateInfo);
    info.appendChild(proximityInfo);
    info.appendChild(originalInfo);
    
    content.appendChild(swatch);
    content.appendChild(info);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add show class after a brief delay for animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });
  }
})();
