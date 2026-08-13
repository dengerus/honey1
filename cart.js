document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ЛОГИКА КОРЗИНЫ И ИЗБРАННОГО (index.html) ---
    const cards = document.querySelectorAll('.info-card');
    const orderBar = document.getElementById('order-bar');
    const orderItemsPreview = document.getElementById('order-items-preview');
    const orderTotalPrice = document.getElementById('order-total-price');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const favoritesToggleBtn = document.getElementById('favorites-toggle-btn');
    const favBadge = document.getElementById('fav-badge');
    const cartPopup = document.getElementById('cart-popup');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const cartPopupItems = document.getElementById('cart-popup-items');
    const orderBarToggle = document.getElementById('order-bar-toggle');

    let cart = {}; // Ключ - ID товара, значение - количество (кг)
    let favorites = JSON.parse(localStorage.getItem('honey_favorites')) || [];

    function updateOrderBar() {
        if (!orderBar) return;
        let totalCount = 0;
        let totalPrice = 0;
        let previewTextArr = [];

        cards.forEach(card => {
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            const qty = cart[id] || 0;

            const cntValue = card.querySelector('.cnt-value');
            if (cntValue) cntValue.textContent = qty;

            if (qty > 0) {
                totalCount += qty;
                totalPrice += qty * price;
                previewTextArr.push(`${name} (${qty} кг)`);
            }
        });

        if (totalCount > 0) {
            orderBar.classList.remove('hidden');
            if (orderItemsPreview) orderItemsPreview.textContent = previewTextArr.join(', ');
            if (orderTotalPrice) orderTotalPrice.textContent = totalPrice + ' тг';
        } else {
            orderBar.classList.add('hidden');
            if (cartPopup) cartPopup.classList.remove('active');
        }

        updateFavBadge();
    }

    cards.forEach(card => {
        const id = card.dataset.id;
        const plusBtn = card.querySelector('.cnt-btn.plus');
        const minusBtn = card.querySelector('.cnt-btn.minus');

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                cart[id] = (cart[id] || 0) + 1;
                updateOrderBar();
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                if (cart[id] && cart[id] > 0) {
                    cart[id]--;
                    if (cart[id] === 0) delete cart[id];
                    updateOrderBar();
                }
            });
        }
    });

    if (orderBarToggle && cartPopup) {
        orderBarToggle.addEventListener('click', (e) => {
            if (e.target.closest('#whatsapp-btn')) return;
            let currentOrderData = {};
            let hasItems = false;
            cards.forEach(card => {
                const id = card.dataset.id;
                if (cart[id] && cart[id] > 0) {
                    currentOrderData[id] = cart[id];
                    hasItems = true;
                }
            });

            if (hasItems) {
                const orderName = prompt('Введите название для сохранения этого заказа в избранное:', 'Мой заказ от ' + new Date().toLocaleDateString());
                if (orderName) {
                    favorites.push({ name: orderName, items: currentOrderData, date: new Date().toLocaleDateString() });
                    localStorage.setItem('honey_favorites', JSON.stringify(favorites));
                    updateFavBadge();
                    alert('Заказ успешно сохранен в избранное!');
                }
            }
        });
    }

    function updateFavBadge() {
        if (!favBadge) return;
        if (favorites.length > 0) {
            favBadge.textContent = favorites.length;
            favBadge.classList.remove('hidden');
        } else {
            favBadge.classList.add('hidden');
        }
    }

    if (favoritesToggleBtn && cartPopup) {
        favoritesToggleBtn.addEventListener('click', () => {
            renderFavorites();
            cartPopup.classList.toggle('active');
        });
    }

    if (closePopupBtn && cartPopup) {
        closePopupBtn.addEventListener('click', () => {
            cartPopup.classList.remove('active');
        });
    }

    function renderFavorites() {
        if (!cartPopupItems) return;
        cartPopupItems.innerHTML = '';
        if (favorites.length === 0) {
            cartPopupItems.innerHTML = '<div class="no-reviews">Нет сохраненных заказов.</div>';
            return;
        }

        favorites.forEach((fav, index) => {
            const row = document.createElement('div');
            row.className = 'fav-item-row';
            row.innerHTML = `
                <div class="fav-item-info">
                    <span class="fav-item-name">${fav.name}</span>
                    <span class="fav-item-desc">Сохранен: ${fav.date}</span>
                </div>
                <div class="fav-actions">
                    <button class="fav-load-btn" data-index="${index}">Загрузить</button>
                    <button class="fav-del-btn" data-index="${index}">Удалить</button>
                </div>
            `;
            cartPopupItems.appendChild(row);
        });

        cartPopupItems.querySelectorAll('.fav-load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                cart = { ...favorites[idx].items };
                updateOrderBar();
                cartPopup.classList.remove('active');
            });
        });

        cartPopupItems.querySelectorAll('.fav-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                favorites.splice(idx, 1);
                localStorage.setItem('honey_favorites', JSON.stringify(favorites));
                renderFavorites();
                updateFavBadge();
            });
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            let message = 'Здравствуйте! Хочу сделать заказ мёда:\n';
            let total = 0;
            cards.forEach(card => {
                const id = card.dataset.id;
                const name = card.dataset.name;
                const price = parseInt(card.dataset.price);
                const qty = cart[id] || 0;
                if (qty > 0) {
                    message += `- ${name}: ${qty} кг (${qty * price} тг)\n`;
                    total += qty * price;
                }
            });
            message += `\nИтого к оплате: ${total} тг`;
            const phone = '77074242531';
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }

    updateOrderBar();


    // --- 2. ЛОГИКА ИНТЕРАКТИВНЫХ ОТЗЫВОВ (contact.html) ---
    const reviewsList = document.getElementById('reviews-list');
    const reviewForm = document.getElementById('review-form');
    const reviewsStats = document.getElementById('reviews-stats');
    const reviewError = document.getElementById('review-error');

    // Базовый список отзывов по умолчанию, если localStorage пуст
    let defaultReviews = [
        { id: 1, name: 'Алексей Смирнов', rating: 5, text: 'Потрясающий горный мёд! Очень ароматный, густой. Доставили быстро в Алматы. Спасибо пасеке за качество!', date: '10.05.2026' },
        { id: 2, name: 'Елена Васильева', rating: 5, text: 'Берем гречишный мёд уже во второй раз. Вся семья в восторге, чувствуется натуральность и богатый вкус.', date: '18.05.2026' }
    ];

    let reviews = JSON.parse(localStorage.getItem('honey_reviews')) || defaultReviews;

    // Простая система фильтрации мата (клиентская безопасность)
    const badWords = ['сука', 'блять', 'хуй', 'пизда', 'ебать', 'мрачь', 'дура', 'суки', 'дебил'];
    function containsProfanity(text) {
        const lower = text.toLowerCase();
        return badWords.some(word => lower.includes(word));
    }

    function renderReviews() {
        if (!reviewsList) return;
        reviewsList.innerHTML = '';

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<div class="no-reviews">Пока отзывов нет. Будьте первыми!</div>';
            if (reviewsStats) reviewsStats.textContent = `★ 0.0 / 5 (0 отзывов)`;
            return;
        }

        let totalRating = 0;
        reviews.forEach(rev => totalRating += Number(rev.rating));
        let avgRating = (totalRating / reviews.length).toFixed(1);
        if (reviewsStats) reviewsStats.textContent = `★ ${avgRating} / 5 (${reviews.length} отзывов)`;

        const isAdmin = sessionStorage.getItem('honey_admin_logged') === 'true';

        reviews.forEach((rev) => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            let starsStr = '★★★★★'.slice(0, rev.rating) + '☆☆☆☆☆'.slice(0, 5 - rev.rating);
            
            // Кнопка удаления видна админу или автору (если имя совпадает, упрощенно)
            let deleteBtnHTML = '';
            if (isAdmin) {
                deleteBtnHTML = `<button class="review-del-btn" data-id="${rev.id}">Удалить (Админ)</button>`;
            }

            card.innerHTML = `
                <div class="review-top">
                    <span class="review-author">${rev.name}</span>
                    <span class="review-stars">${starsStr}</span>
                </div>
                <div class="review-text">${rev.text}</div>
                <span class="review-date">${rev.date}</span>
                ${deleteBtnHTML}
            `;
            reviewsList.appendChild(card);
        });

        // Навешиваем удаление отзывов
        reviewsList.querySelectorAll('.review-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.dataset.id);
                reviews = reviews.filter(r => r.id !== id);
                localStorage.setItem('honey_reviews', JSON.stringify(reviews));
                renderReviews();
            });
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('review-name');
            const textInput = document.getElementById('review-text');
            const ratingSelect = document.getElementById('review-rating');

            const nameVal = nameInput.value.trim();
            const textVal = textInput.value.trim();
            const ratingVal = parseInt(ratingSelect.value);

            // Скрытая активация админки: если ввести имя "ADMIN" и пароль в текст "SECRET123"
            if (nameVal.toUpperCase() === 'ADMIN' && textVal === 'SECRET123') {
                sessionStorage.setItem('honey_admin_logged', 'true');
                alert('Режим администратора активирован! Теперь вы можете удалять отзывы.');
                reviewForm.reset();
                renderReviews();
                return;
            }

            // Проверка на мат
            if (containsProfanity(nameVal) || containsProfanity(textVal)) {
                if (reviewError) reviewError.style.display = 'block';
                return;
            }
            if (reviewError) reviewError.style.display = 'none';

            const newReview = {
                id: Date.now(),
                name: nameVal,
                rating: ratingVal,
                text: textVal,
                date: new Date().toLocaleDateString()
            };

            reviews.unshift(newReview);
            localStorage.setItem('honey_reviews', JSON.stringify(reviews));
            reviewForm.reset();
            renderReviews();
        });
    }

    renderReviews();
});