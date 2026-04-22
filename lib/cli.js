#!/usr/bin/env node
/**
 * OpenClaw Memory Optimizer CLI
 * CLI interface for the OpenClaw Memory Optimization System
 */

const { MemoryManager } = require('../memory-manager');

// Parse command line arguments
const args = process.argv.slice(2);

async function main() {
  console.log('🦅 OpenClaw Memory Optimizer v1.0.0');
  console.log('=' .repeat(60));
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'init':
        await initialize();
        break;
      
      case 'add':
        if (args.length < 2) {
          console.log('❌ Please provide memory content');
          process.exit(1);
        }
        await addMemory(args.slice(1).join(' '));
        break;
      
      case 'status':
        await showStatus();
        break;
      
      case 'list':
        await listMemories();
        break;
      
      // ========== 全自动整理功能 ==========
      
      case 'consolidate':
        await consolidate();
        break;
      
      case 'consolidate-daily':
        await consolidateDaily();
        break;
      
      case 'consolidate-weekly':
        await consolidateWeekly();
        break;
      
      case 'consolidate-monthly':
        await consolidateMonthly();
        break;
      
      case 'report':
        await generateReport();
        break;
      
      case 'schedule':
        await setupSchedule();
        break;
      
      case 'extract':
        if (args.length < 2) {
          console.log('❌ Please provide a file path');
          process.exit(1);
        }
        await extractFromFile(args[1]);
        break;
      
      case 'metrics':
        await showMetrics();
        break;
      
      case 'repair':
        await repair();
        break;
      
      case 'backup':
        await backup();
        break;
      
      case 'restore':
        if (args.length < 2) {
          console.log('❌ Please provide backup path');
          process.exit(1);
        }
        await restore(args[1]);
        break;
      
      case 'soul':
        await showSoul();
        break;
      
      // ========== 原有命令 ==========
      
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
      
      case '--version':
      case '-v':
        console.log('v1.0.0');
        break;
      
      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// ========== 基础命令实现 ==========

async function initialize() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace',
    autoConsolidate: true,
    autoClassify: true
  });
  
  await manager.initialize();
  
  // 创建 SOUL.md
  await manager.createSoulFile({
    name: 'OpenClaw',
    role: 'Personal Memory Optimization System',
    principles: [
      'Memory is the foundation of intelligence',
      'Organization enables recall',
      'Continuous learning from past experiences',
      'Prioritize critical information',
      'Maintain system health and performance'
    ]
  });
  
  console.log('✅ OpenClaw Memory Optimizer initialized successfully!');
  console.log('📍 Workspace: ./openclaw-workspace');
  console.log('💜 SOUL.md created');
}

async function addMemory(content) {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  await manager.initialize();
  
  // 解析优先级标记
  let priority = 'MEDIUM';
  if (content.startsWith('[CRITICAL]')) {
    priority = 'CRITICAL';
    content = content.replace('[CRITICAL]', '').trim();
  } else if (content.startsWith('[HIGH]')) {
    priority = 'HIGH';
    content = content.replace('[HIGH]', '').trim();
  } else if (content.startsWith('[MEDIUM]')) {
    priority = 'MEDIUM';
    content = content.replace('[MEDIUM]', '').trim();
  } else if (content.startsWith('[LOW]')) {
    priority = 'LOW';
    content = content.replace('[LOW]', '').trim();
  }
  
  await manager.addMemory(content, { priority });
  console.log('✅ Memory added successfully!');
}

async function showStatus() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  const state = await manager.getState();
  
  console.log('📊 Memory System Status:');
  console.log('─'.repeat(40));
  console.log(`  Total Memories: ${state.memories?.total || state.total || 0}`);
  console.log(`  Priority Distribution:`);
  console.log(`    • CRITICAL: ${state.memories?.byPriority?.CRITICAL || 0}`);
  console.log(`    • HIGH:     ${state.memories?.byPriority?.HIGH || 0}`);
  console.log(`    • MEDIUM:   ${state.memories?.byPriority?.MEDIUM || 0}`);
  console.log(`    • LOW:      ${state.memories?.byPriority?.LOW || 0}`);
  console.log(`    • ARCHIVE:  ${state.memories?.byPriority?.ARCHIVE || 0}`);
  console.log('─'.repeat(40));
  console.log(`  Scheduler: ${state.scheduler?.configured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Last Updated: ${state.lastUpdated ? new Date(state.lastUpdated).toLocaleString() : 'N/A'}`);
}

