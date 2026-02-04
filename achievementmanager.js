/**
 * 成就管理器 - 管理遊戲成就系統
 * 支援成就檢測、解鎖、進度追蹤等功能
 */
class AchievementManager {
    constructor() {
        this.achievements = this.defineAchievements();
        this.unlockedAchievements = new Set();
        this.progress = new Map();
        this.stats = this.initStats();
        this.initialized = false;
        
        // 載入已保存的數據
        this.loadAchievementData();
    }
    
    // 定義所有成就
    defineAchievements() {
        return {
            // 貪食蛇成就
            snake_first_50: {
                id: 'snake_first_50',
                name: '初學者',
                description: '在貪食蛇中獲得50分',
                game: 'snake',
                condition: { type: 'score', value: 50 },
                icon: '🐍',
                rarity: 'common'
            },
            snake_master: {
                id: 'snake_master',
                name: '貪食蛇大師',
                description: '在貪食蛇中獲得500分',
                game: 'snake',
                condition: { type: 'score', value: 500 },
                icon: '👑',
                rarity: 'rare'
            },
            snake_legend: {
                id: 'snake_legend',
                name: '貪食蛇傳奇',
                description: '在貪食蛇中獲得1000分',
                game: 'snake',
                condition: { type: 'score', value: 1000 },
                icon: '🏆',
                rarity: 'epic'
            },
            
            // Block Blast成就
            blockblast_first_100: {
                id: 'blockblast_first_100',
                name: '方塊新手',
                description: '在Block Blast中獲得100分',
                game: 'block_blast',
                condition: { type: 'score', value: 100 },
                icon: '🧩',
                rarity: 'common'
            },
            blockblast_combo_master: {
                id: 'blockblast_combo_master',
                name: '連鎖大師',
                description: '在Block Blast中一次消除3行/列',
                game: 'block_blast',
                condition: { type: 'combo', value: 3 },
                icon: '⚡',
                rarity: 'rare'
            },
            blockblast_high_score: {
                id: 'blockblast_high_score',
                name: '方塊專家',
                description: '在Block Blast中獲得500分',
                game: 'block_blast',
                condition: { type: 'score', value: 500 },
                icon: '🎯',
                rarity: 'epic'
            },
            
            // 恐龍跑酷成就
            dino_first_100: {
                id: 'dino_first_100',
                name: '跑酷新手',
                description: '在恐龍跑酷中獲得100分',
                game: 'dino_runner',
                condition: { type: 'score', value: 100 },
                icon: '🦖',
                rarity: 'common'
            },
            dino_survivor: {
                id: 'dino_survivor',
                name: '生存專家',
                description: '在恐龍跑酷中存活30秒',
                game: 'dino_runner',
                condition: { type: 'survival_time', value: 30 },
                icon: '⏰',
                rarity: 'rare'
            },
            dino_legend: {
                id: 'dino_legend',
                name: '跑酷傳奇',
                description: '在恐龍跑酷中獲得1000分',
                game: 'dino_runner',
                condition: { type: 'score', value: 1000 },
                icon: '🏃‍♂️',
                rarity: 'epic'
            },
            
            // 跨遊戲成就
            total_games_10: {
                id: 'total_games_10',
                name: '遊戲愛好者',
                description: '總共玩10次遊戲',
                game: 'all',
                condition: { type: 'total_games', value: 10 },
                icon: '🎮',
                rarity: 'common'
            },
            total_score_5000: {
                id: 'total_score_5000',
                name: '分數收藏家',
                description: '總分數超過5000',
                game: 'all',
                condition: { type: 'total_score', value: 5000 },
                icon: '💎',
                rarity: 'rare'
            },
            consecutive_days_7: {
                id: 'consecutive_days_7',
                name: '忠實玩家',
                description: '連續7天遊玩',
                game: 'all',
                condition: { type: 'consecutive_days', value: 7 },
                icon: '📅',
                rarity: 'epic'
            }
        };
    }
    
    // 初始化統計數據
    initStats() {
        return {
            totalGamesPlayed: 0,
            totalScore: 0,
            lastPlayDate: null,
            consecutiveDays: 0,
            gamesByType: {
                snake: 0,
                block_blast: 0,
                dino_runner: 0
            }
        };
    }
    
