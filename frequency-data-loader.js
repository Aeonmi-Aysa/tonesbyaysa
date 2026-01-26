// ============================================
// FREQUENCY DATA LOADER - Enhanced Version
// ============================================
// Loads all frequencies, baths, and packs with proper tier filtering
// Integrates with existing app.html and handles UI rendering

console.log('🎵 Frequency Data Loader Initializing...');

// Get current user tier from Supabase or localStorage
window.getCurrentUserTier = function() {
  try {
    // Check if authenticated and has tier
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      const user = JSON.parse(profile);
      return user.subscription_tier || 'free';
    }
    return 'free';
  } catch (e) {
    return 'free';
  }
};

// Get all frequencies for current tier
window.getFrequenciesForTier = function(tier = null) {
  const userTier = tier || window.getCurrentUserTier();
  if (!window.frequencyCatalog) return [];
  
  return window.frequencyCatalog.filter(freq => {
    if (!freq.tier_access) return userTier === 'free';
    return freq.tier_access.includes(userTier) || freq.tier_access.includes('all');
  });
};

// Get all baths for current tier
window.getBathsForTier = function(tier = null) {
  const userTier = tier || window.getCurrentUserTier();
  if (!window.frequencyBaths) return [];
  
  return window.frequencyBaths.filter(bath => {
    if (!bath.tier_access) return true;
    return bath.tier_access.includes(userTier) || bath.tier_access.includes('all');
  });
};

// Get frequencies by category
window.getFrequenciesByCategory = function(category, tier = null) {
  const userTier = tier || window.getCurrentUserTier();
  const allFreqs = window.getFrequenciesForTier(userTier);
  
  if (category === 'all') return allFreqs;
  return allFreqs.filter(f => f.category === category);
};

// Search frequencies
window.searchFrequencies = function(query, tier = null) {
  const userTier = tier || window.getCurrentUserTier();
  const allFreqs = window.getFrequenciesForTier(userTier);
  const lower = query.toLowerCase();
  
  return allFreqs.filter(freq => 
    (freq.name && freq.name.toLowerCase().includes(lower)) ||
    (freq.hz && freq.hz.toString().includes(lower)) ||
    (freq.benefits && freq.benefits.some(b => b.toLowerCase().includes(lower))) ||
    (freq.description && freq.description.toLowerCase().includes(lower))
  );
};

// Get baths by category
window.getBathsByCategory = function(category, tier = null) {
  const userTier = tier || window.getCurrentUserTier();
  const allBaths = window.getBathsForTier(userTier);
  
  if (category === 'all') return allBaths;
  return allBaths.filter(b => b.category === category);
};

// Render frequency grid
window.renderFrequencyGrid = function(frequencies, containerId = 'frequenciesGrid') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }

  if (!frequencies || frequencies.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">No frequencies found</p>';
    return;
  }

  container.innerHTML = frequencies.map(freq => `
    <div class="frequency-card" data-id="${freq.id}">
      <div class="frequency-header">
        <h3 class="frequency-name">${freq.name || 'Frequency'}</h3>
        <button class="favorite-btn" data-id="${freq.id}" title="Add to favorites">♡</button>
      </div>
      
      <div class="frequency-main">
        <div class="frequency-main-value">${freq.hz}</div>
        <div class="frequency-main-unit">Hz</div>
      </div>
      
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0;">
        ${freq.description || 'Healing frequency'}
      </p>
      
      ${freq.benefits ? `
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0;">
          ${freq.benefits.map(b => `<span class="frequency-tag">${b}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="frequency-actions">
        <button class="btn btn-primary" onclick="playFrequency('${freq.id}')">▶ Play ${freq.duration || 60}m</button>
        <button class="btn btn-outline" onclick="addToFavorites('${freq.id}')">★ Save</button>
      </div>
    </div>
  `).join('');

  // Add event listeners to favorite buttons
  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      toggleFavorite(id);
      btn.classList.toggle('active');
    });
  });
};

