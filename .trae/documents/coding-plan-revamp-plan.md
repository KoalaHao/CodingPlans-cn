# AI Coding Plan 对比平台重构计划

## 概述
完全重构现有的 Coding Plan 对比页面，从单一 HTML 文件改为 JSON 数据驱动架构。每个 Coding Plan 服务商将拥有独立的 JSON 文件。

---

## 新的 JSON 数据结构

### 单个服务商 JSON 文件结构

```json
{
  "name": "智谱AI",
  "url": "https://bigmodel.cn/glm-coding",
  "plans": [
    {
      "name": "GLM Coding Lite",
      "price": {
        "firstBuy": 20,
        "firstRenew": 40,
        "regular": 40,
        "extraInfo": "首购首月¥20，次月起¥40/月"
      },
      "limits": {
        "per5hours": 120,
        "perWeek": null,
        "perMonth": null
      }
    }
  ],
  "models": [
    {
      "name": "GLM-4.7",
      "info": {
        "contextWindow": 128000,
        "modalities": ["text", "image"],
        "thinking": true,
        "maxThinkingLength": 32000,
        "sweBench": 45.2,
        "liveCodeBench": 38.5,
        "parameters": "32B"
      }
    }
  ]
}
```

### 字段说明

**服务商级别字段：**
- `name`: 服务商名称
- `url`: 官网链接
- `plans`: 套餐数组
- `models`: 支持的模型数组（包含详细信息）

**Plan 级别字段：**
- `name`: 套餐名称
- `price`: 价格对象
  - `firstBuy`: 首次购买价格
  - `firstRenew`: 首次续费价格
  - `regular`: 常规价格
  - `extraInfo`: 额外价格说明
- `limits`: 限额对象
  - `per5hours`: 每5小时请求数
  - `perWeek`: 每周请求数
  - `perMonth`: 每月请求数

**Model Info 字段：**
- `name`: 模型名称
- `info`: 模型详细信息对象
  - `contextWindow`: 上下文窗口大小 (tokens)
  - `modalities`: 支持模态 (text, image, audio, video)
  - `thinking`: 是否支持思维链
  - `maxThinkingLength`: 最大思维链长度
  - `sweBench`: SWE-bench 分数
  - `liveCodeBench`: LiveCodeBench 分数
  - `parameters`: 参数量 (如 "32B", "70B")

---

## UI/UX 设计系统 (由 ui-ux-pro-max 生成)

### 设计风格
- **Pattern**: Pricing Page + CTA
- **Style**: Glassmorphism (毛玻璃效果)
- **Keywords**: Frosted glass, transparent, blurred background, layered, vibrant background

### 配色方案
- **Primary**: #171717 (深黑)
- **Secondary**: #404040 (中灰)
- **CTA**: #D4AF37 (金色)
- **Background**: #FFFFFF (白色)
- **Text**: #171717 (深黑)
- **Note**: Minimal black + accent gold

### 字体
- **Font Family**: Plus Jakarta Sans
- **Mood**: friendly, modern, saas, clean, approachable, professional
- **Google Fonts**: https://fonts.google.com/share?selection.family=Plus+Jakarta+Sans:wght@300;400;500;600;700

### 关键效果
- Backdrop blur (10-20px)
- Subtle border (1px solid rgba white 0.2)
- Light reflection
- Z-depth

### 页面结构
1. Hero (pricing headline)
2. Price comparison cards
3. Feature comparison table
4. FAQ section (可选)
5. Final CTA

### 设计注意事项
- 避免过度动画
- 确保对比度 4.5:1
- 所有可点击元素使用 cursor-pointer
- 悬停状态平滑过渡 (150-300ms)
- 响应式: 375px, 768px, 1024px, 1440px

---

## Model Info Popup 设计

### 触发方式
- 鼠标悬停在模型标签上时显示
- 延迟 200ms 显示，避免误触发
- 鼠标移出后 100ms 隐藏

### Popup 内容布局
```
┌─────────────────────────────────────┐
│  Model Name: GLM-4.7                │
├─────────────────────────────────────┤
│  📏 Context Window    │ 128K        │
│  🎯 Modalities        │ Text, Image │
│  🧠 Thinking          │ ✅ Yes      │
│  📊 Max Thinking      │ 32K         │
│  🏆 SWE-bench         │ 45.2%       │
│  💻 LiveCodeBench     │ 38.5%       │
│  ⚙️ Parameters        │ 32B         │
└─────────────────────────────────────┘
```

