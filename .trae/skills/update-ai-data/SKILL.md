---
name: "update-ai-data"
description: "Updates AI coding platform data including benchmark scores, provider plans, and model information. Invoke when user needs to refresh website data, add new providers, update pricing, or sync model benchmarks."
---

# Update AI Data Skill

This skill helps you update the AI coding comparison website data. It handles three main tasks:

## 1. Update Benchmark Scores (config.js)

Update the `GLOBAL_BENCHMARKS` in `js/config.js` with the latest top scores from benchmark websites.

**Benchmarks to track:**
- `sweBench`: SWE-bench (https://www.swebench.com/)
- `liveCodeBench`: LiveCodeBench (https://livecodebench.github.io/)
- `bigCodeBench`: BigCodeBench (https://bigcode-bench.github.io/)
- `humanEval`: HumanEval (OpenAI official)

**Required comment format:**
```javascript
benchmarkName: {
  // 查询时间: YYYY-MM-DD
  // 网页来源: https://...
  // 最高分模型: Model Name - XX%
  max: XX.X,
  unit: '%'
}
```

## 2. Update Provider Data (data/*.json)

For each provider JSON file in `data/` directory (except `models.json`):

**Provider structure:**
```json
{
  "name": "Provider Name",
  "url": "https://provider.com/coding",
  "icon": "code",
  "updatedAt": "2026-03-12",
  "extraInfoUrls": [
    "https://provider.com/pricing",
    "https://provider.com/docs"
  ],
  "plans": [
    {
      "name": "Plan Name",
      "price": {
        "firstBuy": 19,
        "firstRenew": 29,
        "regular": 39,
        "extraInfo": "Pricing details"
      },
      "limits": {
        "per5hours": 100,
        "perWeek": 1000,
        "perMonth": 4000
      }
    }
  ],
  "models": ["model-id-1", "model-id-2"]
}
```

**Steps:**
1. Visit the provider's `url` and `extraInfoUrls`
2. Update `plans` with current pricing and limits
3. Update `models` array with model IDs offered by this provider
4. Update `updatedAt` date

## 3. Update Models Data (data/models.json)

For each model referenced in provider files, ensure it exists in `models.json`:

**Model structure:**
```json
{
  "id": "model-id",
  "name": "Model Display Name",
  "icon": "cpu|zap|rocket",
  "info": {
    "contextWindow": 128000,
    "modalities": ["text", "image"],
    "thinking": true,
    "maxThinkingLength": 16000,
    "sweBench": 42.3,
    "liveCodeBench": 45.8,
    "bigCodeBench": 25.5,
    "humanEval": 78.5,
    "parameters": "32B"
  }
}
```

**Steps:**
1. Collect all unique model IDs from provider files
2. For each model not in `models.json`:
   - Research the model's specifications
   - Fill in all `info` fields
   - Choose appropriate icon (cpu, zap, rocket)
3. Update benchmark scores for existing models if needed

## Workflow

1. **Read current data:**
   - `js/config.js` - check current benchmarks
   - `data/models.json` - check existing models
   - `data/*.json` (except models.json) - check all providers

2. **Update benchmarks:**
   - Visit benchmark websites
   - Update `GLOBAL_BENCHMARKS` in config.js
   - Add comments with query time, source, and top model

3. **Update providers:**
   - For each provider, visit their URLs
   - Update pricing plans and limits
   - Update model list
   - Update `updatedAt` date

4. **Sync models:**
   - Find all model IDs from providers
   - Add missing models to `models.json`
   - Research and fill model specifications

5. **Verify:**
   - Check all model references resolve correctly
   - Ensure no orphaned models or missing references

## Data Sources

**Benchmarks:**
- SWE-bench: https://www.swebench.com/
- LiveCodeBench: https://livecodebench.github.io/
- BigCodeBench: https://bigcode-bench.github.io/
- HumanEval: OpenAI papers and reports

**Model Info:**
- Official provider documentation
- Model cards (Hugging Face, GitHub)
- API documentation
- Technical reports

## File Locations

- Config: `js/config.js`
- Models: `data/models.json`
- Providers: `data/*.json` (auto-scanned, exclude models.json)