    // 載入成就數據
    loadAchievementData() {
        try {
            const saved = localStorage.getItem('game_achievements');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedAchievements = new Set(data.unlocked || []);
                this.progress = new Map(data.progress || []);
                this.stats = { ...this.stats, ...data.stats };
            }
        } catch (error) {
            console.error('載入成就數據失敗:', error);
        }
    }
    
    // 保存成就數據
    saveAchievementData() {
        try {
            const data = {
                unlocked: Array.from(this.unlockedAchievements),
                progress: Array.from(this.progress.entries()),
                stats: this.stats
            };
            localStorage.setItem('game_achievements', JSON.stringify(data));
        } catch (error) {
            console.error('保存成就數據失敗:', error);
        }
    }
    
    // 檢查成就
    checkAchievements(gameName, gameData) {
        const newlyUnlocked = [];
        
        // 更新統計數據
        this.updateStats(gameName, gameData);
        
        // 檢查每個成就
        for (const [achievementId, achievement] of Object.entries(this.achievements)) {
            // 跳過已解鎖的成就
            if (this.unlockedAchievements.has(achievementId)) continue;
            
            // 檢查成就適用性
            if (achievement.game !== 'all' && achievement.game !== gameName) continue;
            
            // 檢查成就條件
            if (this.checkAchievementCondition(achievement, gameData)) {
                this.unlockAchievement(achievementId);
                newlyUnlocked.push(achievement);
            }
        }
        
        // 保存數據
        this.saveAchievementData();
        
        // 顯示新解鎖的成就
        if (newlyUnlocked.length > 0) {
            this.showAchievementNotifications(newlyUnlocked);
        }
        
        return newlyUnlocked;
    }
    
    // 檢查單個成就條件
    checkAchievementCondition(achievement, gameData) {
        const { condition } = achievement;
        
        switch (condition.type) {
            case 'score':
                return gameData.score >= condition.value;
                
            case 'combo':
                return gameData.combo >= condition.value;
                
            case 'survival_time':
                return gameData.survivalTime >= condition.value;
                
            case 'total_games':
                return this.stats.totalGamesPlayed >= condition.value;
                
            case 'total_score':
                return this.stats.totalScore >= condition.value;
                
            case 'consecutive_days':
                return this.stats.consecutiveDays >= condition.value;
                
            default:
                return false;
        }
    }
    
    // 解鎖成就
    unlockAchievement(achievementId) {
        this.unlockedAchievements.add(achievementId);
        console.log(`成就解鎖: ${this.achievements[achievementId].name}`);
        
        // 播放成就音效
        if (window.enhancedSoundManager) {
            window.enhancedSoundManager.playSound('achievement');
        }
    }
    
    // 更新統計數據
    updateStats(gameName, gameData) {
        const today = new Date().toDateString();
        const lastPlayDate = this.stats.lastPlayDate ? new Date(this.stats.lastPlayDate).toDateString() : null;
        
        // 更新連續遊玩天數
        if (lastPlayDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastPlayDate === yesterday.toDateString()) {
                this.stats.consecutiveDays++;
            } else {
                this.stats.consecutiveDays = 1;
            }
        }
        
        // 更新其他統計
        this.stats.totalGamesPlayed++;
        this.stats.totalScore += gameData.score || 0;
        this.stats.lastPlayDate = new Date().toISOString();
        this.stats.gamesByType[gameName] = (this.stats.gamesByType[gameName] || 0) + 1;
    }
    
    // 顯示成就通知
    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.createAchievementNotification(achievement);
            }, index * 1000); // 每個通知間隔1秒
        });
    }
    
    // 創建成就通知UI
    createAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">成就解鎖!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
            <div class="achievement-rarity ${achievement.rarity}">${this.getRarityText(achievement.rarity)}</div>
        `;
        
        // 添加樣式
        this.addAchievementStyles();
        
        // 顯示通知
        document.body.appendChild(notification);
        
        // 自動移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // 點擊關閉
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
    
    // 添加成就通知樣式
    addAchievementStyles() {
        if (document.getElementById('achievement-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'achievement-styles';
        style.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 350px;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: achievementSlide 0.5s ease-out;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .achievement-notification:hover {
                transform: translateX(-10px);
            }
            
            .achievement-icon {
                font-size: 2.5rem;
                min-width: 50px;
                text-align: center;
            }
            
            .achievement-content {
                flex: 1;
            }
            
            .achievement-title {
                font-size: 0.9rem;
                opacity: 0.9;
                margin-bottom: 5px;
            }
            
            .achievement-name {
                font-size: 1.2rem;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .achievement-description {
                font-size: 0.85rem;
                opacity: 0.8;
                line-height: 1.3;
            }
            
            .achievement-rarity {
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .achievement-rarity.common {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .achievement-rarity.rare {
                background: rgba(59, 130, 246, 0.5);
            }
            
            .achievement-rarity.epic {
                background: rgba(168, 85, 247, 0.5);
            }
            
            @keyframes achievementSlide {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 獲取稀有度文字
    getRarityText(rarity) {
        const rarityMap = {
            common: '普通',
            rare: '稀有',
            epic: '史詩'
        };
        return rarityMap[rarity] || '普通';
    }
    
    // 獲取成就列表
    getAchievements(gameFilter = 'all') {
        const achievements = [];
        
        for (const [id, achievement] of Object.entries(this.achievements)) {
            if (gameFilter !== 'all' && achievement.game !== 'all' && achievement.game !== gameFilter) {
                continue;
            }
            
            achievements.push({
                ...achievement,
                unlocked: this.unlockedAchievements.has(id),
                progress: this.getAchievementProgress(id)
            });
        }
        
        return achievements;
    }
    
    // 獲取成就進度
    getAchievementProgress(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return 0;
        
        if (this.unlockedAchievements.has(achievementId)) {
            return 100;
        }
        
        // 根據成就類型計算進度
        const { condition } = achievement;
        let current = 0;
        
        switch (condition.type) {
            case 'total_games':
                current = this.stats.totalGamesPlayed;
                break;
            case 'total_score':
                current = this.stats.totalScore;
                break;
            case 'consecutive_days':
                current = this.stats.consecutiveDays;
                break;
            default:
                // 其他類型的進度需要遊戲數據支持
                current = 0;
        }
        
        return Math.min(100, Math.floor((current / condition.value) * 100));
    }
    
    // 獲取統計數據
    getStats() {
        return {
            ...this.stats,
            totalAchievements: Object.keys(this.achievements).length,
            unlockedAchievements: this.unlockedAchievements.size,
            completionRate: Math.floor((this.unlockedAchievements.size / Object.keys(this.achievements).length) * 100)
        };
    }
}

// 創建全局成就管理器實例
const achievementManager = new AchievementManager();

// 導出供其他腳本使用
if (typeof window !== 'undefined') {
    window.achievementManager = achievementManager;
    console.log('成就管理器已載入，可用成就:', Object.keys(achievementManager.achievements).length);
}
