// ============================================
// COMBINED SERVICES.JS - All JavaScript in One File
// ============================================

// YOUR PERSONAL INFORMATION - UPDATED!
const YOUR_CONFIG = {
    phone: '2347081472383',
    email: 'bossashura999k@gmail.com',
    portfolioUrl: 'https://tinyurl.com/Bossashura999k',
    brandName: 'Ashura',
    whatsappMessage: 'Hi%20Ashura,%20I%27m%20interested%20in%20your%20web%20development%20services'
};

// ============================================
// WHATSAPP BOT SECTION
// ============================================

class WhatsAppBot {
    constructor() {
        this.templates = {
            greeting: `👋 Hello! Thanks for contacting ${YOUR_CONFIG.brandName} Web Development.\n\nI specialize in creating beautiful, functional websites for Nigerian businesses.\n\nHow can I help you today?\n\n1. Get a quote\n2. See portfolio\n3. Ask a question\n\nReply with the number or type your question.`,
            
            quote: `📋 To get a quote, I'll need:\n\n1. Your business name\n2. Type of website needed (e-commerce, business, portfolio)\n3. Your budget range\n4. Timeline\n\nPlease provide these details and I'll send you a custom quote within 24 hours!`,
            
            portfolio: `🎨 My Portfolio:\n\n• E-commerce: ${YOUR_CONFIG.portfolioUrl}/bags.html\n• Business Site: ${YOUR_CONFIG.portfolioUrl}/gadgets.html\n• Portfolio: ${YOUR_CONFIG.portfolioUrl}/portfolio\n\nWould you like to see more examples or discuss a specific type of website?`,
            
            pricing: `💰 Starting Prices:\n\n• Basic Business Website: ₦25,000\n• E-commerce Website: ₦45,000\n• Portfolio Website: ₦20,000\n\nThese are starting prices. Final quote depends on features needed.\n\nWant a detailed quote for your specific needs?`,
            
            contact: `📞 Contact Info:\n\nPhone: +${YOUR_CONFIG.phone}\nEmail: ${YOUR_CONFIG.email}\n\nBest times to call: 9AM - 6PM (Monday-Saturday)\n\nPrefer WhatsApp? Just type your message here!`
        };
    }
    
    generateResponse(message) {
        const msg = message.toLowerCase().trim();
        
        if (msg.includes('hello') || msg.includes('hi')) {
            return this.templates.greeting;
        }
        
        if (msg.includes('quote') || msg.includes('price') || msg.includes('cost')) {
            return this.templates.quote;
        }
        
        if (msg.includes('portfolio') || msg.includes('example') || msg.includes('work')) {
            return this.templates.portfolio;
        }
        
        if (msg.includes('contact') || msg.includes('call') || msg.includes('email')) {
            return this.templates.contact;
        }
        
        // Check for numbers
        if (msg === '1') return this.templates.quote;
        if (msg === '2') return this.templates.portfolio;
        if (msg === '3') return "What would you like to know about web development?";
        
        // Default response
        return `Thanks for your message! I'll get back to you shortly.\n\nIn the meantime, you can:\n\n1. View my work: ${YOUR_CONFIG.portfolioUrl}\n2. Check pricing above\n3. Send your project details for a quote\n\nIs there anything specific you'd like to know?`;
    }
    
