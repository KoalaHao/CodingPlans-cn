import { DataLoader } from './data-loader.js';
import { Renderer } from './renderer.js';
import { ModelPopup } from './model-popup.js';
import { PlanPopup } from './plan-popup.js';
import { ModelCompare } from './model-compare.js';

class App {
  constructor() {
    this.dataLoader = new DataLoader();
    this.renderer = new Renderer();
    this.modelPopup = new ModelPopup();
    this.planPopup = new PlanPopup();
    this.modelCompare = null;

    this.state = {
      providers: [],
      currentTab: 'home',
      selectedProviderId: null,
      selectedProviderIds: [],
      filters: {
        sortBy: 'default'
      },
      loading: true
    };

    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    this.state.loading = true;
    this.state.providers = await this.dataLoader.loadAllData();
    this.modelCompare = new ModelCompare(this.dataLoader);
    await this.modelCompare.init();
    this.state.loading = false;
  }

  render() {
    if (this.state.loading) {
      this.renderLoading();
      return;
    }

    if (this.state.selectedProviderId) {
      const provider = this.dataLoader.getProviderById(this.state.selectedProviderId);
      if (provider) {
        this.renderer.renderDetailPage(provider, () => this.handleBack());
      } else {
        this.state.selectedProviderId = null;
        this.renderHome();
      }
    } else if (this.state.currentTab === 'compare') {
      this.renderCompare();
    } else if (this.state.currentTab === 'model-compare') {
      this.renderModelCompare();
    } else {
      this.renderHome();
    }
  }

  renderLoading() {
    document.getElementById('root').innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    `;
  }

  renderHome() {
    this.renderer.renderHomePage(
      this.state.providers,
      this.state.filters,
      (changes) => this.handleFilterChange(changes),
      (providerId) => this.handleProviderClick(providerId),
      (providerId) => this.handleToggleCompare(providerId),
      this.state.selectedProviderIds,
      () => this.handleFilterChange({ currentTab: 'model-compare' })
    );
  }

  renderCompare() {
    this.renderer.renderComparePage(
      this.state.providers,
      this.state.selectedProviderIds,
      (providerId) => this.handleToggleCompare(providerId),
      () => this.handleFilterChange({ currentTab: 'home' })
    );
  }

  renderModelCompare() {
    this.renderer.renderModelComparePage(
      this.modelCompare,
      (modelId) => this.handleModelToggle(modelId),
      (sortBy) => this.handleModelSortChange(sortBy),
      (filterType, value) => this.handleModelFilterChange(filterType, value),
      () => this.handleFilterChange({ currentTab: 'home' })
    );
  }

  handleModelToggle(modelId) {
    this.modelCompare.toggleModelSelection(modelId);
    this.renderModelCompare();
  }

  handleModelSortChange(sortBy) {
    this.modelCompare.setSortBy(sortBy);
    this.renderModelCompare();
  }

  handleModelFilterChange(filterType, value) {
    if (filterType === 'thinking') {
      this.modelCompare.setFilterThinking(value);
    } else if (filterType === 'modalities') {
      this.modelCompare.setFilterModalities(value);
    } else if (filterType === 'clear') {
      this.modelCompare.clearSelection();
    }
    this.renderModelCompare();
  }

  handleFilterChange(changes) {
    if (changes.sortBy !== undefined) {
      this.state.filters.sortBy = changes.sortBy;
    }
    if (changes.currentTab !== undefined) {
      this.state.currentTab = changes.currentTab;
    }
    this.render();
  }

  handleProviderClick(providerId) {
    this.state.selectedProviderId = providerId;
    this.render();
  }

  handleToggleCompare(providerId) {
    const index = this.state.selectedProviderIds.indexOf(providerId);
    if (index === -1) {
      this.state.selectedProviderIds.push(providerId);
    } else {
      this.state.selectedProviderIds.splice(index, 1);
    }
    this.render();
  }

  handleBack() {
    this.state.selectedProviderId = null;
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
