document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '77074242531'; // Ваш номер телефона
    
    // Ключ для хранения в памяти браузера, чтобы данные жили при переходе по страницам
    const STORAGE_KEY = 'honey_shop_cart_v1';

    // Загружаем корзину из localStorage или создаем пустую
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // Находим карточки товаров на странице
    const cards = document.querySelectorAll('.info-card');
    const orderBar = document.getElementById('order-bar');
    const barTotalPrice = document.getElementById('bar-total-price');
    const barItemsText = document.getElementById('bar-items-text');
    const whatsappBtn = document.getElementById('whatsapp-send-btn');

    // Функция отрисовки состояния (плюсы/минусы на карточках и нижняя панель)
    function updateUI() {
        let totalSum = 0;
        let totalCount = 0;
        let itemsSummaryArray = [];

        cards.forEach(card => {
            const id = card.dataset.id;
            const countSpan = card.querySelector('.cnt-value');
            const qty = cart[id] || 0;
            
            if (countSpan) {
                countSpan.textContent = qty;
            }

            if (qty > 0) {
                const name = card.dataset.name;
                const price = parseInt(card.dataset.price);
                totalSum += price * qty;
                totalCount += qty;
                itemsSummaryArray.push(`${name} x${qty}`);
            }
        });

        // Обновляем общую сумму и текст в нижней панели
        barTotalPrice.textContent = totalSum + ' ₽';

        if (totalCount > 0) {
            barItemsText.textContent = itemsSummaryArray.join(', ');
            orderBar.classList.remove('hidden');
        } else {
            orderBar.classList.add('hidden');
        }

        // Сохраняем в память браузера
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    // Навешиваем клики на кнопки плюс и минус в карточках
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
                    if (cart[id] === 0) {
                        delete cart[id];
                    }
                    updateUI();
                }
            });
        }
    });

    // Обработка клика по кнопке отправки заказа в WhatsApp
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

            // Кодируем текст для ссылки WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

            // Открываем WhatsApp в новом окне/приложении
            window.open(waURL, '_blank');
        });
    }

    // Инициализация интерфейса при загрузке страницы
    updateUI();

    // Логика Lightbox (увеличение картинок)
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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
            }
        });
    }
});