    // Generate WhatsApp link with pre-filled message
    generateWhatsAppLink(phone = YOUR_CONFIG.phone, message = '') {
        const encodedMessage = encodeURIComponent(message || this.templates.greeting);
        return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    
    // Quick reply buttons for website
    generateQuickReplies() {
        return [
            { text: "Get Quote", message: "I want to get a quote for a website" },
            { text: "View Portfolio", message: "Show me your portfolio" },
            { text: "Ask Question", message: "I have a question about web development" }
        ];
    }
}

// ============================================
// LEAD MANAGER SECTION
// ============================================

class LeadManager {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('web_leads') || '[]');
        this.init();
    }
    
    init() {
        this.setupFormTracking();
        this.setupAnalytics();
        this.setupReminders();
    }
    
    setupFormTracking() {
        // Track all form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.trackFormSubmission(form);
            });
        });
        
        // Track WhatsApp clicks
        document.querySelectorAll('a[href*="whatsapp"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackWhatsAppClick();
            });
        });
        
        // Track phone calls
        document.querySelectorAll('a[href*="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackPhoneCall();
            });
        });
    }
    
    trackFormSubmission(form) {
        const formData = new FormData(form);
        const lead = {
            id: Date.now(),
            type: 'form_submission',
            data: Object.fromEntries(formData),
            timestamp: new Date().toISOString(),
            source: window.location.pathname,
            status: 'new',
            followUpDate: this.getFollowUpDate(1)
        };
        
        this.saveLead(lead);
        this.showNotification('Thank you! We\'ll contact you soon.');
        
        // Send to WhatsApp (if it's the quote form)
        if (form.id === 'leadForm') {
            this.sendToWhatsApp(lead);
        }
    }
    
    trackWhatsAppClick() {
        const lead = {
            id: Date.now(),
            type: 'whatsapp_click',
            timestamp: new Date().toISOString(),
            source: window.location.pathname,
            status: 'contacted'
        };
        
        this.saveLead(lead);
    }
    
    trackPhoneCall() {
        const lead = {
            id: Date.now(),
            type: 'phone_call',
            timestamp: new Date().toISOString(),
            source: window.location.pathname,
            status: 'contacted'
        };
        
        this.saveLead(lead);
    }
    
    saveLead(lead) {
        this.leads.push(lead);
        localStorage.setItem('web_leads', JSON.stringify(this.leads));
        
        console.log('New lead saved:', lead);
        this.updateDashboard();
    }
    
    sendToWhatsApp(lead) {
        const phone = YOUR_CONFIG.phone;
        const message = `New Website Lead from ${YOUR_CONFIG.brandName}!%0A%0A` +
                       `Name: ${lead.data.name || 'Not provided'}%0A` +
                       `Phone: ${lead.data.phone || 'Not provided'}%0A` +
                       `Email: ${lead.data.email || 'Not provided'}%0A` +
                       `Service: ${lead.data.service || 'Not specified'}%0A` +
                       `Message: ${lead.data.message || 'No message'}`;
        
        setTimeout(() => {
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }, 500);
    }
    
    getFollowUpDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
    }
    
    setupAnalytics() {
        const pageViews = parseInt(localStorage.getItem('page_views') || '0');
        localStorage.setItem('page_views', pageViews + 1);
        
        if (!localStorage.getItem('first_visit')) {
            localStorage.setItem('first_visit', new Date().toISOString());
            localStorage.setItem('unique_visitors', 
                parseInt(localStorage.getItem('unique_visitors') || '0') + 1);
        }
        
        console.log(`📊 Stats: ${pageViews + 1} page views | ${localStorage.getItem('unique_visitors')} unique visitors`);
    }
    
    setupReminders() {
        setInterval(() => {
            this.checkFollowUps();
        }, 3600000);
    }
    
    checkFollowUps() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        this.leads.forEach(lead => {
            if (lead.followUpDate && lead.status === 'new') {
                const followUpDate = lead.followUpDate.split('T')[0];
                if (followUpDate === today) {
                    this.sendFollowUpReminder(lead);
                }
            }
        });
    }
    
    sendFollowUpReminder(lead) {
        console.log(`⏰ Reminder: Follow up with ${lead.data?.name || 'lead'} today!`);
        lead.status = 'follow_up_due';
        localStorage.setItem('web_leads', JSON.stringify(this.leads));
    }
    
    updateDashboard() {
        const statsElement = document.getElementById('leadStats');
        if (statsElement) {
            const totalLeads = this.leads.length;
            const newLeads = this.leads.filter(l => l.status === 'new').length;
            const contactedLeads = this.leads.filter(l => l.status === 'contacted').length;
            
            statsElement.innerHTML = `
                <div>Total Leads: ${totalLeads}</div>
                <div>New: ${newLeads}</div>
                <div>Contacted: ${contactedLeads}</div>
            `;
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getAllLeads() {
        return this.leads;
    }
    
    getLeadsByStatus(status) {
        return this.leads.filter(lead => lead.status === status);
    }
    
    updateLeadStatus(leadId, newStatus) {
        const lead = this.leads.find(l => l.id === leadId);
        if (lead) {
            lead.status = newStatus;
            lead.updatedAt = new Date().toISOString();
            localStorage.setItem('web_leads', JSON.stringify(this.leads));
            return true;
        }
        return false;
    }
    
    exportLeads() {
        const dataStr = JSON.stringify(this.leads, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `leads_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// ============================================
// MAIN FUNCTIONALITY SECTION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lead manager
    let leadManager;
    try {
        leadManager = new LeadManager();
        window.leadManager = leadManager;
        console.log(`%c👥 Total Leads: ${leadManager.getAllLeads().length}`, 'color: #2563eb; font-weight: bold;');
    } catch (error) {
        console.log('Lead Manager not initialized:', error);
    }
    
    // Initialize WhatsApp bot
    try {
        const whatsAppBot = new WhatsAppBot();
        window.whatsAppBot = whatsAppBot;
    } catch (error) {
        console.log('WhatsApp Bot not initialized:', error);
    }
    
    // Form Submission
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            const message = `New Lead from ${YOUR_CONFIG.brandName}'s Website!%0A%0A` +
                           `Name: ${data.name}%0A` +
                           `Phone: ${data.phone}%0A` +
                           `Email: ${data.email || 'Not provided'}%0A` +
                           `Business: ${data.business}%0A` +
                           `Service: ${data.service}%0A` +
                           `Message: ${data.message || 'No additional details'}`;
            
            window.open(`https://wa.me/${YOUR_CONFIG.phone}?text=${message}`, '_blank');
            alert('Thank you! Opening WhatsApp to send your quote request...');
            this.reset();
        });
    }
    
    // FAQ Toggle
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
            
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
    
    // WhatsApp function for different CTAs
    function sendWhatsApp(message) {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${YOUR_CONFIG.phone}?text=${encodedMessage}`, '_blank');
    }
    
    // Track form views
    localStorage.setItem('last_visit', new Date().toISOString());
    
    // Console message for potential clients
    console.log(`%c👋 Hello there! Interested in a website?`, 'color: #2563eb; font-size: 16px; font-weight: bold;');
    console.log(`%c📞 Call/WhatsApp: +${YOUR_CONFIG.phone}`, 'color: #10b981; font-size: 14px;');
    console.log(`%c💻 Portfolio: ${YOUR_CONFIG.portfolioUrl}`, 'color: #7c3aed; font-size: 14px;');
    console.log(`%c📧 Email: ${YOUR_CONFIG.email}`, 'color: #f59e0b; font-size: 14px;');
    console.log(`%c✨ Services by: ${YOUR_CONFIG.brandName}`, 'color: #8b5cf6; font-size: 14px;');
});

// Export for use in admin panel
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WhatsAppBot, LeadManager };
}