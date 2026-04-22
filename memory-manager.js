/**
 * OpenClaw Memory Manager
 * Core implementation of the OpenClaw Memory Optimization System
 * Based on KimiClaw design principles
 */

class MemoryManager {
  constructor(config = {}) {
    this.config = {
      rootDir: './openclaw-workspace',
      autoConsolidate: true,
      autoClassify: true,
      encryption: false,
      ...config
    };
    
    this.initialized = false;
    this.memories = [];
    this.state = {
      total: 0,
      byPriority: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        ARCHIVE: 0
      },
      lastUpdated: null,
      stats: {}
    };
  }
  
  /**
   * Initialize the memory system
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('🦅 Initializing OpenClaw Memory Optimizer...');
    
    // Initialize file structure
    await this._initializeFileStructure();
    
    // Load existing state
    await this._loadState();
    
    this.initialized = true;
    this.state.lastUpdated = new Date().toISOString();
    
    console.log('✅ Memory system initialized successfully');
    console.log(`📁 Workspace: ${this.config.rootDir}`);
    
    return this;
  }
  
  /**
   * Add a new memory
   * @param {string} content - Memory content
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The created memory
   */
  async addMemory(content, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const memory = {
      id: this._generateId(),
      content,
      priority: options.priority || 'MEDIUM',
      tags: options.tags || [],
      timestamp: new Date().toISOString(),
      metadata: {
        source: options.source || 'manual',
        processed: false,
        ...options.metadata
      }
    };
    
    // Auto-classify if enabled
    if (this.config.autoClassify) {
      memory.priority = this._autoClassify(content);
    }
    
    // Add to memory collection
    this.memories.push(memory);
    this.state.total++;
    this.state.byPriority[memory.priority]++;
    
    // 实时洞察提取 - 自动识别关键信息
    const insight = this.extractInsightFromMemory(memory);
    if (insight) {
      memory.metadata.insight = insight;
      console.log(`🔍 Insight extracted: ${insight.insights.map(i => i.type).join(', ')}`);
    }
    
    // Update state
    this.state.lastUpdated = new Date().toISOString();
    
    // Auto-consolidate if enabled
    if (this.config.autoConsolidate && this.state.total % 10 === 0) {
      await this._autoConsolidate();
    } else {
      // Save state immediately after adding memory
      await this._saveState();
    }
    
    console.log(`✅ Added memory: [${memory.priority}] ${content.substring(0, 50)}...`);
    return memory;
  }
  
  /**
   * Get memories with filtering
   * @param {Object} filters - Filter criteria
   * @param {string} filters.priority - Filter by priority (CRITICAL/HIGH/MEDIUM/LOW/ARCHIVE)
   * @param {number} filters.limit - Limit number of results
   * @param {string} filters.tag - Filter by tag
   * @param {string} filters.date - Filter by date (YYYY-MM-DD)
   * @param {boolean} filters.hasInsight - Only return memories with insights
   * @param {string} filters.sort - Sort order (newest, oldest, priority)
   * @returns {Promise<Array>} - Filtered memories
   */
  async getMemories(filters = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    let memories = [...this.memories];
    
    // 优先级过滤
    if (filters.priority) {
      memories = memories.filter(m => m.priority === filters.priority);
    }
    
    // 标签过滤
    if (filters.tag) {
      memories = memories.filter(m => m.tags && m.tags.includes(filters.tag));
    }
    
    // 日期过滤
    if (filters.date) {
      memories = memories.filter(m => m.timestamp.startsWith(filters.date));
    }
    
    // 只返回有洞察的记忆
    if (filters.hasInsight) {
      memories = memories.filter(m => m.metadata && m.metadata.insight);
    }
    
    // 排序
    if (filters.sort === 'oldest') {
      memories.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (filters.sort === 'priority') {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, ARCHIVE: 4 };
      memories.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
      // 默认 newest
      memories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    // 限制数量
    if (filters.limit) {
      const limit = parseInt(filters.limit, 10);
      memories = memories.slice(0, limit);
    }
    
    // 支持分页
    if (filters.offset) {
      const offset = parseInt(filters.offset, 10);
      memories = memories.slice(offset);
    }
    
    return memories;
  }
  
  /**
   * Get system state
   * @returns {Promise<Object>} - Current system state
   */
  async getState() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // 计算洞察统计
    const insights = await this._loadInsights();
    
    return {
      initialized: this.initialized,
      uptime: Date.now(),
      rootDir: this.config.rootDir,
      config: {
        autoConsolidate: this.config.autoConsolidate,
        autoClassify: this.config.autoClassify
      },
      memories: {
        total: this.state.total,
        byPriority: { ...this.state.byPriority }
      },
      insights: insights || null,
      lastUpdated: this.state.lastUpdated,
      scheduler: this._getSchedulerStatus()
    };
  }
  
  /**
   * Get scheduler status
   * @private
   */
  _getSchedulerStatus() {
    const fs = require('fs');
    const path = require('path');
    const heartbeatPath = path.join(this.config.rootDir, 'HEARTBEAT.md');
    
    if (fs.existsSync(heartbeatPath)) {
      return {
        configured: true,
        heartbeatFile: heartbeatPath
      };
    }
    return {
      configured: false,
      message: 'Run "openclaw-memory schedule" to set up automation'
    };
  }
  
  /**
   * Load insights from file
   * @private
   */
  async _loadInsights() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const insightsPath = path.join(this.config.rootDir, 'memory/consolidated/insights.json');
      const data = await fs.readFile(insightsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  
  /**
   * Consolidate memories
   * @returns {Promise<Object>} - Consolidation results
   */
  async consolidate() {
    console.log('🔄 Consolidating memories...');
    
    const criticalMemories = this.memories.filter(m => m.priority === 'CRITICAL');
    const insights = this._generateInsights();
    
    // 保存到文件
    await this._saveInsights(insights);
    
    const result = {
      totalMemories: this.state.total,
      consolidatedCount: criticalMemories.length,
      insights,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Consolidated ${criticalMemories.length} critical memories`);
    return result;
  }
  
  /**
   * Daily consolidation - 每日 08:00 自动整理
   * @returns {Promise<Object>} - Daily consolidation results
   */
  async consolidateDaily() {
    console.log('🌅 Running daily consolidation...');
    
    const today = new Date().toISOString().split('T')[0];
    const todayMemories = this.memories.filter(m => 
      m.timestamp.startsWith(today)
    );
    
    // 识别今日关键信息
    const keyInsights = [];
    todayMemories.forEach(memory => {
      const insight = this.extractInsightFromMemory(memory);
      if (insight) {
        keyInsights.push(insight);
      }
    });
    
    // 更新 MEMORY.md
    await this._updateMemoryIndex();
    
    // 保存每日报告
    const result = {
      date: today,
      memoriesProcessed: todayMemories.length,
      keyInsights,
      recommendations: this._generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    await this._saveDailyReport(result);
    
    console.log(`✅ Daily consolidation complete: ${todayMemories.length} memories processed`);
    return result;
  }
  
  /**
   * Weekly consolidation - 每周周末生成周报
   * @returns {Promise<Object>} - Weekly consolidation results
   */
  async consolidateWeekly() {
    console.log('📅 Running weekly consolidation...');
    
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 收集本周记忆
    const weekMemories = this.memories.filter(m => {
      const memDate = new Date(m.timestamp);
      return memDate >= weekStart && memDate <= weekEnd;
    });
    
    // 按优先级分类
    const byPriority = {
      CRITICAL: weekMemories.filter(m => m.priority === 'CRITICAL'),
      HIGH: weekMemories.filter(m => m.priority === 'HIGH'),
      MEDIUM: weekMemories.filter(m => m.priority === 'MEDIUM'),
      LOW: weekMemories.filter(m => m.priority === 'LOW')
    };
    
    // 生成周摘要
    const summary = {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalMemories: weekMemories.length,
      byPriority: {
        CRITICAL: byPriority.CRITICAL.length,
        HIGH: byPriority.HIGH.length,
        MEDIUM: byPriority.MEDIUM.length,
        LOW: byPriority.LOW.length
      },
      topInsights: this._extractTopInsights(weekMemories),
      accomplishments: this._summarizeAccomplishments(weekMemories),
      timestamp: new Date().toISOString()
    };
    
    await this._saveWeeklyReport(summary);
    
    console.log(`📊 Weekly report generated: ${weekMemories.length} memories summarized`);
    return summary;
  }
  
  /**
   * Monthly consolidation - 每月1日生成月报告
   * @returns {Promise<Object>} - Monthly consolidation results
   */
  async consolidateMonthly() {
    console.log('📆 Running monthly consolidation...');
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // 收集本月记忆
    const monthMemories = this.memories.filter(m => {
      const memDate = new Date(m.timestamp);
      return memDate >= monthStart && memDate <= monthEnd;
    });
    
    // 统计
    const stats = {
      totalMemories: monthMemories.length,
      byPriority: {},
      byTag: {},
      dailyAverage: Math.round(monthMemories.length / now.getDate())
    };
    
    // 按优先级统计
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ARCHIVE'].forEach(p => {
      stats.byPriority[p] = monthMemories.filter(m => m.priority === p).length;
    });
    
    // 按标签统计
    monthMemories.forEach(m => {
      (m.tags || []).forEach(tag => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });
    });
    
    // 生成月报告
    const report = {
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      period: {
        start: monthStart.toISOString().split('T')[0],
        end: monthEnd.toISOString().split('T')[0]
      },
      stats,
      topAccomplishments: this._extractTopInsights(monthMemories).slice(0, 10),
      trends: this._analyzeTrends(monthMemories),
      timestamp: new Date().toISOString()
    };
    
    await this._saveMonthlyReport(report);
    
    console.log(`📈 Monthly report generated: ${monthMemories.length} memories analyzed`);
    return report;
  }
  
  /**
   * Extract insight from memory - 实时洞察提取
   * @param {Object} memory - Memory object
   * @returns {Object|null} - Extracted insight
   */
  extractInsightFromMemory(memory) {
    const content = memory.content.toLowerCase();
    const insights = [];
    
    // 检测关键模式
    const patterns = [
      { pattern: /\b(deadline|due|必须|截止|完成)\b/i, type: 'deadline', weight: 3 },
      { pattern: /\b(important|重要|critical|紧急)\b/i, type: 'important', weight: 2 },
      { pattern: /\b(learned|discovered|学到|发现)\b/i, type: 'learning', weight: 1 },
      { pattern: /\b(decision|decided|决定|决策)\b/i, type: 'decision', weight: 2 },
      { pattern: /\b(meeting|call|会议|通话)\b/i, type: 'meeting', weight: 1 },
      { pattern: /\b(idea|thought|想法|创意)\b/i, type: 'idea', weight: 1 },
      { pattern: /\b(problem|issue|问题|bug)\b/i, type: 'problem', weight: 2 },
      { pattern: /\b(success|achieved|成功|完成)\b/i, type: 'success', weight: 1 }
    ];
    
    patterns.forEach(({ pattern, type, weight }) => {
      if (pattern.test(content)) {
        insights.push({ type, weight, matched: memory.content.substring(0, 100) });
      }
    });
    
    if (insights.length > 0) {
      return {
        memoryId: memory.id,
        priority: memory.priority,
        insights,
        summary: memory.content.substring(0, 100),
        timestamp: memory.timestamp
      };
    }
    
    return null;
  }
  
  /**
   * Extract top insights
   * @private
   */
  _extractTopInsights(memories) {
    const allInsights = [];
    memories.forEach(memory => {
      const insight = this.extractInsightFromMemory(memory);
      if (insight) {
        allInsights.push(...insight.insights.map(i => ({
          ...i,
          memoryId: insight.memoryId,
          priority: insight.priority
        })));
      }
    });
    
    // 按权重排序
    return allInsights
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }
  
  /**
   * Summarize accomplishments
   * @private
   */
  _summarizeAccomplishments(memories) {
    const accomplishments = memories.filter(m => 
      /\b(完成|done|achieved|completed|成功|success)\b/i.test(m.content)
    );
    return accomplishments.map(a => a.content.substring(0, 100));
  }
  
  /**
   * Analyze trends
   * @private
   */
  _analyzeTrends(memories) {
    // 简单的趋势分析
    const byDate = {};
    memories.forEach(m => {
      const date = m.timestamp.split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    
    const dates = Object.keys(byDate).sort();
    let trend = 'stable';
    
    if (dates.length >= 2) {
      const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
      const secondHalf = dates.slice(Math.floor(dates.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, d) => sum + byDate[d], 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + byDate[d], 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.2) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.8) trend = 'decreasing';
    }
    
    return { byDate, trend };
  }
  
  /**
   * Save insights to file
   * @private
   */
  async _saveInsights(insights) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const insightsPath = path.join(this.config.rootDir, 'memory/consolidated/insights.json');
      await fs.writeFile(insightsPath, JSON.stringify(insights, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving insights:', error.message);
    }
  }
  
  /**
   * Update MEMORY.md index
   * @private
   */
  async _updateMemoryIndex() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const indexPath = path.join(this.config.rootDir, 'MEMORY.md');
      
      let content = '# OpenClaw Memory Index\n\n';
      content += `Last updated: ${new Date().toLocaleString()}\n\n`;
      
      ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(priority => {
        const items = this.memories
          .filter(m => m.priority === priority)
          .slice(-10)
          .map(m => `- [${m.priority}] ${m.content.substring(0, 60)}...`);
        
        if (items.length > 0) {
          content += `## ${priority}\n${items.join('\n')}\n\n`;
        }
      });
      
      await fs.writeFile(indexPath, content, 'utf-8');
    } catch (error) {
      console.error('❌ Error updating MEMORY.md:', error.message);
    }
  }
  
  /**
   * Save daily report
   * @private
   */
  async _saveDailyReport(report) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const today = new Date().toISOString().split('T')[0];
      const reportPath = path.join(this.config.rootDir, 'memory', today + '.json');
      
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving daily report:', error.message);
    }
  }
  
  /**
   * Save weekly report
   * @private
   */
  async _saveWeeklyReport(summary) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const weekNum = this._getWeekNumber(new Date());
      const reportPath = path.join(this.config.rootDir, 'memory/consolidated/week-' + weekNum + '.json');
      
      await fs.writeFile(reportPath, JSON.stringify(summary, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving weekly report:', error.message);
    }
  }
  
  /**
   * Save monthly report
   * @private
   */
  async _saveMonthlyReport(report) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const now = new Date();
      const reportPath = path.join(this.config.rootDir, 'memory/consolidated/month-' + 
        now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '.json');
      
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving monthly report:', error.message);
    }
  }
  
  /**
   * Get week number
   * @private
   */
  _getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
  
  /**
   * Setup automation - 设置自动化定时任务
   * @param {Object} options - Schedule options
   * @returns {Promise<Object>} - Setup result
   */
  async setupAutomation(options = {}) {
    console.log('⏰ Setting up automation...');
    
    const config = {
      daily: options.daily !== false,
      weekly: options.weekly !== false,
      monthly: options.monthly !== false
    };
    
    // 生成 HEARTBEAT.md
    await this.createHeartbeatFile(config);
    
    return {
      configured: true,
      config,
      instructions: this._getAutomationInstructions(config),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Create HEARTBEAT.md - 生成心跳文件
   * @param {Object} config - Automation config
   * @returns {Promise<void>}
   */
  async createHeartbeatFile(config = {}) {
    const fs = require('fs').promises;
    const path = require('path');
    const heartbeatPath = path.join(this.config.rootDir, 'HEARTBEAT.md');
    
    const content = this._generateHeartbeatContent(config);
    await fs.writeFile(heartbeatPath, content, 'utf-8');
    
    console.log(`📝 HEARTBEAT.md created at: ${heartbeatPath}`);
  }
  
  /**
   * Generate HEARTBEAT.md content
   * @private
   */
  _generateHeartbeatContent(config) {
    let content = `# OpenClaw Heartbeat - Automation Schedule

Generated at: ${new Date().toISOString()}
Workspace: ${this.config.rootDir}

## 🕐 Automation Schedule

`;
    
    if (config.daily !== false) {
      content += `### Daily Consolidation (每日 08:00)
\`\`\`bash
# Linux/macOS - Add to crontab:
crontab -e
# Add this line:
0 8 * * * cd ${this.config.rootDir} && openclaw-memory consolidate-daily

# Windows - Use Task Scheduler:
# Create a task that runs daily at 08:00:
schtasks /create /tn "OpenClaw Daily" /tr "openclaw-memory consolidate-daily" /sc daily /st 08:00
\`\`\`

`;
    }
    
    if (config.weekly !== false) {
      content += `### Weekly Report (每周日 09:00)
\`\`\`bash
# Linux/macOS:
0 9 * * 0 cd ${this.config.rootDir} && openclaw-memory consolidate-weekly

# Windows:
schtasks /create /tn "OpenClaw Weekly" /tr "openclaw-memory consolidate-weekly" /sc weekly /d SUN /st 09:00
\`\`\`

`;
    }
    
    if (config.monthly !== false) {
      content += `### Monthly Report (每月1日 10:00)
\`\`\`bash
# Linux/macOS:
0 10 1 * * cd ${this.config.rootDir} && openclaw-memory consolidate-monthly

# Windows:
schtasks /create /tn "OpenClaw Monthly" /tr "openclaw-memory consolidate-monthly" /sc monthly /d 1 /st 10:00
\`\`\`

`;
    }
    
    content += `## 📋 Manual Commands

| Command | Description |
|---------|-------------|
| \`openclaw-memory consolidate\` | Run immediate consolidation |
| \`openclaw-memory consolidate-daily\` | Run daily consolidation |
| \`openclaw-memory consolidate-weekly\` | Generate weekly report |
| \`openclaw-memory consolidate-monthly\` | Generate monthly report |
| \`openclaw-memory report\` | View latest reports |
| \`openclaw-memory schedule\` | Regenerate this file |

## 🔧 Troubleshooting

If automation is not running:
1. Verify cron/crontab is installed and running
2. Check that openclaw-memory is in your PATH
3. Test manually: \`openclaw-memory status\`
4. Check logs in memory/ directory

---
*This file is auto-generated by OpenClaw Memory Optimizer*
`;
    
    return content;
  }
  
  /**
   * Get automation instructions
   * @private
   */
  _getAutomationInstructions(config) {
    return {
      linux: {
        daily: '0 8 * * * cd ' + this.config.rootDir + ' && openclaw-memory consolidate-daily',
        weekly: '0 9 * * 0 cd ' + this.config.rootDir + ' && openclaw-memory consolidate-weekly',
        monthly: '0 10 1 * * cd ' + this.config.rootDir + ' && openclaw-memory consolidate-monthly'
      },
      windows: {
        daily: 'schtasks /create /tn "OpenClaw Daily" /tr "openclaw-memory consolidate-daily" /sc daily /st 08:00',
        weekly: 'schtasks /create /tn "OpenClaw Weekly" /tr "openclaw-memory consolidate-weekly" /sc weekly /d SUN /st 09:00',
        monthly: 'schtasks /create /tn "OpenClaw Monthly" /tr "openclaw-memory consolidate-monthly" /sc monthly /d 1 /st 10:00'
      }
    };
  }
  
  /**
   * Get scheduler status
   * @returns {Object} - Current scheduler status
   */
  async getSchedulerStatus() {
    const fs = require('fs');
    const path = require('path');
    const heartbeatPath = path.join(this.config.rootDir, 'HEARTBEAT.md');
    
    if (fs.existsSync(heartbeatPath)) {
      const stats = fs.statSync(heartbeatPath);
      return {
        configured: true,
        heartbeatFile: heartbeatPath,
        created: stats.mtime.toISOString()
      };
    }
    
    return {
      configured: false,
      message: 'Run "openclaw-memory schedule" to set up automation'
    };
  }
  
  /**
   * Get storage statistics
   * @returns {Promise<Object>} - Storage stats
   */
  async getStorageStats() {
    const fs = require('fs').promises;
    const path = require('path');
    
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      byDirectory: {}
    };
    
    const walkDir = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            stats.byDirectory[fullPath] = { files: 0, size: 0 };
            await walkDir(fullPath);
          } else {
            const fileStats = await fs.stat(fullPath);
            stats.totalFiles++;
            stats.totalSize += fileStats.size;
            const parentDir = path.dirname(fullPath);
            if (stats.byDirectory[parentDir]) {
              stats.byDirectory[parentDir].files++;
              stats.byDirectory[parentDir].size += fileStats.size;
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    };
    
    await walkDir(this.config.rootDir);
    stats.totalSizeFormatted = this.formatBytes(stats.totalSize);
    
    return stats;
  }
  
  /**
   * Format bytes to human readable
   * @param {number} bytes - Bytes
   * @returns {string} - Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // ========== SOUL.md 相关功能 ==========
  
  /**
   * Create SOUL.md file
   * @param {Object} soulData - Soul data
   * @returns {Promise<void>}
   */
  async createSoulFile(soulData = {}) {
    const fs = require('fs').promises;
    const path = require('path');
    const soulPath = path.join(this.config.rootDir, 'SOUL.md');
    
    const content = this.generateSoulTemplate(soulData);
    await fs.writeFile(soulPath, content, 'utf-8');
    console.log(`💜 SOUL.md created at: ${soulPath}`);
  }
  
  /**
   * Generate SOUL.md template
   * @param {Object} data - Soul data
   * @returns {string} - Template content
   */
  generateSoulTemplate(data = {}) {
    return `# OpenClaw SOUL

> This file defines the core identity, principles, and purpose of your memory system.

## Core Identity

**Name**: ${data.name || 'OpenClaw'}
**Role**: ${data.role || 'Memory Optimization System'}
**Version**: ${data.version || '1.0.0'}

## Core Principles

${(data.principles || [
  '1. Memory is the foundation of intelligence',
  '2. Organization enables recall',
  '3. Continuous learning from past experiences',
  '4. Prioritize critical information',
  '5. Maintain system health and performance'
]).map(p => `- ${p}`).join('\n')}

## Goals

${(data.goals || [
  'Organize and optimize memory storage',
  'Enable fast and accurate information retrieval',
  'Generate actionable insights',
  'Support continuous improvement'
]).map((g, i) => `${i + 1}. ${g}`).join('\n')}

## Working Style

${data.workingStyle || `
- **Approach**: Systematic and organized
- **Communication**: Clear and concise
- **Decision Making**: Data-driven insights
- **Adaptability**: Continuous learning and improvement
`}

## Memory Preferences

- **Priority Focus**: ${data.priorityFocus || 'CRITICAL and HIGH priority items'}
- **Retention**: ${data.retention || '365 days for important memories'}
- **Auto-archive**: ${data.autoArchive !== false ? 'Enabled' : 'Disabled'}
- **Insight Generation**: ${data.insightGeneration || 'Daily'}

## Key Learnings

${data.keyLearnings || '> Add your key learnings and insights here over time.'}

---

*Last updated: ${new Date().toISOString()}*
`;
  }
  
  /**
   * Get SOUL.md content
   * @returns {Promise<Object>} - Soul content
   */
  async getSoulContent() {
    const fs = require('fs').promises;
    const path = require('path');
    const soulPath = path.join(this.config.rootDir, 'SOUL.md');
    
    try {
      const content = await fs.readFile(soulPath, 'utf-8');
      return { exists: true, content, path: soulPath };
    } catch {
      return { exists: false, path: soulPath };
    }
  }
  
  /**
   * Update SOUL.md
   * @param {Object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async updateSoul(updates) {
    const soul = await this.getSoulContent();
    if (!soul.exists) {
      await this.createSoulFile(updates);
      return;
    }
    
    const fs = require('fs').promises;
    const soulPath = soul.path;
    
    // 简单更新：追加到 Key Learnings 部分
    let content = soul.content;
    if (updates.learning) {
      const timestamp = new Date().toISOString().split('T')[0];
      content += `\n\n### ${timestamp}\n${updates.learning}`;
    }
    
    content += `\n\n---\n*Last updated: ${new Date().toISOString()}*`;
    
    await fs.writeFile(soulPath, content, 'utf-8');
  }
  
  // ========== 备份和恢复功能 ==========
  
  /**
   * Create backup
   * @param {string} backupPath - Backup destination path
   * @returns {Promise<Object>} - Backup result
   */
  async createBackup(backupPath = null) {
    const fs = require('fs').promises;
    const path = require('path');
    
    if (!backupPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = path.join(this.config.rootDir, '..', `openclaw-backup-${timestamp}.zip`);
    }
    
    try {
      // 使用 adm-zip 创建备份
      const AdmZip = require('adm-zip');
      const zip = new AdmZip();
      
      // 添加所有文件
      await this._addDirToZip(zip, this.config.rootDir);
      
      // 保存备份
      const { execSync } = require('child_process');
      
      // 简单实现：复制文件到备份目录
      const backupDir = path.dirname(backupPath);
      const backupName = path.basename(backupPath, '.zip');
      const actualBackupPath = path.join(backupDir, backupName);
      
      await fs.mkdir(actualBackupPath, { recursive: true });
      await this._copyDir(this.config.rootDir, actualBackupPath);
      
      return {
        success: true,
        path: actualBackupPath,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Restore from backup
   * @param {string} backupPath - Backup path to restore
   * @returns {Promise<Object>} - Restore result
   */
  async restoreBackup(backupPath) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // 备份当前状态
      await this.createBackup(path.join(this.config.rootDir, '..', 'pre-restore-backup'));
      
      // 恢复文件
      await this._copyDir(backupPath, this.config.rootDir);
      
      // 重新加载状态
      await this._loadState();
      
      return {
        success: true,
        restoredFrom: backupPath,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Copy directory recursively
   * @private
   */
  async _copyDir(src, dest) {
    const fs = require('fs').promises;
    const path = require('path');
    
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this._copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  
  /**
   * Add directory to zip (placeholder)
   * @private
   */
  async _addDirToZip(zip, dir) {
    // 实际使用 adm-zip 时需要完整实现
  }
  
  // ========== 报告功能 ==========
  
  /**
   * Generate report
   * @param {string} type - Report type: daily, weekly, monthly, full
   * @returns {Promise<Object>} - Report data
   */
  async generateReport(type = 'daily') {
    console.log(`📊 Generating ${type} report...`);
    
    switch (type.toLowerCase()) {
      case 'daily':
        return await this.consolidateDaily();
      case 'weekly':
        return await this.consolidateWeekly();
      case 'monthly':
        return await this.consolidateMonthly();
      case 'full':
        return await this._generateFullReport();
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }
  
  /**
   * Generate full report
   * @private
   */
  async _generateFullReport() {
    const daily = await this.consolidateDaily();
    const weekly = await this.consolidateWeekly();
    const monthly = await this.consolidateMonthly();
    const state = await this.getState();
    const storage = await this.getStorageStats();
    
    return {
      generated: new Date().toISOString(),
      daily,
      weekly,
      monthly,
      systemState: state,
      storage,
      insights: this._generateInsights()
    };
  }
  
  // ========== 修复功能 ==========
  
  /**
   * Repair corrupted files
   * @param {boolean} fix - Whether to auto-fix issues
   * @returns {Promise<Object>} - Repair results
   */
  async repair(fix = false) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const issues = [];
    const fixes = [];
    
    // 检查核心文件
    const requiredFiles = [
      'SOUL.md',
      'MEMORY.md',
      'memory-state.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.config.rootDir, file);
      try {
        await fs.access(filePath);
        // 检查 JSON 文件是否有效
        if (file.endsWith('.json')) {
          try {
            JSON.parse(await fs.readFile(filePath, 'utf-8'));
          } catch {
            issues.push({ file, issue: 'Invalid JSON', path: filePath });
            if (fix) {
              await this._fixJsonFile(filePath);
              fixes.push({ file, fix: 'Reinitialized JSON' });
            }
          }
        }
      } catch {
        issues.push({ file, issue: 'File missing', path: filePath });
        if (fix) {
          await this._initializeFileStructure();
          fixes.push({ file, fix: 'File recreated' });
        }
      }
    }
    
    return {
      checked: requiredFiles.length,
      issues,
      fixes: fix ? fixes : [],
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Fix JSON file
   * @private
   */
  async _fixJsonFile(filePath) {
    const fs = require('fs').promises;
    const path = require('path');
    
    if (path.basename(filePath) === 'memory-state.json') {
      await fs.writeFile(filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    }
  }
  
  // ========== CLI 支持的增强方法 ==========
  
  /**
   * Extract insights from file
   * @param {string} filePath - File path to extract from
   * @returns {Promise<Object>} - Extracted insights
   */
  async extractFromFile(filePath) {
    const fs = require('fs').promises;
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const insights = [];
      
      // 提取关键信息
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.trim()) {
          const memory = {
            id: this._generateId(),
            content: line.trim(),
            priority: this._autoClassify(line),
            timestamp: new Date().toISOString(),
            source: filePath,
            line: index + 1
          };
          
          const insight = this.extractInsightFromMemory(memory);
          if (insight) {
            insights.push(insight);
          }
        }
      });
      
      return {
        file: filePath,
        linesProcessed: lines.length,
        insights,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to extract from file: ${error.message}`);
    }
  }
  
  /**
   * Initialize file structure
   * @private
   */
  async _initializeFileStructure() {
    const fs = require('fs').promises;
    const path = require('path');
    
    const dirs = [
      this.config.rootDir,
      path.join(this.config.rootDir, 'memory'),
      path.join(this.config.rootDir, 'memory/consolidated'),
      path.join(this.config.rootDir, 'state'),
      path.join(this.config.rootDir, 'config')
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
    
    // Create core files only if they don't exist
    const coreFiles = {
      'SOUL.md': '# OpenClaw Core Principles\n\nThis is the soul of your OpenClaw system.\nDefine your core principles, goals, and identity here.\n',
      'MEMORY.md': '# OpenClaw Memory Index\n\nThis file contains active memories and priorities.\nUpdated automatically by the system.\n\n## Active Priorities\n- CRITICAL: []\n- HIGH: []\n- MEDIUM: []\n- LOW: []\n',
      'memory-state.json': JSON.stringify(this.state, null, 2)
    };
    
    for (const [filename, content] of Object.entries(coreFiles)) {
      const filePath = path.join(this.config.rootDir, filename);
      try {
        // Check if file exists before writing
        await fs.access(filePath);
        // File exists, don't overwrite
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(filePath, content, 'utf-8');
      }
    }
  }
  
  /**
   * Load system state
   * @private
   */
  async _loadState() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const statePath = path.join(this.config.rootDir, 'memory-state.json');
      
      const data = await fs.readFile(statePath, 'utf-8');
      const loadedState = JSON.parse(data);
      
      // Merge with default state
      this.state = {
        ...this.state,
        ...loadedState
      };
      
      // Load memories array if exists
      if (loadedState.memories && Array.isArray(loadedState.memories)) {
        this.memories = loadedState.memories;
      }
      
      console.log(`📊 Loaded state with ${this.state.total} memories`);
    } catch (error) {
      console.log('⚠️  Starting with fresh state');
    }
  }
  
  /**
   * Save system state
   * @private
   */
  async _saveState() {
    const fs = require('fs').promises;
    const path = require('path');
    const statePath = path.join(this.config.rootDir, 'memory-state.json');
    
    try {
      // Include memories array in saved state
      const stateToSave = {
        ...this.state,
        memories: this.memories
      };
      await fs.writeFile(statePath, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving state:', error.message);
      throw error;
    }
  }
  
  /**
   * Auto-consolidate memories
   * @private
   */
  async _autoConsolidate() {
    try {
      const insight = await this.consolidate();
      const fs = require('fs').promises;
      const path = require('path');
      const insightsPath = path.join(this.config.rootDir, 'memory/consolidated/insights.json');
      
      await fs.writeFile(insightsPath, JSON.stringify(insight, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Auto-consolidate error:', error.message);
    }
  }
  
  /**
   * Auto-classify memory content
   * @private
   */
  _autoClassify(content) {
    // Simple rule-based classification
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('[critical]') || contentLower.includes('urgent') || contentLower.includes('now')) {
      return 'CRITICAL';
    }
    
    if (contentLower.includes('[high]') || contentLower.includes('important') || contentLower.includes('today')) {
      return 'HIGH';
    }
    
    if (contentLower.includes('[medium]')) {
      return 'MEDIUM';
    }
    
    if (contentLower.includes('[low]') || contentLower.includes('optional')) {
      return 'LOW';
    }
    
    return 'MEDIUM'; // Default
  }
  
  /**
   * Generate ID
   * @private
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Generate insights
   * @private
   */
  _generateInsights() {
    const priorities = Object.entries(this.state.byPriority);
    const total = this.state.total;
    
    return {
      priorityDistribution: priorities.map(([priority, count]) => ({
        priority,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      })),
      peakTimes: this._analyzePeakTimes(),
      recommendations: this._generateRecommendations()
    };
  }
  
  /**
   * Analyze peak times
   * @private
   */
  _analyzePeakTimes() {
    // Simple analysis
    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    return {
      period,
      active: this.state.total > 0
    };
  }
  
  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations() {
    const recommendations = [];
    
    if (this.state.byPriority.CRITICAL > 5) {
      recommendations.push('Too many critical items. Consider delegating or rescheduling.');
    }
    
    if (this.state.total === 0) {
      recommendations.push('Start adding memories to build your knowledge base.');
    }
    
    return recommendations.length > 0 ? recommendations : ['System is operating optimally.'];
  }
}

module.exports = { MemoryManager };