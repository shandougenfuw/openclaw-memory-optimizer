# OpenClaw Memory Optimizer 🦅

[![npm version](https://img.shields.io/npm/v/openclaw-memory-optimizer.svg)](https://www.npmjs.com/package/openclaw-memory-optimizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 KimiClaw 设计理念的智能记忆管理与优化系统。帮助您高效地组织、优化和利用您的数字记忆。

## ✨ 功能特性

### 🧠 智能记忆架构
- **三层记忆系统**：SOUL.md → MEMORY.md → memory/ 目录
- **优先级分类**：CRITICAL（紧急）/HIGH（重要）/MEDIUM（一般）/LOW（低优先级）/ARCHIVE（归档）
- **自动整理**：自动组织和清理记忆

### 🔍 智能记忆处理
- **AI 智能分类**：基于内容分析自动分配优先级
- **实时洞察提取**：自动识别关键信息（截止日期、决策、学习内容）
- **上下文感知处理**：理解和分类记忆
- **实时监控**：实时系统状态和数据分析

### 🔄 全自动整理
- **每日整理（每日 08:00）**：自动整理每日记忆
- **周报告（每周周末）**：生成周度总结报告
- **月报告（每月1日）**：生成月度总结报告
- **实时洞察提取**：持续识别关键信息

### 🛠️ 高级工具
- **CLI 界面**：简单易用的命令行工具
- **备份与恢复**：完整的系统备份和恢复功能
- **系统修复**：自动检测和修复损坏的文件

## 🚀 快速开始

### 安装

```bash
npm install -g openclaw-memory-optimizer
```

或直接使用 npx 运行：

```bash
npx openclaw-memory-optimizer init
```

### 基本使用

```bash
# 初始化系统
openclaw-memory init

# 添加记忆
openclaw-memory add "[CRITICAL] 项目截止日期 - 今天必须完成"

# 查看系统状态
openclaw-memory status

# 列出最近的记忆
openclaw-memory list
```

### 自动化调度

```bash
# 设置自动化整理（生成 HEARTBEAT.md 包含 cron 配置）
openclaw-memory schedule

# 手动执行每日整理
openclaw-memory consolidate-daily

# 生成周报告
openclaw-memory consolidate-weekly

# 生成月报告
openclaw-memory consolidate-monthly
```

## 📖 文档

### 记忆优先级

1. **CRITICAL** - 紧急，需要立即处理
2. **HIGH** - 重要，今天需要完成的任务
3. **MEDIUM** - 一般，本周内完成的任务
4. **LOW** - 低优先级，可选的后台任务
5. **ARCHIVE** - 归档，仅供参考的历史记录

### 文件结构

```
openclaw-workspace/
├── SOUL.md                 # 核心原则和身份定义
├── MEMORY.md               # 活跃记忆索引
├── HEARTBEAT.md            # 自动化调度配置
├── memory/
│   ├── [日期].json         # 每日报告
│   └── consolidated/
│       ├── insights.json   # AI 生成的洞察
│       ├── week-N.json     # 周报告
│       └── month-YYYY-MM.json  # 月报告
├── state/
│   └── memory-state.json   # 系统状态追踪
└── config/
    └── settings.json       # 用户配置（自动生成）
```

## 🔧 技术架构

### 核心组件

1. **MemoryManager** - 所有操作的中央控制器
2. **ConsolidationEngine** - 每日/每周/每月整理引擎
3. **InsightExtractor** - 实时关键信息识别
4. **StorageEngine** - 文件系统抽象和备份
5. **Scheduler** - 系统 cron 自动化设置

### 性能指标

- **响应时间**：大多数操作 < 50ms
- **内存占用**：典型使用 < 20MB
- **可扩展性**：高效处理数千条记忆
- **可靠性**：适当监控下 99.9% 运行时间

## 🎯 使用场景

### 个人效率
- 日常任务管理
- 项目进度跟踪
- 学习和知识积累
- 习惯养成

### 团队协作
- 共享项目记忆
- 跨团队知识共享
- 历史决策追踪

### AI 集成
- 增强 LLM 提示的记忆
- 上下文感知的 AI 助手
- 个人知识图谱

## 📊 API 参考

### JavaScript API

```javascript
const { MemoryManager } = require('openclaw-memory-optimizer');

const manager = new MemoryManager({
  rootDir: './my-memory-workspace',
  autoConsolidate: true,
  autoClassify: true
});

// 初始化
await manager.initialize();

// 添加记忆（自动提取洞察）
await manager.addMemory("今天的会议记录", {
  priority: "HIGH",
  tags: ["工作", "会议"]
});

// 带过滤器获取记忆
const memories = await manager.getMemories({
  limit: 10,
  priority: "HIGH",
  sort: "newest"
});

// 获取系统状态
const state = await manager.getState();

// 执行整理
await manager.consolidateDaily();
await manager.consolidateWeekly();
await manager.consolidateMonthly();

// 生成报告
const report = await manager.generateReport('full');

// 设置自动化
await manager.setupAutomation();

// 备份和恢复
await manager.createBackup();
await manager.restoreBackup('./backup-path');

// 修复系统
await manager.repair(true);
```

### 可用方法

| 方法 | 描述 |
|------|------|
| `initialize()` | 初始化记忆系统 |
| `addMemory(content, options)` | 添加新记忆 |
| `getMemories(filters)` | 获取带过滤器的记忆 |
| `getState()` | 获取系统状态 |
| `consolidate()` | 执行立即整理 |
| `consolidateDaily()` | 每日整理 |
| `consolidateWeekly()` | 每周整理 |
| `consolidateMonthly()` | 每月整理 |
| `generateReport(type)` | 生成报告 (daily/weekly/monthly/full) |
| `setupAutomation()` | 设置系统 cron 自动化 |
| `getSchedulerStatus()` | 获取调度器状态 |
| `getStorageStats()` | 获取存储统计 |
| `createBackup(path)` | 创建备份 |
| `restoreBackup(path)` | 从备份恢复 |
| `repair(fix)` | 修复损坏的文件 |
| `extractFromFile(path)` | 从文件提取洞察 |
| `createSoulFile(data)` | 创建 SOUL.md |
| `getSoulContent()` | 获取 SOUL.md 内容 |
| `updateSoul(updates)` | 更新 SOUL.md |

## 💻 CLI 命令

```bash
# 基本命令
openclaw-memory init              # 初始化系统
openclaw-memory add <内容>        # 添加记忆
openclaw-memory status           # 显示状态
openclaw-memory list             # 列出记忆

# 整理命令
openclaw-memory consolidate           # 执行立即整理
openclaw-memory consolidate-daily      # 每日整理（每日 08:00）
openclaw-memory consolidate-weekly    # 周报告（每周周末）
openclaw-memory consolidate-monthly   # 月报告（每月1日）
openclaw-memory report [--type]       # 生成报告

# 自动化
openclaw-memory schedule               # 设置自动化（生成 cron 配置）

# 分析
openclaw-memory extract <文件>    # 从文件提取洞察
openclaw-memory metrics           # 显示系统指标

# 维护
openclaw-memory repair [--fix]    # 修复损坏的文件
openclaw-memory backup [--path]    # 创建备份
openclaw-memory restore <路径>     # 从备份恢复

# SOUL
openclaw-memory soul [--view]     # 查看 SOUL.md
openclaw-memory soul [--edit]     # 编辑 SOUL.md
```

## 🔄 自动化调度

系统使用 **系统 cron**（非守护进程模式）进行自动化：

### 生成的 HEARTBEAT.md

运行 `openclaw-memory schedule` 会生成包含 cron 配置的 `HEARTBEAT.md`：

**Linux/macOS：**
```bash
# 添加到 crontab (crontab -e)
0 8 * * * openclaw-memory consolidate-daily      # 每日 08:00
0 9 * * 0 openclaw-memory consolidate-weekly     # 每周日 09:00
0 10 1 * * openclaw-memory consolidate-monthly   # 每月1日 10:00
```

**Windows（任务计划程序）：**
```powershell
schtasks /create /tn "OpenClaw Daily" /tr "openclaw-memory consolidate-daily" /sc daily /st 08:00
schtasks /create /tn "OpenClaw Weekly" /tr "openclaw-memory consolidate-weekly" /sc weekly /d SUN /st 09:00
schtasks /create /tn "OpenClaw Monthly" /tr "openclaw-memory consolidate-monthly" /sc monthly /d 1 /st 10:00
```

## 💜 SOUL.md

SOUL.md 定义了您记忆系统的核心身份：

```javascript
await manager.createSoulFile({
  name: '我的助手',
  role: '个人记忆系统',
  principles: [
    '记忆是智能的基础',
    '优先处理关键信息',
    '从过去的经验中持续学习'
  ]
});
```

## 📈 实时洞察提取

系统在添加记忆时会自动提取洞察：

| 洞察类型 | 关键词 | 权重 |
|---------|--------|------|
| deadline | deadline, due, 必须, 截止, 完成 | 3 |
| important | important, 重要, critical, 紧急 | 2 |
| decision | decision, decided, 决定, 决策 | 2 |
| problem | problem, issue, 问题, bug | 2 |
| learning | learned, discovered, 学到, 发现 | 1 |
| meeting | meeting, call, 会议, 通话 | 1 |
| idea | idea, thought, 想法, 创意 | 1 |
| success | success, achieved, 成功, 完成 | 1 |

## 🤝 贡献

欢迎贡献！以下是开始的方式：

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 运行测试
5. 提交 Pull Request

### 开发环境设置

```bash
git clone https://github.com/openclaw/openclaw-memory-optimizer.git
cd openclaw-memory-optimizer
npm install
npm run cli -- init
```

## 🆘 故障排除

### 常见问题

1. **"无法初始化系统"** - 检查写权限
2. **"记忆未找到"** - 确认记忆 ID 存在
3. **"优先级无法识别"** - 使用 CRITICAL/HIGH/MEDIUM/LOW/ARCHIVE
4. **"自动化未运行"** - 运行 `openclaw-memory schedule` 并配置系统 cron

### 调试模式

启用调试日志：

```bash
# 运行并输出详细信息
node ./lib/cli.js status
```

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)。

## ❤️ 支持

- **问题反馈**：[GitHub Issues](https://github.com/openclaw/openclaw-memory-optimizer/issues)
- **讨论区**：[GitHub Discussions](https://github.com/openclaw/openclaw-memory-optimizer/discussions)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=openclaw/openclaw-memory-optimizer&type=Date)](https://star-history.com/#openclaw/openclaw-memory-optimizer&Date)

---

由 OpenClaw 团队用 ❤️ 打造
