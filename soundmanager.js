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
