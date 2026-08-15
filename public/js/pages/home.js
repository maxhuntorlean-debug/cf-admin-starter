export function HomePage(
    user
) {

    return `
        <div class="adminPage">

            <header class="adminHeader">

                <div>
                    🐼 Котопанда POS Admin
                </div>

                <div>
                    ${escapeHtml(
                        user.name ||
                        user.username ||
                        ""
                    )}
                </div>

            </header>


            <main class="adminMenu">

                <button
                    id="openUsers"
                    class="adminMenuItem"
                    type="button"
                >
                    👥 Пользователи
                </button>


                <button
                    id="openRoles"
                    class="adminMenuItem"
                    type="button"
                >
                    🛡 Роли и права
                </button>


                <button
                    id="logoutButton"
                    class="adminMenuItem"
                    type="button"
                >
                    🚪 Выйти
                </button>

            </main>

        </div>
    `;
}


export function initHome({
    onUsers,
    onRoles,
    onLogout
}) {

    document
        .getElementById("openUsers")
        .addEventListener(
            "click",
            onUsers
        );


    document
        .getElementById("openRoles")
        .addEventListener(
            "click",
            onRoles
        );


    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            onLogout
        );
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}