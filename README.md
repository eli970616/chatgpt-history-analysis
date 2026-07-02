# chatgpt-history-analysis

一个 [Cursor](https://cursor.com) Agent Skill：把你自己的 ChatGPT 数据导出，变成一份有证据、有深度的纵向自我分析报告。

全程**本地处理**，原始数据不上传任何地方。

## 它做什么

给它一个 ChatGPT 数据导出文件夹（`conversations-*.json`），它会：

1. 抽取你写过的所有消息，按时间排序、切片成语料；
2. 用多个并行子代理，为每个时间段写一份"田野笔记"（带日期原句证据）；
3. 综合所有笔记，生成 5 份中文报告：
   - `分析报告.md` — 八问深度分析（成长轨迹、重复模式、能量来源、天赋、限制因素、人生主题、十年预测、三件事）
   - `最重要的一件事.md` — 只讲一件你最该明白的事 + 五年分叉
   - `近半年能力增长与自我认知.md` — 增长最快的能力、自评偏差、过期旧故事、复利链
   - `核心增长引擎.md` — 若只能保留一种成长能力该选哪个（含能力因果图）
   - `未来六个月成长路线图.md` — 逐月路线、优先级矩阵、风险、时间预算、预测

## 为什么是 map-reduce

一份半年以上的 ChatGPT 记录，用户消息常常有 ~100 万 token，单次读不完。所以：

```
extract.py → corpus/part-XX.txt（约 11 片）→ N 个并行子代理 → notes/notes-part-XX.md → 主代理综合成 5 份报告
```

"map"（并行读每一片写笔记）解决上下文放不下的问题，"reduce"（主代理只读笔记不读原始语料）解决综合判断的问题。

## 安装

复制到 Cursor 的 skills 目录：

```bash
cp -R chatgpt-history-analysis ~/.cursor/skills/chatgpt-history-analysis
```

## 用法

1. 在 [ChatGPT 设置里导出你的数据](https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data)，解压得到含 `conversations-*.json` 的文件夹。
2. 在 Cursor 里让 agent 用这个 skill 分析该文件夹。
3. 报告会输出到一个以"跑分析的模型"命名的目录（如 `gpt-5.5/`），方便你换不同模型跑，横向对照它们的"第二意见"。

单独跑抽取脚本也可以：

```bash
python3 scripts/extract.py <你的导出文件夹> <输出目录>/corpus
```

## 目录结构

```
chatgpt-history-analysis/
├── SKILL.md                          # skill 主定义 + 流水线说明
├── scripts/
│   └── extract.py                    # 抽取 + 切片脚本（无第三方依赖）
└── references/
    ├── prompts.md                    # 5 份报告的原始 prompt（逐字保留）
    └── field-note-template.md        # 子代理写田野笔记的模板
```

## 隐私

- 原始导出与所有分析产物都留在本地，脚本不联网、不上传。
- 分析产物包含高度私密的个人内容，**不要**把它们提交到公开仓库。本仓库只公开 skill 本身。

## License

MIT
