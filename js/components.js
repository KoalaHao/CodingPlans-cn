const { useState, useEffect } = React;
const { Button, Table, Select, Slider, Checkbox, Card, Tag } = antd;
const { Option } = Select;

const PlatformCard = ({ provider, onClick, selected }) => {
    const minPrice = Utils.getMinPrice(provider);
    const maxQuota = Utils.getMaxQuota(provider);
    const color = Utils.getColorById(provider.id);

    return (
        <div
            className={`platform-card ${selected ? 'selected' : ''}`}
            onClick={() => onClick(provider)}
        >
            <div className="platform-logo" style={{ background: color }}>
                {Utils.getInitials(provider.name)}
            </div>
            <div className="platform-name">{provider.name}</div>
            <div className="platform-name-en">{provider.nameEn}</div>
            {Utils.renderStars(provider.rating)}
            <div className="platform-description">{provider.description}</div>
            <div className="platform-price">
                {minPrice ? `¥${minPrice}/月起` : '价格未公开'}
            </div>
            <div className="platform-quota">
                {maxQuota ? `最高 ${maxQuota.toLocaleString()}/月` : '额度未公开'}
            </div>
        </div>
    );
};

const FilterBar = ({ filters, onFilterChange }) => {
    return (
        <div className="filter-bar">
            <div className="filter-section">
                <label className="filter-label">排序方式</label>
                <Select
                    style={{ width: '100%' }}
                    value={filters.sortBy}
                    onChange={(value) => onFilterChange({ ...filters, sortBy: value })}
                >
                    <Option value="default">默认</Option>
                    <Option value="priceAsc">价格从低到高</Option>
                    <Option value="priceDesc">价格从高到低</Option>
                    <Option value="quotaAsc">额度从低到高</Option>
                    <Option value="quotaDesc">额度从高到低</Option>
                    <Option value="ratingDesc">评分从高到低</Option>
                </Select>
            </div>
            <div className="filter-section">
                <label className="filter-label">价格范围: ¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}</label>
                <Slider
                    range
                    min={0}
                    max={500}
                    value={filters.priceRange}
                    onChange={(value) => onFilterChange({ ...filters, priceRange: value })}
                />
            </div>
            <div className="filter-section">
                <label className="filter-label">服务商筛选</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['zhipu', 'minimax', 'volcengine', 'streamlake', 'kimi', 'aliyun'].map(id => (
                        <Checkbox
                            key={id}
                            checked={filters.selectedProviders.includes(id)}
                            onChange={(e) => {
                                const newSelected = e.target.checked
                                    ? [...filters.selectedProviders, id]
                                    : filters.selectedProviders.filter(p => p !== id);
                                onFilterChange({ ...filters, selectedProviders: newSelected });
                            }}
                        >
                            {id.charAt(0).toUpperCase() + id.slice(1)}
                        </Checkbox>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ComparisonTable = ({ providers, selectedProviders }) => {
    const selectedProvidersData = providers.filter(p => selectedProviders.includes(p.id));

    if (selectedProvidersData.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                请选择至少一个服务商进行对比
            </div>
        );
    }

    const columns = [
        {
            title: '对比项',
            dataIndex: 'feature',
            key: 'feature',
            width: 150,
        },
        ...selectedProvidersData.map(provider => ({
            title: provider.name,
            dataIndex: provider.id,
            key: provider.id,
            render: (text, record) => {
                if (record.feature === '评分') {
                    return Utils.renderStars(provider.rating);
                }
                if (record.feature === '最低价格') {
                    const minPrice = Utils.getMinPrice(provider);
                    return minPrice ? `¥${minPrice}/月` : '未公开';
                }
                if (record.feature === '最高额度') {
                    const maxQuota = Utils.getMaxQuota(provider);
                    return maxQuota ? maxQuota.toLocaleString() : '未公开';
                }
                if (record.feature === '支持模型') {
                    return provider.models.join(', ');
                }
                if (record.feature === '适配工具') {
                    return provider.tools.join(', ');
                }
                if (record.feature === '优点') {
                    return provider.features.pros.map((pro, i) => (
                        <Tag key={i} color="green">{pro}</Tag>
                    ));
                }
                if (record.feature === '缺点') {
                    return provider.features.cons.map((con, i) => (
                        <Tag key={i} color="red">{con}</Tag>
                    ));
                }
                return text;
            },
        })),
    ];

    const dataSource = [
        { key: 'rating', feature: '评分' },
        { key: 'price', feature: '最低价格' },
        { key: 'quota', feature: '最高额度' },
        { key: 'models', feature: '支持模型' },
        { key: 'tools', feature: '适配工具' },
        { key: 'pros', feature: '优点' },
        { key: 'cons', feature: '缺点' },
    ];

    return (
        <div className="comparison-table">
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                scroll={{ x: true }}
            />
        </div>
    );
};

const PlatformDetail = ({ provider, onBack }) => {
    const color = Utils.getColorById(provider.id);

    return (
        <div className="detail-page">
            <button className="back-button" onClick={onBack}>
                ← 返回
            </button>

            <div className="detail-header">
                <div className="detail-logo" style={{ background: color }}>
                    {Utils.getInitials(provider.name)}
                </div>
                <div className="detail-info">
                    <h2>{provider.name}</h2>
                    <div className="name-en">{provider.nameEn}</div>
                    <div className="description">{provider.description}</div>
                    {Utils.renderStars(provider.rating)}
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="website-link">
                        访问官网 →
                    </a>
                </div>
            </div>

            <div className="detail-section">
                <h3>套餐详情</h3>
                {provider.plans && provider.plans.map(plan => (
                    <div key={plan.id} className="plan-card">
                        <h4>{plan.name}</h4>
                        <div className="plan-price">
                            {plan.monthlyPrice ? `¥${plan.monthlyPrice}` : '未公开'}
                            <span>/月</span>
                        </div>
                        <div className="plan-details">
                            <div className="plan-detail-item">
                                <span className="plan-detail-label">年付价格</span>
                                <span className="plan-detail-value">
                                    {plan.yearlyPrice ? `¥${plan.yearlyPrice}/年` : '未公开'}
                                </span>
                            </div>
                            <div className="plan-detail-item">
                                <span className="plan-detail-label">首月优惠</span>
                                <span className="plan-detail-value">
                                    {plan.firstMonthPrice ? `¥${plan.firstMonthPrice}` : '无'}
                                </span>
                            </div>
                            <div className="plan-detail-item">
                                <span className="plan-detail-label">5小时限额</span>
                                <span className="plan-detail-value">
                                    {plan.per5hours ? plan.per5hours.toLocaleString() : '未公开'}
                                </span>
                            </div>
                            <div className="plan-detail-item">
                                <span className="plan-detail-label">月度额度</span>
                                <span className="plan-detail-value">
                                    {plan.monthlyQuota ? plan.monthlyQuota.toLocaleString() : '未公开'}
                                </span>
                            </div>
                            <div className="plan-detail-item">
                                <span className="plan-detail-label">RPM限制</span>
                                <span className="plan-detail-value">
                                    {plan.rpm ? plan.rpm : '未公开'}
                                </span>
                            </div>
                            <div className="plan-detail-item">
                                <span className="plan-detail-label">TPM限制</span>
                                <span className="plan-detail-value">
                                    {plan.tpm ? plan.tpm.toLocaleString() : '未公开'}
                                </span>
                            </div>
                        </div>
                        {plan.note && (
                            <div style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
                                {plan.note}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="detail-section">
                <h3>支持模型</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {provider.models.map((model, i) => (
                        <Tag key={i} color="blue">{model}</Tag>
                    ))}
                </div>
            </div>

            <div className="detail-section">
                <h3>适配工具</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {provider.tools.map((tool, i) => (
                        <Tag key={i} color="purple">{tool}</Tag>
                    ))}
                </div>
            </div>

            <div className="detail-section">
                <h3>优点</h3>
                <ul className="features-list">
                    {provider.features.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                    ))}
                </ul>
            </div>

            <div className="detail-section">
                <h3>缺点</h3>
                <ul className="cons-list">
                    {provider.features.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                    ))}
                </ul>
            </div>

            {provider.userReviews && provider.userReviews.length > 0 && (
                <div className="detail-section">
                    <h3>用户评价</h3>
                    <div className="user-reviews">
                        {provider.userReviews.map((review, i) => (
                            <div key={i} className="user-review">
                                {review}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

window.PlatformCard = PlatformCard;
window.FilterBar = FilterBar;
window.ComparisonTable = ComparisonTable;
window.PlatformDetail = PlatformDetail;