document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '77074242531';
    const STORAGE_KEY = 'honey_shop_cart_v4';
    const FAV_STORAGE_KEY = 'honey_shop_favs_v4';

    // Структура корзины: { id: { qty: 0, weight: 1 } }
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let favorites = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY)) || [];

    const cards = document.querySelectorAll('.info-card');
    const orderBar = document.getElementById('order-bar');
    const barTotalPrice = document.getElementById('bar-total-price');
    const barItemsText = document.getElementById('bar-items-text');
    const whatsappBtn = document.getElementById('whatsapp-send-btn');
    
    const cartPopup = document.getElementById('cart-popup');
    const orderBarToggle = document.getElementById('order-bar-toggle');
    const closePopupBtn = document.getElementById('close-cart-popup');
    const cartPopupItems = document.getElementById('cart-popup-items');

    const favoritesToggleBtn = document.getElementById('favorites-toggle-btn');
    const favoritesPopup = document.getElementById('favorites-popup');
    const closeFavoritesPopup = document.getElementById('close-favorites-popup');
    const favoritesPopupItems = document.getElementById('favorites-popup-items');
    const favNameInput = document.getElementById('fav-name-input');
    const saveCurrentFavBtn = document.getElementById('save-current-fav-btn');
    const favBadge = document.getElementById('fav-badge');

    function initCartItem(id) {
        if (!cart[id]) {
            cart[id] = { qty: 0, weight: 1 };
        }
    }

    function updateUI() {
        let totalSum = 0;
        let totalQty = 0;
        let itemsSummaryArray = [];
        let popupHtml = '';

        cards.forEach(card => {
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            
            initCartItem(id);
            const item = cart[id];
            
            const qtySpan = card.querySelector('.qty-value');
            const weightSpan = card.querySelector('.weight-value');
            
            if (qtySpan) qtySpan.textContent = item.qty;
            if (weightSpan) weightSpan.textContent = item.weight;

            if (item.qty > 0) {
                const itemTotal = price * item.weight * item.qty;
                totalSum += itemTotal;
                totalQty += item.qty;
                itemsSummaryArray.push(`${name} (${item.weight}кг) x${item.qty}`);

                popupHtml += `
                    <div class="popup-item-row">
                        <div class="popup-item-info">
                            <span class="popup-item-name">${name}</span>
                            <span class="popup-item-price">${price} ₽ × ${item.weight}кг × ${item.qty}шт = <strong>${itemTotal} ₽</strong></span>
                        </div>
                        <div class="popup-item-controls">
                            <div class="counter-box">
                                <button class="cnt-btn popup-qty-minus" data-id="${id}">-</button>
                                <span class="cnt-value">${item.qty}</span>
                                <button class="cnt-btn popup-qty-plus" data-id="${id}">+</button>
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

        if (barTotalPrice) barTotalPrice.textContent = totalSum + ' ₽';

        if (totalQty > 0) {
            if (barItemsText) barItemsText.textContent = itemsSummaryArray.join('; ');
            if (orderBar) orderBar.classList.remove('hidden');
        } else {
            if (orderBar) orderBar.classList.add('hidden');
            if (cartPopup) cartPopup.classList.remove('active');
        }

        updateFavoritesUI();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    // Обработчики кнопок на карточках товаров
    cards.forEach(card => {
        const id = card.dataset.id;
        
        const weightPlusBtn = card.querySelector('.weight-plus');
        const weightMinusBtn = card.querySelector('.weight-minus');
        const qtyPlusBtn = card.querySelector('.qty-plus');
        const qtyMinusBtn = card.querySelector('.qty-minus');

        if (weightPlusBtn) {
            weightPlusBtn.addEventListener('click', () => {
                initCartItem(id);
                cart[id].weight++;
                updateUI();
            });
        }

        if (weightMinusBtn) {
            weightMinusBtn.addEventListener('click', () => {
                initCartItem(id);
                if (cart[id].weight > 1) {
                    cart[id].weight--;
                    updateUI();
                }
            });
        }

        if (qtyPlusBtn) {
            qtyPlusBtn.addEventListener('click', () => {
                initCartItem(id);
                cart[id].qty++;
                updateUI();
            });
        }

        if (qtyMinusBtn) {
            qtyMinusBtn.addEventListener('click', () => {
                initCartItem(id);
                if (cart[id].qty > 0) {
                    cart[id].qty--;
                    updateUI();
                }
            });
        }
    });

    // Обработчики внутри всплывающей корзины
    function attachPopupListeners() {
        const popupQtyPlusBtns = cartPopupItems.querySelectorAll('.popup-qty-plus');
        const popupQtyMinusBtns = cartPopupItems.querySelectorAll('.popup-qty-minus');

        popupQtyPlusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                cart[id].qty++;
                updateUI();
            });
        });

        popupQtyMinusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (cart[id].qty > 0) {
                    cart[id].qty--;
                    updateUI();
                }
            });
        });
    }

    // Избранное
    function updateFavoritesUI() {
        if (!favBadge) return;
        if (favorites.length > 0) {
            favBadge.textContent = favorites.length;
            favBadge.classList.remove('hidden');
        } else {
            favBadge.classList.add('hidden');
        }

        if (favoritesPopupItems) {
            let html = '';
            if (favorites.length === 0) {
                html = '<p style="text-align:center; color:#78716c; padding:10px;">Нет сохраненных наборов</p>';
            } else {
                favorites.forEach((fav, index) => {
                    html += `
                        <div class="fav-item-row">
                            <div class="fav-item-info">
                                <span class="fav-item-name">${fav.name}</span>
                                <span class="popup-item-price">${fav.summary} — <strong>${fav.total} ₽</strong></span>
                            </div>
                            <div class="fav-actions">
                                <button class="fav-load-btn" data-index="${index}">Выбрать</button>
                                <button class="fav-del-btn" data-index="${index}">✕</button>
                            </div>
                        </div>
                    `;
                });
            }
            favoritesPopupItems.innerHTML = html;
            attachFavoritesListeners();
        }
    }

    function attachFavoritesListeners() {
        const loadBtns = favoritesPopupItems.querySelectorAll('.fav-load-btn');
        const delBtns = favoritesPopupItems.querySelectorAll('.fav-del-btn');

        loadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                cart = JSON.parse(JSON.stringify(favorites[index].cartData));
                favoritesPopup.classList.remove('active');
                updateUI();
            });
        });

        delBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                favorites.splice(index, 1);
                localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
                updateFavoritesUI();
            });
        });
    }

    if (saveCurrentFavBtn) {
        saveCurrentFavBtn.addEventListener('click', () => {
            let totalQty = 0;
            for (let id in cart) {
                totalQty += cart[id].qty;
            }

            if (totalQty === 0) {
                alert('Корзина пуста, нечего сохранять!');
                return;
            }

            let customName = favNameInput.value.trim() || `Набор #${favorites.length + 1}`;
            let totalSum = 0;
            let summaryArr = [];

            cards.forEach(card => {
                const id = card.dataset.id;
                const item = cart[id];
                if (item && item.qty > 0) {
                    const price = parseInt(card.dataset.price);
                    totalSum += price * item.weight * item.qty;
                    summaryArr.push(`${card.dataset.name} (${item.weight}кг) x${item.qty}`);
                }
            });

            favorites.push({
                name: customName,
                summary: summaryArr.join('; '),
                total: totalSum,
                cartData: JSON.parse(JSON.stringify(cart))
            });

            localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
            favNameInput.value = '';
            updateFavoritesUI();
            alert('Набор успешно сохранен в избранное! 🔖');
        });
    }

    // Отправка заказа в WhatsApp
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            let message = "Здравствуйте! Хочу сделать заказ:\n\n";
            let totalSum = 0;

            cards.forEach(card => {
                const id = card.dataset.id;
                const item = cart[id];
                if (item && item.qty > 0) {
                    const name = card.dataset.name;
                    const price = parseInt(card.dataset.price);
                    const sum = price * item.weight * item.qty;
                    totalSum += sum;
                    message += `▪️ ${name} — Вес: ${item.weight} кг, Кол-во: ${item.qty} шт. (${sum} ₽)\n`;
                }
            });

            message += `\n📦 Итого к оплате: ${totalSum} ₽`;

            const encodedMessage = encodeURIComponent(message);
            const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(waURL, '_blank');
        });
    }

    // Управление модальными окнами
    if (orderBarToggle && cartPopup) {
        orderBarToggle.addEventListener('click', () => {
            if (favoritesPopup) favoritesPopup.classList.remove('active');
            cartPopup.classList.toggle('active');
        });
    }
    if (closePopupBtn && cartPopup) closePopupBtn.addEventListener('click', () => cartPopup.classList.remove('active'));

    if (favoritesToggleBtn && favoritesPopup) {
        favoritesToggleBtn.addEventListener('click', () => {
            if (cartPopup) cartPopup.classList.remove('active');
            favoritesPopup.classList.toggle('active');
        });
    }
    if (closeFavoritesPopup && favoritesPopup) closeFavoritesPopup.addEventListener('click', () => favoritesPopup.classList.remove('active'));

    updateUI();

    // Просмотр картинок (Lightbox)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const images = document.querySelectorAll('.card-img');

    if (lightbox) {
        images.forEach(img => {
            img.addEventListener('click', () => {
                lightbox.classList.add('active');
                lightboxImg.src = img.src;
            });
        });
        if (closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }
});