### 样式
- Glassmorphism 风格 (与整体一致)
- 背景: rgba(255, 255, 255, 0.95) + backdrop-blur
- 边框: 1px solid rgba(0, 0, 0, 0.1)
- 阴影: 0 10px 40px rgba(0, 0, 0, 0.15)
- 圆角: 12px
- 内边距: 16px
- 最大宽度: 280px
- 箭头指向模型标签

### 位置策略
- 默认显示在模型标签上方
- 如果上方空间不足，显示在下方
- 水平居中于模型标签

---

## 实施步骤

### 第一阶段：清理现有代码
1. 删除现有的 `index.html` 文件
2. 删除 `js/` 目录下的所有文件 (`app.js`, `utils.js`, `components.js`)
3. 删除 `css/` 目录下的 `styles.css` 文件

### 第二阶段：创建新的目录结构
```
c:\Projects\aicoding-compare\
├── index.html              # 新的主入口文件
├── css/
│   └── styles.css          # 新的样式文件 (Glassmorphism 风格)
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── data-loader.js      # JSON 数据加载器
│   ├── renderer.js         # 页面渲染器
│   └── model-popup.js      # Model Info Popup 组件
└── data/
    └── dummy.json          # 示例数据文件 (包含 model info)
```

### 第三阶段：创建示例数据文件
创建一个 `data/dummy.json` 作为示例，包含：
- 1 个示例服务商
- 2-3 个示例套餐
- 2-3 个示例模型，每个包含完整的 info 字段

### 第四阶段：创建核心 JavaScript 模块
1. **data-loader.js**: 负责异步加载所有 JSON 数据文件
2. **renderer.js**: 负责渲染页面组件（卡片、对比表格、详情页）
3. **model-popup.js**: Model Info Popup 组件（悬停显示、位置计算、内容渲染）
4. **app.js**: 主应用逻辑，状态管理，事件绑定

### 第五阶段：创建新的 HTML 和 CSS
1. 创建新的 `index.html`，引入模块化的 JS 和 CSS
   - 引入 Plus Jakarta Sans 字体
   - 使用 Glassmorphism 设计风格
2. 创建新的 `styles.css`，实现：
   - 毛玻璃效果卡片
   - 金色 CTA 按钮
   - Model Info Popup 样式
   - 响应式布局
   - 平滑过渡动画

### 第六阶段：功能实现
1. **首页**: 
   - Hero 区域（标题和简介）
   - 服务商卡片网格（Glassmorphism 风格）
   - 模型标签（悬停显示 Model Info Popup）
   - 排序和筛选功能
   
2. **对比页**: 
   - 多选对比功能
   - 特性对比表格
   - 模型对比（支持 Model Info Popup）
   
3. **详情页**: 
   - 单个服务商详细信息
   - 套餐列表展示
   - 模型列表（支持 Model Info Popup）

---

## 技术要点

1. **数据加载**: 使用 `fetch()` 动态加载所有 JSON 文件
2. **模块化**: 使用 ES6 模块 (`import`/`export`)
3. **状态管理**: 简单的应用状态对象管理当前视图、筛选条件等
4. **响应式设计**: 移动端友好的设计
5. **错误处理**: JSON 加载失败时的降级处理
6. **Popup 位置计算**: 动态计算 popup 显示位置，避免超出视口

---

## 预交付检查清单

- [ ] 不使用 emoji 作为图标 (使用 SVG)
- [ ] 所有可点击元素有 cursor-pointer
- [ ] 悬停状态平滑过渡 (150-300ms)
- [ ] 浅色模式文本对比度 4.5:1 以上
- [ ] 键盘导航可见的焦点状态
- [ ] 尊重 prefers-reduced-motion
- [ ] 响应式: 375px, 768px, 1024px, 1440px
- [ ] Model Info Popup 悬停触发正常
- [ ] Popup 位置自适应，不超出视口
- [ ] Popup 内容完整显示所有字段
