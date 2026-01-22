const { useState, useEffect } = React;
const { Tabs, Button, Space } = antd;

const App = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [filters, setFilters] = useState({
        sortBy: 'default',
        priceRange: [0, 500],
        selectedProviders: ['zhipu', 'minimax', 'volcengine', 'streamlake', 'kimi', 'aliyun']
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await Utils.loadData();
        setProviders(data.providers);
        setLoading(false);
    };

    const handleProviderClick = (provider) => {
        setSelectedProvider(provider);
        setCurrentPage('detail');
    };

    const handleBack = () => {
        setSelectedProvider(null);
        setCurrentPage('home');
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const getFilteredProviders = () => {
        let filtered = [...providers];

        if (filters.selectedProviders.length > 0) {
            filtered = filtered.filter(p => filters.selectedProviders.includes(p.id));
        }

        const minPrice = filters.priceRange[0];
        const maxPrice = filters.priceRange[1];

        filtered = filtered.filter(provider => {
            const providerMinPrice = Utils.getMinPrice(provider);
            if (providerMinPrice === null) return true;
            return providerMinPrice >= minPrice && providerMinPrice <= maxPrice;
        });

        switch (filters.sortBy) {
            case 'priceAsc':
                filtered.sort((a, b) => {
                    const priceA = Utils.getMinPrice(a) || Infinity;
                    const priceB = Utils.getMinPrice(b) || Infinity;
                    return priceA - priceB;
                });
                break;
            case 'priceDesc':
                filtered.sort((a, b) => {
                    const priceA = Utils.getMinPrice(a) || -Infinity;
                    const priceB = Utils.getMinPrice(b) || -Infinity;
                    return priceB - priceA;
                });
                break;
            case 'quotaAsc':
                filtered.sort((a, b) => {
                    const quotaA = Utils.getMaxQuota(a) || -Infinity;
                    const quotaB = Utils.getMaxQuota(b) || -Infinity;
                    return quotaA - quotaB;
                });
                break;
            case 'quotaDesc':
                filtered.sort((a, b) => {
                    const quotaA = Utils.getMaxQuota(a) || -Infinity;
                    const quotaB = Utils.getMaxQuota(b) || -Infinity;
                    return quotaB - quotaA;
                });
                break;
            case 'ratingDesc':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        return filtered;
    };

    const toggleProviderSelection = (providerId) => {
        setSelectedProviders(prev => {
            if (prev.includes(providerId)) {
                return prev.filter(id => id !== providerId);
            } else {
                return [...prev, providerId];
            }
        });
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                加载中...
            </div>
        );
    }

    if (currentPage === 'detail' && selectedProvider) {
        return (
            <div className="app-container">
                <PlatformDetail provider={selectedProvider} onBack={handleBack} />
            </div>
        );
    }

    const filteredProviders = getFilteredProviders();

    return (
        <div className="app-container">
            <header className="header">
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    <h1>AI Coding Plan 对比平台</h1>
                    <p>对比国内主流AI编码服务的价格、额度和功能</p>
                </div>
            </header>

            <main className="content">
                <Tabs
                    defaultActiveKey="home"
                    activeKey={currentPage}
                    onChange={setCurrentPage}
                    items={[
                        {
                            key: 'home',
                            label: '首页',
                            children: (
                                <div>
                                    <FilterBar filters={filters} onFilterChange={handleFilterChange} />
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: '1.5rem',
                                        marginTop: '2rem'
                                    }}>
                                        {filteredProviders.map(provider => (
                                            <PlatformCard
                                                key={provider.id}
                                                provider={provider}
                                                onClick={handleProviderClick}
                                                selected={selectedProviders.includes(provider.id)}
                                            />
                                        ))}
                                    </div>
                                    {filteredProviders.length === 0 && (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '3rem', 
                                            color: '#666',
                                            fontSize: '1.1rem'
                                        }}>
                                            没有找到符合条件的服务商
                                        </div>
                                    )}
                                </div>
                            )
                        },
                        {
                            key: 'compare',
                            label: '对比',
                            children: (
                                <div>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>选择要对比的服务商（点击卡片选择）</h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {providers.map(provider => (
                                                <div
                                                    key={provider.id}
                                                    onClick={() => toggleProviderSelection(provider.id)}
                                                    style={{
                                                        padding: '1rem',
                                                        border: '2px solid',
                                                        borderColor: selectedProviders.includes(provider.id) ? '#667eea' : '#e8e8e8',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        background: selectedProviders.includes(provider.id) 
                                                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                                            : 'white',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                        {provider.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                        {provider.nameEn}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <ComparisonTable 
                                        providers={providers} 
                                        selectedProviders={selectedProviders} 
                                    />
                                </div>
                            )
                        }
                    ]}
                />
            </main>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);