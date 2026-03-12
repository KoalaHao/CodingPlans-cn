import { getIcon } from './config.js';

export class ModelCompare {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.models = [];
    this.selectedModelIds = [];
    this.sortBy = 'sweBench';
    this.sortDirection = 'desc';
    this.filterThinking = 'all';
    this.filterModalities = 'all';
  }

  async init() {
    this.models = this.dataLoader.getAllModels();
    return this;
  }

  setSortBy(sortBy) {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc';
    }
  }

  setFilterThinking(filter) {
    this.filterThinking = filter;
  }

  setFilterModalities(filter) {
    this.filterModalities = filter;
  }

  isEstimatedScore(model, benchmarkKey) {
    return model.estimatedBenchmarks && model.estimatedBenchmarks.includes(benchmarkKey);
  }

  toggleModelSelection(modelId) {
    const index = this.selectedModelIds.indexOf(modelId);
    if (index === -1) {
      if (this.selectedModelIds.length < 4) {
        this.selectedModelIds.push(modelId);
      }
    } else {
      this.selectedModelIds.splice(index, 1);
    }
  }

  getFilteredAndSortedModels() {
    let filtered = [...this.models];

    if (this.filterThinking !== 'all') {
      const hasThinking = this.filterThinking === 'yes';
      filtered = filtered.filter(m => m.info.thinking === hasThinking);
    }

    if (this.filterModalities !== 'all') {
      filtered = filtered.filter(m => m.info.modalities.includes(this.filterModalities));
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (this.sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
        return this.sortDirection === 'desc' 
          ? bVal.localeCompare(aVal, 'zh-CN')
          : aVal.localeCompare(bVal, 'zh-CN');
      }
      
      if (this.sortBy === 'parameters') {
        aVal = this.parseParameters(a.info.parameters);
        bVal = this.parseParameters(b.info.parameters);
      } else {
        aVal = a.info[this.sortBy] ?? -1;
        bVal = b.info[this.sortBy] ?? -1;
      }
      
      if (this.sortDirection === 'desc') {
        return bVal - aVal;
      } else {
        return aVal - bVal;
      }
    });

    return filtered;
  }

  getSelectedModels() {
    return this.models.filter(m => this.selectedModelIds.includes(m.id));
  }

  clearSelection() {
    this.selectedModelIds = [];
  }

  getBenchmarkColor(score, maxScore = 100) {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return '#10B981';
    if (ratio >= 0.6) return '#F59E0B';
    if (ratio >= 0.4) return '#F97316';
    return '#EF4444';
  }

  formatNumber(num) {
    if (num === null || num === undefined) return '-';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  parseParameters(paramStr) {
    if (!paramStr || paramStr === '-') return 0;
    const match = paramStr.match(/^([\d.]+)\s*([TBMK]?)$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    const multipliers = {
      'T': 1000000000000,
      'B': 1000000000,
      'M': 1000000,
      'K': 1000,
      '': 1
    };
    
    return value * (multipliers[unit] || 1);
  }
}
