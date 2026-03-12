export class PlanPopup {
  constructor() {
    this.popup = null;
    this.currentTarget = null;
    this.showDelay = 200;
    this.hideDelay = 100;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.init();
  }

  init() {
    this.createPopupElement();
    this.bindGlobalEvents();
  }

  createPopupElement() {
    this.popup = document.createElement('div');
    this.popup.className = 'plan-popup';
    this.popup.style.cssText = `
      position: fixed;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      pointer-events: none;
    `;
    document.body.appendChild(this.popup);
  }

  bindGlobalEvents() {
    document.addEventListener('mouseover', (e) => {
      const planTag = e.target.closest('[data-plan-info]');
      if (planTag) {
        this.handleMouseEnter(planTag);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const planTag = e.target.closest('[data-plan-info]');
      if (planTag) {
        this.handleMouseLeave(planTag);
      }
    });
  }

  handleMouseEnter(target) {
    this.currentTarget = target;
    
    clearTimeout(this.hideTimeout);
    
    this.showTimeout = setTimeout(() => {
      if (this.currentTarget === target) {
        this.show(target);
      }
    }, this.showDelay);
  }

  handleMouseLeave(target) {
    clearTimeout(this.showTimeout);
    
    this.hideTimeout = setTimeout(() => {
      if (!this.popup.matches(':hover')) {
        this.hide();
      }
    }, this.hideDelay);
  }

  show(target) {
    const planData = JSON.parse(target.dataset.planInfo);
    this.renderContent(planData);
    this.position(target);
    
    this.popup.style.opacity = '1';
    this.popup.style.visibility = 'visible';
    this.popup.style.pointerEvents = 'auto';
  }

  hide() {
    this.popup.style.opacity = '0';
    this.popup.style.visibility = 'hidden';
    this.popup.style.pointerEvents = 'none';
    this.currentTarget = null;
  }

  renderContent(plan) {
    const formatNumber = (num) => {
      if (num === null || num === undefined) return '-';
      if (num >= 10000) return (num / 10000).toFixed(1) + '万';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toLocaleString();
    };

    const hasAnyPrice = plan.price.firstBuy !== null || plan.price.firstRenew !== null || plan.price.regular !== null;

    this.popup.innerHTML = `
      <div class="plan-popup-header">
        <span class="plan-popup-name">${plan.name}</span>
      </div>
      <div class="plan-popup-content">
        ${hasAnyPrice ? `
        <div class="plan-popup-section">
          <div class="plan-popup-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            价格
          </div>
          <div class="plan-popup-prices">
            ${plan.price.firstBuy !== null ? `
            <div class="plan-popup-price-row">
              <span class="plan-popup-price-label">首购价</span>
              <span class="plan-popup-price-value highlight">¥${plan.price.firstBuy}</span>
            </div>
            ` : ''}
            ${plan.price.firstRenew !== null ? `
            <div class="plan-popup-price-row">
              <span class="plan-popup-price-label">续费价</span>
              <span class="plan-popup-price-value">¥${plan.price.firstRenew}</span>
            </div>
            ` : ''}
            ${plan.price.regular !== null ? `
            <div class="plan-popup-price-row">
              <span class="plan-popup-price-label">常规价</span>
              <span class="plan-popup-price-value">¥${plan.price.regular}</span>
            </div>
            ` : ''}
          </div>
          ${plan.price.extraInfo ? `<div class="plan-popup-extra-info">${plan.price.extraInfo}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="plan-popup-section">
          <div class="plan-popup-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            使用额度
          </div>
          <div class="plan-popup-limits">
            <div class="plan-popup-limit-row">
              <span class="plan-popup-limit-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                5小时限额
              </span>
              <span class="plan-popup-limit-value">${formatNumber(plan.limits.per5hours)}</span>
            </div>
            <div class="plan-popup-limit-row">
              <span class="plan-popup-limit-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                每周限额
              </span>
              <span class="plan-popup-limit-value">${formatNumber(plan.limits.perWeek)}</span>
            </div>
            <div class="plan-popup-limit-row">
              <span class="plan-popup-limit-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                每月限额
              </span>
              <span class="plan-popup-limit-value">${formatNumber(plan.limits.perMonth)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  position(target) {
    const rect = target.getBoundingClientRect();
    const popupRect = this.popup.getBoundingClientRect();
    
    let top = rect.top - popupRect.height - 8;
    let left = rect.left + (rect.width / 2) - (popupRect.width / 2);
    
    if (top < 10) {
      top = rect.bottom + 8;
    }
    
    if (left < 10) {
      left = 10;
    } else if (left + popupRect.width > window.innerWidth - 10) {
      left = window.innerWidth - popupRect.width - 10;
    }
    
    this.popup.style.top = `${top}px`;
    this.popup.style.left = `${left}px`;
  }
}