async function listMemories() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  const memories = await manager.getMemories({ limit: 10, sort: 'newest' });
  
  if (memories.length === 0) {
    console.log('📝 No memories found. Add some with: openclaw-memory add "your memory"');
    return;
  }
  
  console.log('📝 Recent Memories:');
  console.log('─'.repeat(60));
  
  memories.forEach((memory, index) => {
    const preview = memory.content.length > 50 
      ? memory.content.substring(0, 50) + '...' 
      : memory.content;
    console.log(`${index + 1}. [${memory.priority}] ${preview}`);
    if (memory.metadata?.insight) {
      const types = memory.metadata.insight.insights.map(i => i.type).join(', ');
      console.log(`   🔍 ${types}`);
    }
  });
}

// ========== 全自动整理功能 ==========

async function consolidate() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  const result = await manager.consolidate();
  console.log('✅ Consolidation complete');
  console.log(JSON.stringify(result, null, 2));
}

async function consolidateDaily() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  console.log('🌅 Running daily consolidation (每日 08:00)...');
  const result = await manager.consolidateDaily();
  console.log('✅ Daily consolidation complete');
  console.log(JSON.stringify(result, null, 2));
}

async function consolidateWeekly() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  console.log('📅 Running weekly consolidation (每周周末)...');
  const result = await manager.consolidateWeekly();
  console.log('✅ Weekly consolidation complete');
  console.log(JSON.stringify(result, null, 2));
}

async function consolidateMonthly() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  console.log('📆 Running monthly consolidation (每月1日)...');
  const result = await manager.consolidateMonthly();
  console.log('✅ Monthly consolidation complete');
  console.log(JSON.stringify(result, null, 2));
}

async function generateReport() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  // 解析报告类型参数
  const typeIndex = args.indexOf('--type');
  const type = typeIndex !== -1 && args[typeIndex + 1] 
    ? args[typeIndex + 1] 
    : 'full';
  
  console.log(`📊 Generating ${type} report...`);
  const report = await manager.generateReport(type);
  console.log(JSON.stringify(report, null, 2));
}

async function setupSchedule() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  // 解析参数
  const onlyDaily = args.includes('--daily');
  const onlyWeekly = args.includes('--weekly');
  const onlyMonthly = args.includes('--monthly');
  
  const config = {
    daily: onlyDaily || (!onlyWeekly && !onlyMonthly),
    weekly: onlyWeekly || (!onlyDaily && !onlyMonthly),
    monthly: onlyMonthly || (!onlyDaily && !onlyWeekly)
  };
  
  const result = await manager.setupAutomation(config);
  
  console.log('✅ Automation setup complete!');
  console.log('');
  console.log('📋 Copy these commands to set up system cron:');
  console.log('');
  console.log('Linux/macOS:');
  console.log('  crontab -e');
  console.log(`  ${result.instructions.linux.daily}`);
  console.log(`  ${result.instructions.linux.weekly}`);
  console.log(`  ${result.instructions.linux.monthly}`);
  console.log('');
  console.log('Windows (PowerShell as Admin):');
  console.log(`  ${result.instructions.windows.daily}`);
  console.log(`  ${result.instructions.windows.weekly}`);
  console.log(`  ${result.instructions.windows.monthly}`);
  console.log('');
  console.log('📄 Full instructions saved to: openclaw-workspace/HEARTBEAT.md');
}

async function extractFromFile(filePath) {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  console.log(`🔍 Extracting insights from: ${filePath}`);
  const result = await manager.extractFromFile(filePath);
  console.log('✅ Extraction complete');
  console.log(JSON.stringify(result, null, 2));
}

async function showMetrics() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  const state = await manager.getState();
  const storage = await manager.getStorageStats();
  const memories = await manager.getMemories({ limit: 1000 });
  
  // 计算洞察统计
  const insightsCount = memories.filter(m => m.metadata?.insight).length;
  const avgInsights = memories.length > 0 ? (insightsCount / memories.length * 100).toFixed(1) : 0;
  
  console.log('📈 System Metrics:');
  console.log('─'.repeat(40));
  console.log(`  Total Memories:      ${memories.length}`);
  console.log(`  Insights Extracted: ${insightsCount} (${avgInsights}%)`);
  console.log(`  Storage Used:        ${storage.totalSizeFormatted}`);
  console.log(`  Total Files:         ${storage.totalFiles}`);
  console.log('─'.repeat(40));
  
  // 洞察类型分布
  const insightTypes = {};
  memories.forEach(m => {
    if (m.metadata?.insight?.insights) {
      m.metadata.insight.insights.forEach(i => {
        insightTypes[i.type] = (insightTypes[i.type] || 0) + 1;
      });
    }
  });
  
  if (Object.keys(insightTypes).length > 0) {
    console.log('  Insight Type Distribution:');
    Object.entries(insightTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`    • ${type}: ${count}`);
      });
  }
}

