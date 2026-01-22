const { useState, useEffect } = React;

const Utils = {
    async loadData() {
        try {
            if (window.PROVIDERS_DATA) {
                return window.PROVIDERS_DATA;
            }
            const response = await fetch('data.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            return { providers: [] };
        }
    },

    formatPrice(price, currency = 'CNY') {
        if (price === null || price === undefined) {
            return '未公开';
        }
        return `¥${price}`;
    },

    formatQuota(quota) {
        if (quota === null || quota === undefined) {
            return '未公开';
        }
        return quota.toLocaleString();
    },

    getMinPrice(provider) {
        if (!provider.plans || provider.plans.length === 0) {
            return null;
        }
        const prices = provider.plans
            .map(plan => plan.monthlyPrice)
            .filter(price => price !== null && price !== undefined);
        if (prices.length === 0) {
            return null;
        }
        return Math.min(...prices);
    },

    getMaxQuota(provider) {
        if (!provider.plans || provider.plans.length === 0) {
            return null;
        }
        const quotas = provider.plans
            .map(plan => plan.monthlyQuota)
            .filter(quota => quota !== null && quota !== undefined);
        if (quotas.length === 0) {
            return null;
        }
        return Math.max(...quotas);
    },

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="platform-rating">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="star">★</span>
                ))}
                {hasHalfStar && <span className="star">★</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} style={{ color: '#d9d9d9' }}>★</span>
                ))}
                <span className="rating-value">{rating}</span>
            </div>
        );
    },

    getInitials(name) {
        return name.substring(0, 2).toUpperCase();
    },

    getColorById(id) {
        const colors = {
            'zhipu': '#667eea',
            'minimax': '#f093fb',
            'volcengine': '#4facfe',
            'streamlake': '#ff6b6b',
            'kimi': '#4ecdc4',
            'aliyun': '#f0932b'
        };
        return colors[id] || '#667eea';
    }
};

window.Utils = Utils;