document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '77074242531';
    const STORAGE_KEY = 'honey_shop_cart_v1';

    let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    const cards = document.querySelectorAll('.info-card');
    const orderBar = document.getElementById('order-bar');
    const barTotalPrice = document.getElementById('bar-total-price');
    const barItemsText = document.getElementById('bar-items-text');
    const whatsappBtn = document.getElementById('whatsapp-send-btn');
    
    const cartPopup = document.getElementById('cart-popup');
    const orderBarToggle = document.getElementById('order-bar-toggle');
    const closePopupBtn = document.getElementById('close-cart-popup');
    const cartPopupItems = document.getElementById('cart-popup-items');

    function updateUI() {
        let totalSum = 0;
        let totalCount = 0;
        let itemsSummaryArray = [];
        let popupHtml = '';

        cards.forEach(card => {
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            const countSpan = card.querySelector('.cnt-value');
            const qty = cart[id] || 0;
            
            if (countSpan) {
                countSpan.textContent = qty;
            }

            if (qty > 0) {
                totalSum += price * qty;
                totalCount += qty;
                itemsSummaryArray.push(`${name} x${qty}`);

                popupHtml += `
                    <div class="popup-item-row">
                        <div class="popup-item-info">
                            <span class="popup-item-name">${name}</span>
                            <span class="popup-item-price">${price} ₽ × ${qty} = <strong>${price * qty} ₽</strong></span>
                        </div>
                        <div class="popup-item-controls">
                            <div class="counter-box">
                                <button class="cnt-btn popup-minus" data-id="${id}">-</button>
                                <span class="cnt-value">${qty}</span>
                                <button class="cnt-btn popup-plus" data-id="${id}">+</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        if (cartPopupItems) {
            cartPopupItems.innerHTML = popupHtml || '<p style="text-align:center; color:#78716c; padding:10px;">Корзина пуста</p>';
            attachPopupListeners();
        }

        barTotalPrice.textContent = totalSum + ' ₽';

        if (totalCount > 0) {
            barItemsText.textContent = itemsSummaryArray.join(', ');
            orderBar.classList.remove('hidden');
        } else {
            orderBar.classList.add('hidden');
            if (cartPopup) cartPopup.classList.remove('active');
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    cards.forEach(card => {
        const id = card.dataset.id;
        const plusBtn = card.querySelector('.plus');
        const minusBtn = card.querySelector('.minus');

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                cart[id] = (cart[id] || 0) + 1;
                updateUI();
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                if (cart[id] > 0) {
                    cart[id]--;
                    if (cart[id] === 0) delete cart[id];
                    updateUI();
                }
            });
        }
    });

    function attachPopupListeners() {
        const popupPlusBtns = cartPopupItems.querySelectorAll('.popup-plus');
        const popupMinusBtns = cartPopupItems.querySelectorAll('.popup-minus');

        popupPlusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                cart[id] = (cart[id] || 0) + 1;
                updateUI();
            });
        });

        popupMinusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (cart[id] > 0) {
                    cart[id]--;
                    if (cart[id] === 0) delete cart[id];
                    updateUI();
                }
            });
        });
    }

    if (orderBarToggle && cartPopup) {
        orderBarToggle.addEventListener('click', () => {
            cartPopup.classList.toggle('active');
        });
    }

    if (closePopupBtn && cartPopup) {
        closePopupBtn.addEventListener('click', () => {
            cartPopup.classList.remove('active');
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            let message = "Здравствуйте! Хочу сделать заказ:\n\n";
            let totalSum = 0;

            cards.forEach(card => {
                const id = card.dataset.id;
                const qty = cart[id] || 0;
                if (qty > 0) {
                    const name = card.dataset.name;
                    const price = parseInt(card.dataset.price);
                    const sum = price * qty;
                    totalSum += sum;
                    message += `▪️ ${name} — ${qty} шт. (${sum} ₽)\n`;
                }
            });

            message += `\n📦 Итого к оплате: ${totalSum} ₽`;

            const encodedMessage = encodeURIComponent(message);
            const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(waURL, '_blank');
        });
    }

    updateUI();

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const images = document.querySelectorAll('.info-card img');

    if (lightbox) {
        images.forEach(img => {
            img.addEventListener('click', () => {
                lightbox.classList.add('active');
                lightboxImg.src = img.src;
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
});