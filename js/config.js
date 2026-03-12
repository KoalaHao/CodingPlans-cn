// Global configuration for benchmark scores
export const GLOBAL_BENCHMARKS = {
  sweBench: {
    // 查询时间: 2026-03-12
    // 网页来源: https://www.swebench.com/
    // 最高分模型: Claude 4.5 Opus (high reasoning) - 76.80%
    max: 76.8,
    unit: '%'
  },
  liveCodeBench: {
    // 查询时间: 2026-03-12
    // 网页来源: https://livecodebench.github.io/ 及相关技术报道
    // 最高分模型: GPT-5.2 / o3 / DeepSeek-R1 系列 (约90%)
    max: 90.0,
    unit: '%'
  }
};

// Icon SVG mappings - using Lucide-style icons
export const ICONS = {
  // Provider icons
  code: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,

  // Model icons
  cpu: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>`,

  zap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,

  rocket: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,

  // Default icon
  default: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,

  // Provider default
  providerDefault: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
};

export function getIcon(name, size = 'md') {
  const icon = ICONS[name] || ICONS.default;
  if (size === 'lg') {
    return icon.replace(/width="16"/g, 'width="24"').replace(/height="16"/g, 'height="24"');
  }
  if (size === 'xl') {
    return icon.replace(/width="16"/g, 'width="32"').replace(/height="16"/g, 'height="32"');
  }
  return icon;
}

export function getProviderIcon(name) {
  return ICONS[name] || ICONS.providerDefault;
}

export function formatBenchmarkScore(score, benchmarkType) {
  if (score === null || score === undefined) return '-';
  const benchmark = GLOBAL_BENCHMARKS[benchmarkType];
  if (!benchmark) return `${score}${benchmark?.unit || ''}`;

  const percentage = ((score / benchmark.max) * 100).toFixed(0);
  return `${score}${benchmark.unit}/${benchmark.max}${benchmark.unit}`;
}

export function getBenchmarkPercentage(score, benchmarkType) {
  if (score === null || score === undefined) return 0;
  const benchmark = GLOBAL_BENCHMARKS[benchmarkType];
  if (!benchmark) return 0;
  return Math.min(100, (score / benchmark.max) * 100);
}
