/**
 * Advanced Counter Application
 * Features: Increment/Decrement, Save History, Custom Increment, Statistics
 */

class AdvancedCounter {
    constructor() {
        // State
        this.currentCount = 0;
        this.history = [];
        this.totalSaves = 0;
        this.highestCount = 0;
        this.totalCounted = 0;
        
        // DOM Elements
        this.elements = {
            digits: document.getElementById('digits'),
            preEl: document.getElementById('preEl'),
            increaseBtn: document.getElementById('increase-btn'),
            decreaseBtn: document.getElementById('decrease-btn'),
            saveBtn: document.getElementById('save-btn'),
            customAddBtn: document.getElementById('custom-add'),
            customInput: document.getElementById('custom-increment'),
            resetBtn: document.getElementById('reset-btn'),
            clearHistoryBtn: document.getElementById('clear-history-btn'),
            historyList: document.getElementById('history-list'),
            totalSavesEl: document.getElementById('total-saves'),
            highestCountEl: document.getElementById('highest-count'),
            totalCountedEl: document.getElementById('total-counted')
        };
        
        // Initialize
        this.init();
        this.loadFromStorage();
        this.updateDisplay();
    }
    
    init() {
        // Event Listeners
        this.elements.increaseBtn.addEventListener('click', () => this.increase());
        this.elements.decreaseBtn.addEventListener('click', () => this.decrease());
        this.elements.saveBtn.addEventListener('click', () => this.save());
        this.elements.customAddBtn.addEventListener('click', () => this.customAdd());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Input validation
        this.elements.customInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 1000) value = 1000;
            e.target.value = value;
        });
        
        // Animation for count changes
        this.animateCount = this.debounce(this.animateCountChange.bind(this), 50);
    }
    
    // Counter Operations
    increase(amount = 1) {
        this.currentCount += amount;
        this.totalCounted += amount;
        this.updateDisplay();
        this.animateCount('increase');
        this.saveToStorage();
    }
    
    decrease(amount = 1) {
        if (this.currentCount - amount >= 0) {
            this.currentCount -= amount;
            this.totalCounted += amount;
            this.updateDisplay();
            this.animateCount('decrease');
            this.saveToStorage();
        } else {
            this.showNotification("Count cannot go below zero!", 'warning');
        }
    }
    
    customAdd() {
        const amount = parseInt(this.elements.customInput.value) || 1;
        this.increase(amount);
        
        // Visual feedback
        this.elements.customInput.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.elements.customInput.style.transform = 'scale(1)';
        }, 150);
    }
    
    save() {
        if (this.currentCount === 0) {
            this.showNotification("Cannot save zero count!", 'warning');
            return;
        }
        
        const timestamp = new Date().toLocaleTimeString();
        const historyItem = {
            value: this.currentCount,
            timestamp: timestamp,
            id: Date.now()
        };
        
        this.history.unshift(historyItem); // Add to beginning
        this.totalSaves++;
        
        if (this.currentCount > this.highestCount) {
            this.highestCount = this.currentCount;
        }
        
        this.updateHistoryDisplay();
        this.updateStats();
        this.showNotification(`Saved count: ${this.currentCount}`, 'success');
        this.saveToStorage();
    }
    
    reset() {
        if (this.currentCount === 0) return;
        
        if (confirm("Are you sure you want to reset the counter to zero?")) {
            this.currentCount = 0;
            this.updateDisplay();
            this.animateCount('reset');
            this.showNotification("Counter has been reset", 'info');
            this.saveToStorage();
        }
    }
    
    clearHistory() {
        if (this.history.length === 0) return;
        
        if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
            this.history = [];
            this.totalSaves = 0;
            this.highestCount = 0;
            this.updateHistoryDisplay();
            this.updateStats();
            this.showNotification("History cleared", 'info');
            this.saveToStorage();
        }
    }
    
    // Display Updates
    updateDisplay() {
        this.elements.digits.textContent = this.currentCount;
        
        // Update color based on count
        if (this.currentCount === 0) {
            this.elements.digits.style.color = '#6c757d';
        } else if (this.currentCount < 0) {
            this.elements.digits.style.color = '#dc3545';
        } else if (this.currentCount > 100) {
            this.elements.digits.style.color = '#28a745';
        } else {
            this.elements.digits.style.color = '#007bff';
        }
    }
    
    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.elements.historyList.innerHTML = '<p class="empty-history">No entries yet. Save some counts to see them here!</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div>
                    <div class="history-value">Count: ${item.value}</div>
                    <div class="history-timestamp">Saved at ${item.timestamp}</div>
                </div>
                <button class="btn btn-sm btn-outline-secondary" onclick="counter.deleteHistoryItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.elements.historyList.appendChild(historyItem);
        });
    }
    
    updateStats() {
        this.elements.totalSavesEl.textContent = this.totalSaves;
        this.elements.highestCountEl.textContent = this.highestCount;
        this.elements.totalCountedEl.textContent = this.totalCounted;
    }
    
    // Animations
    animateCountChange(type) {
        const countElement = this.elements.digits;
        
        // Reset animation
        countElement.style.animation = 'none';
        void countElement.offsetWidth; // Trigger reflow
        
        // Apply new animation
        let animationName = '';
        switch(type) {
            case 'increase':
                animationName = 'pulseGreen';
                break;
            case 'decrease':
                animationName = 'pulseRed';
                break;
            case 'reset':
                animationName = 'shake';
                break;
        }
        
        countElement.style.animation = `${animationName} 0.3s ease`;
        
        // Add CSS for animations
        if (!document.getElementById('counter-animations')) {
            const style = document.createElement('style');
            style.id = 'counter-animations';
            style.textContent = `
                @keyframes pulseGreen {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); color: #28a745; }
                    100% { transform: scale(1); }
                }
                @keyframes pulseRed {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.9); color: #dc3545; }
                    100% { transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        // Type-specific styles
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            info: '#17a2b8',
            error: '#dc3545'
        };
        
        toast.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        // Add CSS for animations if not present
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    handleKeyboard(e) {
        // Prevent default behavior only for our shortcuts
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (isInput) return;
        
        switch(e.key) {
            case '+':
            case '=':
                e.preventDefault();
                this.increase();
                break;
            case '-':
            case '_':
                e.preventDefault();
                this.decrease();
                break;
            case 's':
            case 'S':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.save();
                }
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.reset();
                }
                break;
            case 'Enter':
                if (document.activeElement === this.elements.customInput) {
                    this.customAdd();
                }
                break;
        }
    }
    
    // Storage Management
    saveToStorage() {
        const data = {
            currentCount: this.currentCount,
            history: this.history,
            totalSaves: this.totalSaves,
            highestCount: this.highestCount,
            totalCounted: this.totalCounted,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('advancedCounter', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('advancedCounter');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Check if data is not too old (30 days)
                const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
                if (Date.now() - data.timestamp < THIRTY_DAYS) {
                    this.currentCount = data.currentCount || 0;
                    this.history = data.history || [];
                    this.totalSaves = data.totalSaves || 0;
                    this.highestCount = data.highestCount || 0;
                    this.totalCounted = data.totalCounted || 0;
                }
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    }
    
    // Public method for history item deletion
    deleteHistoryItem(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.totalSaves = this.history.length;
        
        // Recalculate highest count
        this.highestCount = this.history.length > 0 
            ? Math.max(...this.history.map(item => item.value))
            : 0;
        
        this.updateHistoryDisplay();
        this.updateStats();
        this.saveToStorage();
        this.showNotification('History entry deleted', 'info');
    }
}

// Initialize counter when DOM is loaded
let counter;
document.addEventListener('DOMContentLoaded', () => {
    counter = new AdvancedCounter();
    
    // Make counter globally available for inline onclick handlers
    window.counter = counter;
    
    // Add keyboard shortcut info
    console.log('Counter Keyboard Shortcuts:');
    console.log('+ or = : Increase count');
    console.log('- or _ : Decrease count');
    console.log('Ctrl+S : Save current count');
    console.log('Ctrl+R : Reset counter');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedCounter;
}