// Render bath grid
window.renderBathGrid = function(baths, containerId = 'bathsGrid') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }

  if (!baths || baths.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">No baths found</p>';
    return;
  }

  container.innerHTML = baths.map(bath => `
    <div class="frequency-card" data-id="${bath.id}">
      <h3 class="frequency-name">${bath.name}</h3>
      
      <p style="font-size: 0.9rem; color: var(--accent); font-weight: 600; margin: 0.5rem 0;">
        ${bath.duration} minutes
      </p>
      
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0;">
        ${bath.description}
      </p>
      
      ${bath.benefits ? `
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0;">
          ${bath.benefits.map(b => `<span class="frequency-tag">${b}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="frequency-actions">
        <button class="btn btn-primary" onclick="playBath('${bath.id}')">▶ Start Bath</button>
        <button class="btn btn-outline" onclick="addBathToFavorites('${bath.id}')">★ Save</button>
      </div>
    </div>
  `).join('');
};

// Toggle favorite
window.toggleFavorite = function(id) {
  let favorites = JSON.parse(localStorage.getItem('frequency_favorites') || '[]');
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('frequency_favorites', JSON.stringify(favorites));
  return !favorites.includes(id);
};

// Add to favorites
window.addToFavorites = function(id) {
  let favorites = JSON.parse(localStorage.getItem('frequency_favorites') || '[]');
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem('frequency_favorites', JSON.stringify(favorites));
  }
};

// Add bath to favorites
window.addBathToFavorites = function(id) {
  let favorites = JSON.parse(localStorage.getItem('bath_favorites') || '[]');
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem('bath_favorites', JSON.stringify(favorites));
  }
};

// Get favorites
window.getFavorites = function() {
  const favorites = JSON.parse(localStorage.getItem('frequency_favorites') || '[]');
  if (!window.frequencyCatalog) return [];
  return window.frequencyCatalog.filter(f => favorites.includes(f.id));
};

// Get bath favorites
window.getBathFavorites = function() {
  const favorites = JSON.parse(localStorage.getItem('bath_favorites') || '[]');
  if (!window.frequencyBaths) return [];
  return window.frequencyBaths.filter(b => favorites.includes(b.id));
};

// Initialize categories filter
window.initializeCategoryFilters = function() {
  const libraryFilters = document.getElementById('libraryFilters');
  if (libraryFilters) {
    libraryFilters.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Remove active from all
        libraryFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        // Add active to clicked
        chip.classList.add('active');
        // Load frequencies by category
        const category = chip.dataset.category;
        const tier = window.getCurrentUserTier();
        const freqs = category === 'all' 
          ? window.getFrequenciesForTier(tier)
          : window.getFrequenciesByCategory(category, tier);
        window.renderFrequencyGrid(freqs);
      });
    });
  }

  const bathsFilters = document.getElementById('bathsFilters');
  if (bathsFilters) {
    bathsFilters.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        bathsFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const category = chip.dataset.category;
        const tier = window.getCurrentUserTier();
        const baths = category === 'all'
          ? window.getBathsForTier(tier)
          : window.getBathsByCategory(category, tier);
        window.renderBathGrid(baths);
      });
    });
  }
};

// Update library count
window.updateLibraryCount = function() {
  const tier = window.getCurrentUserTier();
  const freqs = window.getFrequenciesForTier(tier);
  const elem = document.getElementById('libraryTotalCount');
  if (elem) {
    elem.textContent = freqs.length;
  }
};

// Initialize on page load
window.initializeFrequencyApp = function() {
  console.log('✅ Initializing Frequency App...');
  
  const tier = window.getCurrentUserTier();
  console.log(`📊 User Tier: ${tier}`);

  // Load initial frequency grid
  const freqs = window.getFrequenciesForTier(tier);
  console.log(`📡 Loaded ${freqs.length} frequencies for ${tier} tier`);
  window.renderFrequencyGrid(freqs);

  // Load baths
  const baths = window.getBathsForTier(tier);
  console.log(`🛁 Loaded ${baths.length} baths for ${tier} tier`);
  window.renderBathGrid(baths);

  // Initialize filters
  window.initializeCategoryFilters();

  // Update counts
  window.updateLibraryCount();

  // Setup favorites tab
  setupFavoritesTab();
  
  console.log('✨ Frequency App Ready!');
};

// Setup favorites tab
window.setupFavoritesTab = function() {
  const favoriteTab = document.querySelector('[data-tab="favorites"]');
  if (!favoriteTab) return;

  favoriteTab.addEventListener('click', () => {
    setTimeout(() => {
      const favorites = window.getFavorites();
      window.renderFrequencyGrid(favorites, 'favoritesGrid');
    }, 50);
  });
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initializeFrequencyApp);
} else {
  window.initializeFrequencyApp();
}

console.log('✅ Frequency Data Loader Ready!');