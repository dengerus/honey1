document.addEventListener("DOMContentLoaded", () => {
    // === ЛОГИКА ТОВАРОВ, СЧЕТЧИКОВ И ИЗБРАННОГО ===
    const counters = document.querySelectorAll(".counter-box");
    const orderBar = document.getElementById("order-bar");
    const orderTotalEl = document.getElementById("order-total-price");
    const orderItemsPreviewEl = document.getElementById("order-items-preview");
    const whatsappBtn = document.getElementById("whatsapp-btn");
    
    const favoritesToggleBtn = document.getElementById("favorites-toggle-btn");
    const favBadge = document.getElementById("fav-badge");
    const cartPopup = document.getElementById("cart-popup");
    const closePopupBtn = document.getElementById("close-popup-btn");
    const cartPopupItems = document.getElementById("cart-popup-items");

    let cart = {};

    if (counters.length > 0) {
        counters.forEach(box => {
            const minusBtn = box.querySelector(".minus");
            const plusBtn = box.querySelector(".plus");
            const valueEl = box.querySelector(".cnt-value");
            const card = box.closest(".info-card");
            
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);

            cart[id] = { name, price, count: 0, element: valueEl };

            plusBtn.addEventListener("click", () => {
                cart[id].count++;
                updateCart();
            });

            minusBtn.addEventListener("click", () => {
                if (cart[id].count > 0) {
                    cart[id].count--;
                    updateCart();
                }
            });
        });
    }

    function updateCart() {
        let totalPrice = 0;
        let totalCount = 0;
        let summaryList = [];

        for (let id in cart) {
            let item = cart[id];
            if (item.element) item.element.textContent = item.count;
            if (item.count > 0) {
                totalPrice += item.price * item.count;
                totalCount += item.count;
                summaryList.push(`${item.name} (${item.count} шт.)`);
            }
        }

        if (orderBar) {
            if (totalCount > 0) {
                orderBar.classList.remove("hidden");
                orderTotalEl.textContent = `${totalPrice} тг`;
                orderItemsPreviewEl.textContent = summaryList.join(", ");
            } else {
                orderBar.classList.add("hidden");
            }
        }
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", () => {
            let message = "Здравствуйте! Хочу сделать заказ мёда:%0A";
            let totalPrice = 0;

            for (let id in cart) {
                let item = cart[id];
                if (item.count > 0) {
                    message += `- ${item.name}: ${item.count} шт. (${item.price * item.count} тг)%0A`;
                    totalPrice += item.price * item.count;
                }
            }
            message += `%0AИтого к оплате: ${totalPrice} тг`;
            window.open(`https://wa.me/77074242531?text=${message}`, "_blank");
        });
    }

    if (favoritesToggleBtn) {
        favoritesToggleBtn.addEventListener("click", () => {
            cartPopup.classList.toggle("active");
            renderFavorites();
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener("click", () => {
            cartPopup.classList.remove("active");
        });
    }

    function renderFavorites() {
        if (!cartPopupItems) return;
        cartPopupItems.innerHTML = "";
        let savedFavs = JSON.parse(localStorage.getItem("honeyFavorites")) || [];

        if (savedFavs.length === 0) {
            cartPopupItems.innerHTML = `<p style="color: #78716c; text-align: center; padding: 10px;">Нет сохраненных заказов</p>`;
            if (favBadge) favBadge.classList.add("hidden");
            return;
        }

        if (favBadge) {
            favBadge.classList.remove("hidden");
            favBadge.textContent = savedFavs.length;
        }

        savedFavs.forEach((fav, index) => {
            const row = document.createElement("div");
            row.className = "popup-item-row";
            row.innerHTML = `
                <div class="popup-item-info">
                    <span class="popup-item-name">Заказ #${index + 1}</span>
                    <span class="popup-item-price">${fav.total} тг</span>
                </div>
                <div class="fav-actions">
                    <button class="fav-load-btn" data-index="${index}">Загрузить</button>
                    <button class="fav-del-btn" data-index="${index}">Удалить</button>
                </div>
            `;
            cartPopupItems.appendChild(row);
        });

        document.querySelectorAll(".fav-load-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                let idx = e.target.dataset.index;
                loadOrder(savedFavs[idx]);
            });
        });

        document.querySelectorAll(".fav-del-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                let idx = e.target.dataset.index;
                savedFavs.splice(idx, 1);
                localStorage.setItem("honeyFavorites", JSON.stringify(savedFavs));
                renderFavorites();
            });
        });
    }

    function loadOrder(favObj) {
        for (let id in cart) {
            cart[id].count = 0;
        }
        for (let id in favObj.items) {
            if (cart[id]) {
                cart[id].count = favObj.items[id];
            }
        }
        updateCart();
        cartPopup.classList.remove("active");
    }

    let initialFavs = JSON.parse(localStorage.getItem("honeyFavorites")) || [];
    if (initialFavs.length > 0 && favBadge) {
        favBadge.classList.remove("hidden");
        favBadge.textContent = initialFavs.length;
    }


    // === ИНТЕРАКТИВНАЯ ЛОГИКА ОТЗЫВОВ С ФИЛЬТРОМ МАТА И СРЕДНЕЙ ОЦЕНКОЙ ===
    const reviewForm = document.getElementById("review-form");
    const reviewsListContainer = document.getElementById("reviews-list");
    const editReviewIndexInput = document.getElementById("edit-review-index");
    const reviewSubmitBtn = document.getElementById("review-submit-btn");
    const reviewCancelBtn = document.getElementById("review-cancel-btn");
    const reviewFormHeading = document.getElementById("review-form-heading");
    const averageRatingBadge = document.getElementById("average-rating-badge");
    const avgRatingValue = document.getElementById("avg-rating-value");
    const avgRatingCount = document.getElementById("avg-rating-count");

    // Список запрещенных слов (базовый фильтр нецензурных выражений)
    const badWords = [
        "хуй", "пизд", "еб", "епт", "сук", "бля", "мраз", "урод", "сволоч", 
        "fuck", "bitch", "shit", "хуе", "пидор", "залуп", "гондон", "блять"
    ];

    function containsBadWords(text) {
        const lowerText = text.toLowerCase();
        return badWords.some(word => lowerText.includes(word));
    }

    function renderReviews() {
        if (!reviewsListContainer) return;
        const reviews = JSON.parse(localStorage.getItem("honeyReviews")) || [];

        // Пересчет средней оценки и управление плашкой
        if (reviews.length > 0) {
            let sum = reviews.reduce((acc, item) => acc + Number(item.rating), 0);
            let avg = (sum / reviews.length).toFixed(1);
            if (avgRatingValue) avgRatingValue.textContent = avg;
            if (avgRatingCount) avgRatingCount.textContent = `(${reviews.length})`;
            if (averageRatingBadge) averageRatingBadge.classList.remove("hidden");
        } else {
            if (averageRatingBadge) averageRatingBadge.classList.add("hidden");
        }

        // Если отзывов нет
        if (reviews.length === 0) {
            reviewsListContainer.innerHTML = `<p style="color: #78716c; text-align: center; padding: 20px; font-weight: 600;">Пока отзывов нет</p>`;
            return;
        }

        reviewsListContainer.innerHTML = reviews.map((r, index) => {
            const starsString = '★'.repeat(Number(r.rating)) + '☆'.repeat(5 - Number(r.rating));
            return `
                <div class="review-card-item">
                    <div class="review-card-header">
                        <span class="review-author-name">${escapeHtml(r.name)}</span>
                        <span class="review-card-stars" title="Оценка: ${r.rating} из 5">${starsString}</span>
                    </div>
                    <div class="review-card-text">${escapeHtml(r.text)}</div>
                    <div class="review-card-footer-actions">
                        <button class="review-action-icon-btn edit-btn" onclick="window.prepEditReview(${index})" title="Редактировать отзыв">✏️</button>
                        <button class="review-action-icon-btn delete-btn" onclick="window.prepDeleteReview(${index})" title="Удалить отзыв">🗑️</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nameVal = document.getElementById("review-name").value.trim();
            const textVal = document.getElementById("review-text").value.trim();
            const checkedStar = document.querySelector('input[name="rating"]:checked');
            const ratingVal = checkedStar ? checkedStar.value : "5";

            if (!nameVal || !textVal) return;

            // Проверка на нецензурные слова
            if (containsBadWords(nameVal) || containsBadWords(textVal)) {
                alert("Ошибка: Ваш отзыв содержит нецензурные слова или оскорбления. Сообщение не может быть опубликовано.");
                return;
            }

            let reviews = JSON.parse(localStorage.getItem("honeyReviews")) || [];
            const editIdx = parseInt(editReviewIndexInput.value);

            const reviewData = { name: nameVal, text: textVal, rating: ratingVal };

            if (editIdx > -1) {
                reviews[editIdx] = reviewData;
            } else {
                reviews.unshift(reviewData); // Новые сверху
            }

            localStorage.setItem("honeyReviews", JSON.stringify(reviews));
            resetReviewFormState();
            renderReviews();
        });
    }

    window.prepEditReview = function(index) {
        const reviews = JSON.parse(localStorage.getItem("honeyReviews")) || [];
        const target = reviews[index];
        if (!target) return;

        document.getElementById("review-name").value = target.name;
        document.getElementById("review-text").value = target.text;
        
        const starRadio = document.getElementById(`star${target.rating}`);
        if (starRadio) starRadio.checked = true;

        editReviewIndexInput.value = index;
        if (reviewSubmitBtn) reviewSubmitBtn.textContent = "Сохранить изменения";
        if (reviewCancelBtn) reviewCancelBtn.classList.remove("hidden");
        if (reviewFormHeading) reviewFormHeading.textContent = "Редактировать отзыв";

        reviewForm.scrollIntoView({ behavior: 'smooth' });
    };

    window.prepDeleteReview = function(index) {
        if (confirm("Вы уверены, что хотите удалить этот отзыв?")) {
            let reviews = JSON.parse(localStorage.getItem("honeyReviews")) || [];
            reviews.splice(index, 1);
            localStorage.setItem("honeyReviews", JSON.stringify(reviews));
            renderReviews();
        }
    };

    if (reviewCancelBtn) {
        reviewCancelBtn.addEventListener("click", () => {
            resetReviewFormState();
        });
    }

    function resetReviewFormState() {
        if (reviewForm) reviewForm.reset();
        if (editReviewIndexInput) editReviewIndexInput.value = "-1";
        if (reviewSubmitBtn) reviewSubmitBtn.textContent = "Опубликовать отзыв";
        if (reviewCancelBtn) reviewCancelBtn.classList.add("hidden");
        if (reviewFormHeading) reviewFormHeading.textContent = "Оставить отзыв";
        const star5 = document.getElementById("star5");
        if (star5) star5.checked = true;
    }

    renderReviews();
});