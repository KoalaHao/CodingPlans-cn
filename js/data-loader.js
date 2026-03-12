export class DataLoader {
  constructor() {
    this.providers = [];
    this.models = new Map();
  }

  async loadAllData() {
    try {
      // Load models first
      await this.loadModelsData();

      // Then load providers - auto scan all JSON files in data folder
      const dataFiles = await this.scanDataFiles();
      const loadPromises = dataFiles.map(file => this.loadProviderData(file));
      const results = await Promise.allSettled(loadPromises);

      this.providers = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      // Resolve model references for each provider
      this.providers.forEach(provider => {
        provider.models = this.resolveModels(provider.models);
      });

      // Sort providers by name
      this.providers.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

      if (this.providers.length === 0) {
        console.warn('No provider data loaded');
      }

      console.log(`Loaded ${this.providers.length} providers:`, this.providers.map(p => p.name));

      return this.providers;
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  async scanDataFiles() {
    // Method 1: Hardcoded list - easy to manage
    // return ['dummy.json', 'zhipu.json', 'minimax.json'];

    // Method 2: Auto-scan - fetch directory listing
    try {
      // Try to get directory listing
      const response = await fetch('data/');
      if (response.ok) {
        const text = await response.text();
        // Parse HTML directory listing to find JSON files
        const matches = text.match(/href="([^"]+\.json)"/g);
        if (matches) {
          const files = matches
            .map(m => m.replace('href="', '').replace('"', ''))
            .filter(f => f !== 'models.json'); // Exclude models.json
          return files;
        }
      }
    } catch (e) {
      console.log('Auto-scan failed, using manual list');
    }

    // Fallback: Manual list - add your provider files here
    return [
      'dummy.json',
      // Add more provider files here:
      // 'zhipu.json',
      // 'minimax.json',
      // 'volcengine.json',
      // 'kimi.json',
      // 'aliyun.json',
    ];
  }

  async loadModelsData() {
    try {
      const response = await fetch('data/models.json');
      if (!response.ok) {
        throw new Error(`Failed to load models.json: ${response.status}`);
      }
      const data = await response.json();

      // Store models in a Map for quick lookup
      data.models.forEach(model => {
        this.models.set(model.id, model);
      });

      console.log(`Loaded ${this.models.size} models`);
    } catch (error) {
      console.error('Error loading models data:', error);
    }
  }

  async loadProviderData(filename) {
    try {
      const response = await fetch(`data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status}`);
      }
      const data = await response.json();
      return {
        id: filename.replace('.json', ''),
        ...data
      };
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }

  resolveModels(modelRefs) {
    if (!Array.isArray(modelRefs)) return [];

    return modelRefs
      .map(ref => {
        if (typeof ref === 'string') {
          // It's a model ID reference
          return this.models.get(ref);
        } else if (typeof ref === 'object' && ref.id) {
          // It might be a full model object or have an id
          return this.models.get(ref.id) || ref;
        }
        return null;
      })
      .filter(model => model !== undefined && model !== null);
  }

  getProviders() {
    return this.providers;
  }

  getProviderById(id) {
    return this.providers.find(p => p.id === id);
  }

  getModelById(id) {
    return this.models.get(id);
  }

  getAllModels() {
    return Array.from(this.models.values());
  }
}
