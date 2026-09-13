const navItems = document.querySelectorAll(".nav-item");
const screens = document.querySelectorAll(".screen");

const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");
const closeNotification = document.getElementById("closeNotification");

const matchCenterButton = document.getElementById("matchCenterButton");
const backToMatches = document.getElementById("backToMatches");

const voteButton = document.getElementById("voteButton");

let notificationTimer;


/* ================= УВЕДОМЛЕНИЯ ================= */

function showNotification(message) {
    if (!notification || !notificationText) {
        return;
    }

    notificationText.textContent = message;
    notification.classList.add("active");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        notification.classList.remove("active");
    }, 3500);
}

if (closeNotification) {
    closeNotification.addEventListener("click", () => {
        notification.classList.remove("active");
    });
}


/* ================= ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ================= */

function openScreen(screenId) {
    screens.forEach((screen) => {
        screen.classList.remove("active");
    });

    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) {
        return;
    }

    targetScreen.classList.add("active");

    navItems.forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.screen === screenId
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= НИЖНЯЯ НАВИГАЦИЯ ================= */

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        openScreen(item.dataset.screen);
    });
});


/* ================= КНОПКИ ПЕРЕХОДА ================= */

document
    .querySelectorAll("[data-open-screen]")
    .forEach((element) => {
        element.addEventListener("click", () => {
            openScreen(element.dataset.openScreen);
        });

        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openScreen(element.dataset.openScreen);
            }
        });
    });


/* ================= МАТЧ-ЦЕНТР ================= */

function openMatchDetails() {
    const matchDetailScreen =
        document.getElementById("matchDetailScreen");

    if (!matchDetailScreen) {
        return;
    }

    screens.forEach((screen) => {
        screen.classList.remove("active");
    });

    navItems.forEach((item) => {
        item.classList.remove("active");
    });

    matchDetailScreen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* Кнопка "Открыть матч-центр" */

if (matchCenterButton) {
    matchCenterButton.addEventListener("click", () => {
        openMatchDetails();
    });
}


/* Карточка ближайшего матча */

document
    .querySelectorAll(".match-open-trigger")
    .forEach((element) => {
        element.addEventListener("click", () => {
            openMatchDetails();
        });

        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMatchDetails();
            }
        });
    });


/* Кнопка "Назад к матчам" */

if (backToMatches) {
    backToMatches.addEventListener("click", () => {
        openScreen("matchesScreen");
    });
}


/* ================= НОВОСТИ ================= */

document
    .querySelectorAll(".news-read-button")
    .forEach((button) => {
        button.addEventListener("click", () => {
            showNotification(
                "Полная новость скоро будет доступна 📰"
            );
        });
    });


/* ================= ГОЛОСОВАНИЕ ================= */

if (voteButton) {
    voteButton.addEventListener("click", () => {
        showNotification(
            "Голосования появятся после запуска фанатского раздела 🔥"
        );
    });
}


/* ================= ИГРОКИ ================= */

const playerCards = document.querySelectorAll(".player-card");
const playerDetailScreen =
    document.getElementById("playerDetailScreen");

const backToSquad =
    document.getElementById("backToSquad");

const detailPlayerImage =
    document.getElementById("detailPlayerImage");

const detailPlayerName =
    document.getElementById("detailPlayerName");

const detailPlayerPosition =
    document.getElementById("detailPlayerPosition");

const detailPlayerNumber =
    document.getElementById("detailPlayerNumber");

const detailPlayerAge =
    document.getElementById("detailPlayerAge");

const detailPlayerHeight =
    document.getElementById("detailPlayerHeight");

const detailPlayerCountry =
    document.getElementById("detailPlayerCountry");

const detailPlayerAbout =
    document.getElementById("detailPlayerAbout");


const playersData = {
    barinov: {
        name: "Дмитрий Баринов",
        surname: "Баринов",
        position: "Полузащитник",
        number: "6",
        age: "29 лет",
        height: "179 см",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Баринов",
        about:
            "Центральный полузащитник. Известен работоспособностью, характером и сильной игрой в центре поля."
    },

    miranchuk: {
        name: "Алексей Миранчук",
        surname: "Миранчук",
        position: "Полузащитник",
        number: "10",
        age: "30 лет",
        height: "177 см",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Миранчук",
        about:
            "Техничный атакующий полузащитник с хорошим пасом и видением поля."
    },

    suleymanov: {
        name: "Сулейманов",
        surname: "Сулейманов",
        position: "Нападающий",
        number: "9",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Сулейманов",
        about:
            "Нападающий команды. Подробная статистика будет добавлена позже."
    },

    morozov: {
        name: "Морозов",
        surname: "Морозов",
        position: "Защитник",
        number: "3",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Морозов",
        about:
            "Защитник команды. Здесь позже появятся подробная биография и статистика."
    },

    lantratov: {
        name: "Лантратов",
        surname: "Лантратов",
        position: "Вратарь",
        number: "1",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Лантратов",
        about:
            "Вратарь команды. Здесь будет информация о матчах, сейвах и сухих играх."
    },

    silyanov: {
        name: "Сильянов",
        surname: "Сильянов",
        position: "Защитник",
        number: "45",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Сильянов",
        about:
            "Защитник команды. Подробная информация и статистика будут добавлены позже."
    }
};


function openPlayerDetails(playerId) {
    const player = playersData[playerId];

    if (!player || !playerDetailScreen) {
        return;
    }

    if (detailPlayerImage) {
        detailPlayerImage.src = player.image;
        detailPlayerImage.alt = player.name;
    }

    if (detailPlayerName) {
        detailPlayerName.textContent = player.name;
    }

    if (detailPlayerPosition) {
        detailPlayerPosition.textContent = player.position;
    }

    if (detailPlayerNumber) {
        detailPlayerNumber.textContent =
            `№ ${player.number}`;
    }

    if (detailPlayerAge) {
        detailPlayerAge.textContent = player.age;
    }

    if (detailPlayerHeight) {
        detailPlayerHeight.textContent = player.height;
    }

    if (detailPlayerCountry) {
        detailPlayerCountry.textContent = player.country;
    }

    if (detailPlayerAbout) {
        detailPlayerAbout.textContent = player.about;
    }

    openScreen("playerDetailScreen");
}


playerCards.forEach((card) => {
    card.addEventListener("click", () => {
        openPlayerDetails(card.dataset.player);
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPlayerDetails(card.dataset.player);
        }
    });
});


if (backToSquad) {
    backToSquad.addEventListener("click", () => {
        openScreen("squadScreen");
    });
}
