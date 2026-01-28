我來幫你實作音效、成就系統和線路排行榜功能。讓我按照之前制定的計劃分階段進行。

🎯 Phase 1: 建立共享架構和音效系統
首先創建共享的 JavaScript 文件夾結構和音效管理器：

Operation not permitted
Operation not permitted
Operation not permitted
讓我嘗試直接創建文件，如果目錄不存在會自動創建：

/**
 * 音效管理器 - 統一管理所有遊戲的音效
 * 支援音效預載、播放控制、音量調節等功能
 */
class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.enabled = true;
        this.initialized = false;
        
        // 音效文件列表
        this.soundFiles = {
            move: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE',
            score: 'data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfgBAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4',
            gameOver: 'data:audio/wav;base64,UklGRpYCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXICAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA',
            achievement: 'data:audio/wav;base64,UklGRpYCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXICAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA',
            levelUp: 'data:audio/wav;base64,UklGRh4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfgCAACBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB'
        };
    }
    
    // 初始化音頻上下文
    async init() {
        if (this.initialized) return;
        
        try {
            // 創建 Web Audio API 上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 預載所有音效
            await this.loadAllSounds();
            
            this.initialized = true;
            console.log('音效管理器初始化完成');
        } catch (error) {
            console.error('音效管理器初始化失敗:', error);
        }
    }
    
    // 預載所有音效文件
    async loadAllSounds() {
        for (const [name, data] of Object.entries(this.soundFiles)) {
            await this.loadSoundFromData(name, data);
        }
    }
    
    // 從 Base64 數據加載音效
    async loadSoundFromData(name, data) {
        try {
            // 解碼 Base64 數據
            const binaryString = atob(data.split(',')[1]);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // 解碼音頻
            const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
            this.sounds.set(name, audioBuffer);
        } catch (error) {
            console.error(`無法加載音效 ${name}:`, error);
        }
    }
    
    // 播放音效
    playSound(soundName, volume = 1.0) {
        if (!this.enabled || !this.initialized) return;
        
        const soundBuffer = this.sounds.get(soundName);
        if (!soundBuffer) {
            console.warn(`音效 ${soundName} 不存在`);
            return;
        }
        
        try {
            // 創建音源和增益節點
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            // 設置音量
            const finalVolume = volume * this.masterVolume;
            gainNode.gain.value = Math.max(0, Math.min(1, finalVolume));
            
            // 連接節點
            source.buffer = soundBuffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放音效
            source.start(0);
            
            // 視覺反饋 (可選)
            this.createVisualFeedback(soundName);
        } catch (error) {
            console.error(`播放音效 ${soundName} 失敗:`, error);
        }
    }
    
    // 創建視覺反饋
    createVisualFeedback(soundName) {
        // 在遊戲界面上顯示音效反饋
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'sound-feedback';
        feedbackElement.textContent = '🔊';
        feedbackElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 12px;
            border-radius: 50%;
            z-index: 9999;
            font-size: 14px;
            animation: soundPulse 0.5s ease-out;
            pointer-events: none;
        `;
        
        // 添加CSS動畫
        if (!document.getElementById('sound-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'sound-feedback-style';
            style.textContent = `
                @keyframes soundPulse {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedbackElement);
        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 500);
    }
    
    // 設置主音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    // 切換音效開關
    toggleSound() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }
    
    // 保存設定到 localStorage
    saveSettings() {
        const settings = {
            enabled: this.enabled,
            volume: this.masterVolume
        };
        localStorage.setItem('cwttt_sound_settings', JSON.stringify(settings));
    }
    
    // 從 localStorage 載入設定
    loadSettings() {
        try {
            const saved = localStorage.getItem('cwttt_sound_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.enabled = settings.enabled !== false;
                this.masterVolume = settings.volume || 0.5;
            }
        } catch (error) {
            console.error('載入音效設定失敗:', error);
        }
    }
    
    // 獲取當前設定狀態
    getSettings() {
        return {
            enabled: this.enabled,
            volume: this.masterVolume,
            initialized: this.initialized
        };
    }
}

// 創建全局音效管理器實例
const soundManager = new SoundManager();

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', async () => {
    soundManager.loadSettings();
    // 延遲初始化，用戶交互後再初始化（避免瀏覽器限制）
    document.addEventListener('click', async () => {
        if (!soundManager.initialized) {
            await soundManager.init();
        }
    }, { once: true });
});

// 導出供其他腳本使用
if (typeof window !== 'undefined') {
    window.soundManager = soundManager;
}
現在創建成就管理器：

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
            
            // 2048成就
            game2048_first_128: {
                id: 'game2048_first_128',
                name: '數字新手',
                description: '在2048中達到128',
                game: '2048',
                condition: { type: 'tile', value: 128 },
                icon: '🔢',
                rarity: 'common'
            },
            game2048_first_512: {
                id: 'game2048_first_512',
                name: '數字專家',
                description: '在2048中達到512',
                game: '2048',
                condition: { type: 'tile', value: 512 },
                icon: '📊',
                rarity: 'rare'
            },
            game2048_winner: {
                id: 'game2048_winner',
                name: '2048勝利者',
                description: '在2048中達到2048',
                game: '2048',
                condition: { type: 'tile', value: 2048 },
                icon: '🎯',
                rarity: 'epic'
            },
            
            // 守護氣球成就
            balloon_survivor_5min: {
                id: 'balloon_survivor_5min',
                name: '生存專家',
                description: '在守護氣球中存活5分鐘',
                game: 'balloon',
                condition: { type: 'survival_time', value: 300 }, // 300秒
                icon: '⏰',
                rarity: 'common'
            },
            balloon_killer_50: {
                id: 'balloon_killer_50',
                name: '神射手',
                description: '在守護氣球中擊敗50個敵人',
                game: 'balloon',
                condition: { type: 'kills', value: 50 },
                icon: '🎯',
                rarity: 'rare'
            },
            balloon_defender: {
                id: 'balloon_defender',
                name: '氣球守護者',
                description: '在守護氣球中存活10分鐘',
                game: 'balloon',
                condition: { type: 'survival_time', value: 600 },
                icon: '🛡️',
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
                '2048': 0,
                balloon: 0
            }
        };
    }
    
    // 載入成就數據
    loadAchievementData() {
        try {
            const saved = localStorage.getItem('cwttt_achievements');
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
            localStorage.setItem('cwttt_achievements', JSON.stringify(data));
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
                
            case 'tile':
                return gameData.maxTile >= condition.value;
                
            case 'survival_time':
                return gameData.survivalTime >= condition.value;
                
            case 'kills':
                return gameData.kills >= condition.value;
                
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
        if (window.soundManager) {
            window.soundManager.playSound('achievement');
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
}
