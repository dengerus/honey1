document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '77074242531';
    const STORAGE_KEY = 'honey_shop_cart_v1';
    const FAV_STORAGE_KEY = 'honey_shop_favs_v1';

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

        if (barTotalPrice) {
            barTotalPrice.textContent = totalSum + ' ₽';
        }

        if (totalCount > 0) {
            if (barItemsText) barItemsText.textContent = itemsSummaryArray.join(', ');
            if (orderBar) orderBar.classList.remove('hidden');
        } else {
            if (orderBar) orderBar.classList.add('hidden');
            if (cartPopup) cartPopup.classList.remove('active');
        }

        updateFavoritesUI();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

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
                html = '<p style="text-align:center; color:#78716c; padding:10px;">Нет сохраненных заказов</p>';
            } else {
                favorites.forEach((fav, index) => {
                    html += `
                        <div class="fav-item-row">
                            <div class="fav-item-info">
                                <span class="fav-item-name">${fav.name}</span>
                                <span class="fav-item-desc">${fav.summary} (${fav.total} ₽)</span>
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

    function attachFavoritesListeners() {
        const loadBtns = favoritesPopupItems.querySelectorAll('.fav-load-btn');
        const delBtns = favoritesPopupItems.querySelectorAll('.fav-del-btn');

        loadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                cart = { ...favorites[index].cartData };
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

    if (orderBarToggle && cartPopup) {
        orderBarToggle.addEventListener('click', () => {
            if (favoritesPopup) favoritesPopup.classList.remove('active');
            cartPopup.classList.toggle('active');
        });
    }

    if (closePopupBtn && cartPopup) {
        closePopupBtn.addEventListener('click', () => {
            cartPopup.classList.remove('active');
        });
    }

    if (favoritesToggleBtn && favoritesPopup) {
        favoritesToggleBtn.addEventListener('click', () => {
            if (cartPopup) cartPopup.classList.remove('active');
            favoritesPopup.classList.toggle('active');
        });
    }

    if (closeFavoritesPopup && favoritesPopup) {
        closeFavoritesPopup.addEventListener('click', () => {
            favoritesPopup.classList.remove('active');
        });
    }

    if (saveCurrentFavBtn) {
        saveCurrentFavBtn.addEventListener('click', () => {
            let totalCount = Object.values(cart).reduce((a, b) => a + b, 0);
            if (totalCount === 0) {
                alert('Корзина пуста, нечего сохранять!');
                return;
            }

            let customName = favNameInput.value.trim();
            if (!customName) {
                customName = `Набор #${favorites.length + 1}`;
            }

            let totalSum = 0;
            let summaryArr = [];
            cards.forEach(card => {
                const id = card.dataset.id;
                const qty = cart[id] || 0;
                if (qty > 0) {
                    totalSum += parseInt(card.dataset.price) * qty;
                    summaryArr.push(`${card.dataset.name} x${qty}`);
                }
            });

            favorites.push({
                name: customName,
                summary: summaryArr.join(', '),
                total: totalSum,
                cartData: { ...cart }
            });

            localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
            favNameInput.value = '';
            updateFavoritesUI();
            alert('Заказ успешно сохранен в избранное! 🔖');
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