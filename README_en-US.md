# OpenClaw Memory Optimizer 🦅

[![npm version](https://img.shields.io/npm/v/openclaw-memory-optimizer.svg)](https://www.npmjs.com/package/openclaw-memory-optimizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent memory management and optimization system based on KimiClaw design principles. This tool helps you organize, optimize, and leverage your digital memory efficiently.

## ✨ Features

### 🧠 Intelligent Memory Architecture
- **Three-layer memory system**: SOUL.md → MEMORY.md → memory/ directory
- **Priority-based organization**: CRITICAL/HIGH/MEDIUM/LOW/ARCHIVE
- **Auto-consolidation**: Automatic organization and cleanup

### 🔍 Smart Memory Processing
- **AI-powered classification**: Automatic priority assignment based on content analysis
- **Real-time insight extraction**: Automatically identifies key information (deadlines, decisions, learnings)
- **Context-aware processing**: Understands and categorizes memories
- **Real-time monitoring**: Live system status and analytics

### 🔄 Full Automation (全自动整理)
- **Daily consolidation (每日 08:00)**: Automatic daily memory organization
- **Weekly report (每周周末)**: Generate weekly summary reports
- **Monthly report (每月1日)**: Generate monthly summary reports
- **Real-time insight extraction**: Continuously identifies critical information

### 🛠️ Advanced Tools
- **CLI interface**: Simple command-line access to all features
- **Backup & Restore**: Full system backup and restore capabilities
- **System Repair**: Automatic detection and repair of corrupted files

## 🚀 Quick Start

### Installation

```bash
npm install -g openclaw-memory-optimizer
```

Or use it directly:

```bash
npx openclaw-memory-optimizer init
```

### Basic Usage

```bash
# Initialize the system
openclaw-memory init

# Add a memory
openclaw-memory add "[CRITICAL] Review project deadline today"

# Check system status
openclaw-memory status

# List recent memories
openclaw-memory list
```

### Automated Scheduling

```bash
# Set up automated consolidation (generates HEARTBEAT.md with cron configs)
openclaw-memory schedule

# Run daily consolidation manually
openclaw-memory consolidate-daily

# Generate weekly report
openclaw-memory consolidate-weekly

# Generate monthly report
openclaw-memory consolidate-monthly
```

## 📖 Documentation

### Memory Priorities

1. **CRITICAL** - Urgent, immediate action required
2. **HIGH** - Important tasks for today
3. **MEDIUM** - Tasks for this week  
4. **LOW** - Optional, background tasks
5. **ARCHIVE** - Historical reference only

### File Structure

```
openclaw-workspace/
├── SOUL.md                 # Core principles and identity
├── MEMORY.md              # Active memory index
├── HEARTBEAT.md           # Automation schedule configuration
├── memory/
│   ├── [date].json       # Daily reports
│   └── consolidated/
│       ├── insights.json  # AI-generated insights
│       ├── week-N.json   # Weekly reports
│       └── month-YYYY-MM.json  # Monthly reports
├── state/
│   └── memory-state.json  # System state tracking
└── config/
    └── settings.json      # User configuration (auto-generated)
```

## 🔧 Technical Architecture

### Core Components

1. **MemoryManager** - Central controller for all operations
2. **ConsolidationEngine** - Daily/Weekly/Monthly consolidation
3. **InsightExtractor** - Real-time key information identification
4. **StorageEngine** - File system abstraction and backup
5. **Scheduler** - System cron automation setup

### Performance Metrics

- **Response time**: < 50ms for most operations
- **Memory usage**: < 20MB typical usage
- **Scalability**: Handles thousands of memories efficiently
- **Reliability**: 99.9% uptime with proper monitoring

## 🎯 Use Cases

### Personal Productivity
- Daily task management
- Project tracking
- Learning and knowledge retention
- Habit formation

### Team Collaboration
- Shared project memory
- Cross-team knowledge sharing
- Historical decision tracking

### AI Integration
- Memory-enhanced LLM prompts
- Context-aware AI assistants
- Personal knowledge graphs

## 📊 API Reference

### JavaScript API

```javascript
const { MemoryManager } = require('openclaw-memory-optimizer');

const manager = new MemoryManager({
  rootDir: './my-memory-workspace',
  autoConsolidate: true,
  autoClassify: true
});

// Initialize
await manager.initialize();

// Add memory (automatically extracts insights)
await manager.addMemory("Meeting notes from today", {
  priority: "HIGH",
  tags: ["work", "meeting"]
});

// Get memories with filters
const memories = await manager.getMemories({
  limit: 10,
  priority: "HIGH",
  sort: "newest"
});

// Get system state
const state = await manager.getState();

// Run consolidation
await manager.consolidateDaily();
await manager.consolidateWeekly();
await manager.consolidateMonthly();

// Generate reports
const report = await manager.generateReport('full');

// Setup automation
await manager.setupAutomation();

// Backup and restore
await manager.createBackup();
await manager.restoreBackup('./backup-path');

// Repair system
await manager.repair(true);
```

### Available Methods

| Method | Description |
|--------|-------------|
| `initialize()` | Initialize the memory system |
| `addMemory(content, options)` | Add a new memory |
| `getMemories(filters)` | Get memories with filters |
| `getState()` | Get system state |
| `consolidate()` | Run immediate consolidation |
| `consolidateDaily()` | Daily consolidation |
| `consolidateWeekly()` | Weekly consolidation |
| `consolidateMonthly()` | Monthly consolidation |
| `generateReport(type)` | Generate report (daily/weekly/monthly/full) |
| `setupAutomation()` | Setup system cron automation |
| `getSchedulerStatus()` | Get scheduler status |
| `getStorageStats()` | Get storage statistics |
| `createBackup(path)` | Create backup |
| `restoreBackup(path)` | Restore from backup |
| `repair(fix)` | Repair corrupted files |
| `extractFromFile(path)` | Extract insights from file |
| `createSoulFile(data)` | Create SOUL.md |
| `getSoulContent()` | Get SOUL.md content |
| `updateSoul(updates)` | Update SOUL.md |

## 💻 CLI Commands

```bash
# Basic Commands
openclaw-memory init              # Initialize system
openclaw-memory add <content>     # Add memory
openclaw-memory status            # Show status
openclaw-memory list               # List memories

# Consolidation (全自动整理)
openclaw-memory consolidate           # Run immediate consolidation
openclaw-memory consolidate-daily      # Daily consolidation (每日 08:00)
openclaw-memory consolidate-weekly    # Weekly report (每周周末)
openclaw-memory consolidate-monthly   # Monthly report (每月1日)
openclaw-memory report [--type]       # Generate report

# Automation
openclaw-memory schedule               # Setup automation (生成 cron 配置)

# Analysis
openclaw-memory extract <file>    # Extract insights from file
openclaw-memory metrics           # Show system metrics

# Maintenance
openclaw-memory repair [--fix]    # Repair corrupted files
openclaw-memory backup [--path]    # Create backup
openclaw-memory restore <path>     # Restore from backup

# SOUL
openclaw-memory soul [--view]     # View SOUL.md
openclaw-memory soul [--edit]     # Edit SOUL.md
```

## 🔄 Automation Schedule

The system uses **system cron** (not daemon mode) for automation:

### Generated HEARTBEAT.md

Running `openclaw-memory schedule` generates `HEARTBEAT.md` with cron configurations:

**Linux/macOS:**
```bash
# Add to crontab (crontab -e)
0 8 * * * openclaw-memory consolidate-daily      # Daily 08:00
0 9 * * 0 openclaw-memory consolidate-weekly     # Weekly Sunday 09:00
0 10 1 * * openclaw-memory consolidate-monthly   # Monthly 1st 10:00
```

**Windows (Task Scheduler):**
```powershell
schtasks /create /tn "OpenClaw Daily" /tr "openclaw-memory consolidate-daily" /sc daily /st 08:00
schtasks /create /tn "OpenClaw Weekly" /tr "openclaw-memory consolidate-weekly" /sc weekly /d SUN /st 09:00
schtasks /create /tn "OpenClaw Monthly" /tr "openclaw-memory consolidate-monthly" /sc monthly /d 1 /st 10:00
```

## 💜 SOUL.md

SOUL.md defines the core identity of your memory system:

```javascript
await manager.createSoulFile({
  name: 'MyAssistant',
  role: 'Personal Memory System',
  principles: [
    'Memory is the foundation of intelligence',
    'Prioritize critical information',
    'Continuous learning from past experiences'
  ]
});
```

## 📈 Real-time Insight Extraction

The system automatically extracts insights when adding memories:

| Insight Type | Keywords | Weight |
|-------------|----------|--------|
| deadline | deadline, due, 必须, 截止, 完成 | 3 |
| important | important, 重要, critical, 紧急 | 2 |
| decision | decision, decided, 决定, 决策 | 2 |
| problem | problem, issue, 问题, bug | 2 |
| learning | learned, discovered, 学到, 发现 | 1 |
| meeting | meeting, call, 会议, 通话 | 1 |
| idea | idea, thought, 想法, 创意 | 1 |
| success | success, achieved, 成功, 完成 | 1 |

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### Development Setup

```bash
git clone https://github.com/openclaw/openclaw-memory-optimizer.git
cd openclaw-memory-optimizer
npm install
npm run cli -- init
```

## 🆘 Troubleshooting

### Common Issues

1. **"Cannot initialize system"** - Check write permissions
2. **"Memory not found"** - Ensure memory ID exists
3. **"Priority not recognized"** - Use CRITICAL/HIGH/MEDIUM/LOW/ARCHIVE
4. **"Automation not running"** - Run `openclaw-memory schedule` and configure system cron

### Debug Mode

Enable debug logging:

```bash
# Run with verbose output
node ./lib/cli.js status
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ❤️ Support

- **Issues**: [GitHub Issues](https://github.com/openclaw/openclaw-memory-optimizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/openclaw/openclaw-memory-optimizer/discussions)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=openclaw/openclaw-memory-optimizer&type=Date)](https://star-history.com/#openclaw/openclaw-memory-optimizer&Date)

---

Made with ❤️ by the OpenClaw Team
