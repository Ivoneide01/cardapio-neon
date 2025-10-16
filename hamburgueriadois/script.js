// Estado do carrinho
let cart = [];
let promoShown = false;

// Elementos do DOM
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const totalValue = document.getElementById('totalValue');
const checkoutBtn = document.getElementById('checkoutBtn');
const promoPopup = document.getElementById('promoPopup');
const closePromo = document.getElementById('closePromo');
const okPromo = document.getElementById('okPromo');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners para todos os botões "Adicionar ao Carrinho"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    // Event listeners para o modal do carrinho
    cartButton.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    
    // Fechar modal ao clicar fora dele
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });

    // Event listener para o botão de checkout
    checkoutBtn.addEventListener('click', handleCheckout);

    // Event listeners para o popup de promoção
    closePromo.addEventListener('click', closePromoPopup);
    okPromo.addEventListener('click', closePromoPopup);
    
    // Fechar popup ao clicar fora dele
    promoPopup.addEventListener('click', (e) => {
        if (e.target === promoPopup) {
            closePromoPopup();
        }
    });
});

// Função para adicionar item ao carrinho
function handleAddToCart(e) {
    const button = e.target;
    const productId = button.getAttribute('data-id');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));
    const productType = button.getAttribute('data-type');

    // Verificar se o item já está no carrinho
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            type: productType,
            quantity: 1
        });
    }

    // Atualizar interface
    updateCartCount();
    
    // Adicionar animação ao botão
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);

    // Verificar promoção de pizzas
    checkPizzaPromotion();
}

// Função para verificar promoção de 2 pizzas
function checkPizzaPromotion() {
    const pizzaCount = cart
        .filter(item => item.type === 'pizza')
        .reduce((total, item) => total + item.quantity, 0);

    if (pizzaCount >= 2 && !promoShown) {
        showPromoPopup();
        promoShown = true;
    }
}

// Função para mostrar popup de promoção
function showPromoPopup() {
    promoPopup.classList.add('active');
}

// Função para fechar popup de promoção
function closePromoPopup() {
    promoPopup.classList.remove('active');
}

// Função para atualizar contador do carrinho
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Adicionar animação ao contador
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

// Função para abrir modal do carrinho
function openCart() {
    renderCartItems();
    cartModal.classList.add('active');
}

// Função para fechar modal do carrinho
function closeCartModal() {
    cartModal.classList.remove('active');
}

// Função para renderizar itens do carrinho
function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        totalValue.textContent = 'R$ 0,00';
        checkoutBtn.disabled = true;
        return;
    }

    checkoutBtn.disabled = false;

    let html = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">Quantidade: ${item.quantity}</div>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
                    Remover
                </button>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    updateTotal();
}

// Função para remover item do carrinho
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
    }

    updateCartCount();
    renderCartItems();
    
    // Resetar flag de promoção se não houver mais 2 pizzas
    const pizzaCount = cart
        .filter(item => item.type === 'pizza')
        .reduce((total, item) => total + item.quantity, 0);
    
    if (pizzaCount < 2) {
        promoShown = false;
    }
}

// Função para atualizar total
function updateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalValue.textContent = `R$ ${total.toFixed(2)}`;
}

// Função para finalizar pedido
function handleCheckout() {
    if (cart.length === 0) {
        return;
    }

    // Construir mensagem para WhatsApp
    let message = '🛒 *Novo Pedido*\n\n';
    
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    // Verificar se ganhou refrigerante
    const pizzaCount = cart
        .filter(item => item.type === 'pizza')
        .reduce((total, item) => total + item.quantity, 0);

    if (pizzaCount >= 2) {
        message += `\n🎉 *BRINDE: 1x Refrigerante Grátis*\n`;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n💰 *Total: R$ ${total.toFixed(2)}*`;

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número do WhatsApp
    const whatsappNumber = '5511983625454';
    
    // Criar URL do WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
}

