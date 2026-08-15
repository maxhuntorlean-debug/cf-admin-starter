import { login } from "../api.js";
import { APP_NAME, APP_SUBTITLE } from "../config.js";

export function LoginPage() {
    return `
        <div class="loginPage">
            <div class="loginCard">
                <div class="loginLogo">⚙️</div>

                <h1 class="loginTitle">${escapeHtml(APP_NAME)}</h1>

                <div class="loginSubtitle">${escapeHtml(APP_SUBTITLE)}</div>

                <form id="loginForm">
                    <div class="formGroup">
                        <label for="loginUsername">Логин</label>
                        <input
                            id="loginUsername"
                            class="loginInput"
                            type="text"
                            autocomplete="username"
                            required
                        >
                    </div>

                    <div class="formGroup">
                        <label for="loginPassword">Пароль</label>
                        <input
                            id="loginPassword"
                            class="loginInput"
                            type="password"
                            autocomplete="current-password"
                            required
                        >
                    </div>

                    <div id="loginError" class="loginError"></div>

                    <button id="loginButton" class="loginButton" type="submit">
                        Войти
                    </button>
                </form>
            </div>
        </div>
    `;
}

export function initLogin(onSuccess) {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const errorBox = document.getElementById("loginError");
    const button = document.getElementById("loginButton");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorBox.textContent = "";
        button.disabled = true;
        button.textContent = "Вход...";

        try {
            const result = await login(
                usernameInput.value.trim(),
                passwordInput.value
            );

            if (!result.ok) {
                errorBox.textContent =
                    result.error?.message ||
                    result.error ||
                    "Ошибка входа";
                return;
            }

            await onSuccess();
        } catch (error) {
            console.error(error);
            errorBox.textContent = "Нет связи с сервером";
        } finally {
            button.disabled = false;
            button.textContent = "Войти";
        }
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