async function repair() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  const fix = args.includes('--fix');
  
  console.log('🔧 Running system repair...');
  console.log(`  Auto-fix: ${fix ? 'Enabled' : 'Disabled (use --fix to enable)'}`);
  
  const result = await manager.repair(fix);
  
  console.log(`✅ Checked ${result.checked} files`);
  
  if (result.issues.length > 0) {
    console.log('  Issues found:');
    result.issues.forEach(issue => {
      console.log(`    ❌ ${issue.file}: ${issue.issue}`);
    });
  } else {
    console.log('  ✅ No issues found');
  }
  
  if (result.fixes.length > 0) {
    console.log('  Fixes applied:');
    result.fixes.forEach(fix => {
      console.log(`    ✅ ${fix.file}: ${fix.fix}`);
    });
  }
}

async function backup() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  // 解析备份路径参数
  const pathIndex = args.indexOf('--path');
  const backupPath = pathIndex !== -1 && args[pathIndex + 1] 
    ? args[pathIndex + 1] 
    : null;
  
  console.log('💾 Creating backup...');
  const result = await manager.createBackup(backupPath);
  
  if (result.success) {
    console.log(`✅ Backup created: ${result.path}`);
  } else {
    console.log(`❌ Backup failed: ${result.error}`);
    process.exit(1);
  }
}

async function restore(backupPath) {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  console.log(`♻️  Restoring from: ${backupPath}`);
  
  const result = await manager.restoreBackup(backupPath);
  
  if (result.success) {
    console.log(`✅ Restore complete from: ${result.restoredFrom}`);
    console.log('   Pre-restore backup created in case of issues');
  } else {
    console.log(`❌ Restore failed: ${result.error}`);
    process.exit(1);
  }
}

async function showSoul() {
  const manager = new MemoryManager({
    rootDir: './openclaw-workspace'
  });
  
  const soul = await manager.getSoulContent();
  
  if (!soul.exists) {
    console.log('💜 SOUL.md not found. Creating...');
    await manager.createSoulFile();
    console.log('✅ SOUL.md created. Edit it to define your memory identity.');
    return;
  }
  
  // 解析参数
  if (args.includes('--view')) {
    console.log(soul.content);
  } else if (args.includes('--edit')) {
    console.log('📝 Edit the SOUL.md file directly at:');
    console.log(`   ${soul.path}`);
  } else {
    // 默认显示前20行
    const lines = soul.content.split('\n').slice(0, 20);
    console.log(lines.join('\n'));
    console.log('');
    console.log('💜 Use "openclaw-memory soul --view" for full content');
    console.log('💜 Use "openclaw-memory soul --edit" to edit');
  }
}

function showHelp() {
  console.log('OpenClaw Memory Optimizer - Command Line Interface');
  console.log('');
  console.log('Usage: openclaw-memory <command> [options]');
  console.log('');
  console.log('🆕 Init & Basic:');
  console.log('  init             Initialize OpenClaw Memory System');
  console.log('  add <content>    Add a new memory item');
  console.log('  status           Show system status and statistics');
  console.log('  list             List recent memories');
  console.log('');
  console.log('🔄 Consolidation (全自动整理):');
  console.log('  consolidate           Run immediate consolidation');
  console.log('  consolidate-daily      Daily consolidation (每日 08:00)');
  console.log('  consolidate-weekly    Weekly report (每周周末)');
  console.log('  consolidate-monthly   Monthly report (每月1日)');
  console.log('  report [--type]       Generate report (daily/weekly/monthly/full)');
  console.log('  schedule              Set up automation (生成 cron 配置)');
  console.log('');
  console.log('🔍 Analysis:');
  console.log('  extract <file>    Extract insights from a file');
  console.log('  metrics           Show system metrics and statistics');
  console.log('');
  console.log('💾 Maintenance:');
  console.log('  repair [--fix]    Repair corrupted files');
  console.log('  backup [--path]   Create backup');
  console.log('  restore <path>    Restore from backup');
  console.log('');
  console.log('💜 SOUL:');
  console.log('  soul [--view]     View SOUL.md content');
  console.log('  soul [--edit]     Edit SOUL.md');
  console.log('');
  console.log('─────────────────────────────────────────────');
  console.log('Examples:');
  console.log('  openclaw-memory init');
  console.log('  openclaw-memory add "[CRITICAL] Review project deadline"');
  console.log('  openclaw-memory consolidate-daily');
  console.log('  openclaw-memory report --type weekly');
  console.log('  openclaw-memory schedule');
  console.log('  openclaw-memory metrics');
  console.log('');
  console.log('Documentation: https://github.com/openclaw/openclaw-memory-optimizer');
}

// Handle errors
main().catch(error => {
  console.error('❌ Fatal Error:', error.message);
  process.exit(1);
});
