/**
 * Chat functionality for S2EH platform
 * Handles messaging between customers and sellers/support
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatItems = document.querySelectorAll('.chat-item');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    
    // Chat data (in a real app, this would come from a backend)
    const chatData = {
        seller1: {
            name: 'Maria Santos',
            avatar: '../../images/unknown.jpg',
            status: 'online',
            messages: [
                {
                    sender: 'seller',
                    content: 'Hello! Thank you for your interest in my handwoven baskets. I have several sizes and designs available.',
                    time: '2:25 PM',
                    avatar: '../../images/unknown.jpg'
                },
                {
                    sender: 'user',
                    content: 'Hi Maria! I\'m interested in the medium-sized basket. What\'s the price and delivery time?',
                    time: '2:26 PM'
                },
                {
                    sender: 'seller',
                    content: 'The medium basket is ₱350. It\'s handwoven with high-quality abaca fiber. I can deliver within 3-5 days via LBC Express.',
                    time: '2:28 PM',
                    avatar: '../../images/unknown.jpg'
                },
                {
                    sender: 'seller',
                    content: '',
                    time: '2:30 PM',
                    avatar: '../../images/unknown.jpg',
                    product: {
                        name: 'Handwoven Basket',
                        price: '₱350.00',
                        seller: 'Maria Santos',
                        image: '../../images/unknown.jpg'
                    }
                }
            ]
        },
        seller2: {
            name: 'Juan Dela Cruz',
            avatar: '../../images/unknown.jpg',
            status: 'away',
            messages: [
                {
                    sender: 'seller',
                    content: 'Hello! Are you interested in our organic rice?',
                    time: 'Yesterday 3:15 PM',
                    avatar: '../../images/unknown.jpg'
                },
                {
                    sender: 'user',
                    content: 'Yes, how much per kilo?',
                    time: 'Yesterday 3:20 PM'
                },
                {
                    sender: 'seller',
                    content: 'The organic rice is freshly harvested. When would you like delivery?',
                    time: 'Yesterday 3:25 PM',
                    avatar: '../../images/unknown.jpg'
                }
            ]
        },
        seller3: {
            name: 'Pedro Reyes',
            avatar: '../../images/unknown.jpg',
            status: 'offline',
            messages: [
                {
                    sender: 'seller',
                    content: 'Hi! I have fresh coconut jam available.',
                    time: 'Monday 10:30 AM',
                    avatar: '../../images/unknown.jpg'
                }
            ]
        },
        support: {
            name: 'S2EH Support',
            avatar: null,
            status: 'online',
            messages: [
                {
                    sender: 'support',
                    content: 'Hello! How can we help you today?',
                    time: 'Just now',
                    avatar: null
                }
            ]
        }
    };
    
    let currentChat = 'seller1';
    
    // Initialize chat
    loadChatMessages(currentChat);
    
    // Chat item click handlers
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            chatItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get chat ID
            const chatId = this.dataset.chat;
            currentChat = chatId;
            
            // Load messages for this chat
            loadChatMessages(chatId);
            
            // Update chat header
            updateChatHeader(chatId);
        });
    });
    
    // Send message functionality
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function loadChatMessages(chatId) {
        const chat = chatData[chatId];
        if (!chat) return;
        
        let messagesHTML = '';
        
        chat.messages.forEach(message => {
            if (message.sender === 'user') {
                messagesHTML += createUserMessage(message);
            } else {
                messagesHTML += createSellerMessage(message, chat.name);
            }
        });
        
        chatMessages.innerHTML = messagesHTML;
        scrollToBottom();
    }
    
    function createUserMessage(message) {
        return `
            <div class="message mb-3">
                <div class="d-flex justify-content-end">
                    <div class="message-content">
                        <div class="message-bubble bg-primary text-white p-3 rounded">
                            <p class="mb-1">${message.content}</p>
                            <small class="text-light">${message.time}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function createSellerMessage(message, senderName) {
        let productHTML = '';
        
        if (message.product) {
            productHTML = `
                <div class="product-share border rounded p-3 mb-2">
                    <div class="d-flex">
                        <img src="${message.product.image}" alt="${message.product.name}" class="rounded me-3" width="60" height="60">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${message.product.name}</h6>
                            <p class="text-success fw-bold mb-1">${message.product.price}</p>
                            <small class="text-muted">By: ${message.product.seller}</small>
                        </div>
                        <button class="btn btn-sm btn-primary ms-2">View</button>
                    </div>
                </div>
            `;
        }
        
        const avatarHTML = message.avatar 
            ? `<img src="${message.avatar}" alt="${senderName}" class="rounded-circle me-2" width="32" height="32">`
            : `<div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                 <i class="bi bi-headset text-white"></i>
               </div>`;
        
        return `
            <div class="message mb-3">
                <div class="d-flex">
                    ${avatarHTML}
                    <div class="message-content">
                        <div class="message-bubble bg-light p-3 rounded">
                            ${productHTML}
                            ${message.content ? `<p class="mb-1">${message.content}</p>` : ''}
                            <small class="text-muted">${message.time}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function updateChatHeader(chatId) {
        const chat = chatData[chatId];
        if (!chat) return;
        
        const chatHeader = document.querySelector('.chat-header');
        const statusClass = chat.status === 'online' ? 'text-success' : 
                           chat.status === 'away' ? 'text-warning' : 'text-secondary';
        const statusText = chat.status === 'online' ? 'Online' : 
                          chat.status === 'away' ? 'Away' : 'Offline';
        
        const avatarHTML = chat.avatar 
            ? `<img src="${chat.avatar}" alt="${chat.name}" class="rounded-circle me-3" width="40" height="40">`
            : `<div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                 <i class="bi bi-headset text-white"></i>
               </div>`;
        
        chatHeader.innerHTML = `
            <div class="d-flex align-items-center">
                ${avatarHTML}
                <div>
                    <h6 class="mb-0">${chat.name}</h6>
                    <small class="${statusClass}"><i class="bi bi-circle-fill me-1"></i>${statusText}</small>
                </div>
                <div class="ms-auto">
                    <button class="btn btn-outline-primary btn-sm me-2">
                        <i class="bi bi-telephone"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-camera-video"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) return;
        
        // Add message to current chat
        const newMessage = {
            sender: 'user',
            content: content,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        chatData[currentChat].messages.push(newMessage);
        
        // Clear input
        messageInput.value = '';
        
        // Reload messages
        loadChatMessages(currentChat);
        
        // Simulate response (in a real app, this would be real-time)
        setTimeout(() => {
            simulateResponse();
        }, 1000 + Math.random() * 2000);
    }
    
    function simulateResponse() {
        const responses = [
            "Thank you for your message! I'll get back to you shortly.",
            "Let me check that for you.",
            "That sounds great! When would you prefer delivery?",
            "I have that item in stock. Would you like to place an order?",
            "Sure, I can provide more details about that product."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const chat = chatData[currentChat];
        
        const responseMessage = {
            sender: chat.name === 'S2EH Support' ? 'support' : 'seller',
            content: randomResponse,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            avatar: chat.avatar
        };
        
        chatData[currentChat].messages.push(responseMessage);
        loadChatMessages(currentChat);
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Auto-scroll to bottom when new messages arrive
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true });
});
