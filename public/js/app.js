import {
    getCurrentUser,
    logout
} from "./api.js";

import {
    LoginPage,
    initLogin
} from "./pages/login.js";

import {
    HomePage,
    initHome
} from "./pages/home.js";

import {
    UsersPage,
    initUsers
} from "./pages/users.js";

import {
    RolesPage,
    initRoles
} from "./pages/roles.js";


const app =
    document.getElementById("app");


let currentUser = null;


// =====================================
// START
// =====================================

async function start() {

    try {

        const result =
            await getCurrentUser();


        if (
            result.ok &&
            result.user
        ) {

            currentUser =
                result.user;


            if (
                !hasPermission(
                    "admin.access"
                )
            ) {

                showAccessDenied();

                return;
            }


            showHome();

            return;
        }


    } catch (error) {

        console.error(error);
    }


    showLogin();
}


// =====================================
// PERMISSIONS
// =====================================

function hasPermission(
    permission
) {

    if (!currentUser) {
        return false;
    }


    if (
        !Array.isArray(
            currentUser.permissions
        )
    ) {

        return false;
    }


    return currentUser.permissions.includes(
        permission
    );
}


// =====================================
// LOGIN
// =====================================

function showLogin() {

    currentUser = null;

    app.innerHTML =
        LoginPage();


    initLogin(
        start
    );
}


// =====================================
// ACCESS DENIED
// =====================================

function showAccessDenied() {

    app.innerHTML = `
        <div class="loginPage">

            <div class="loginCard">

                <h1>
                    Нет доступа
                </h1>

                <p>
                    У вашей учётной записи нет доступа
                    к панели управления.
                </p>

                <button
                    id="accessDeniedLogout"
                    class="primaryButton"
                    type="button"
                >
                    Выйти
                </button>

            </div>

        </div>
    `;


    document
        .getElementById(
            "accessDeniedLogout"
        )
        .addEventListener(
            "click",
            doLogout
        );
}


// =====================================
// HOME
// =====================================

function showHome() {

    if (
        !hasPermission(
            "admin.access"
        )
    ) {

        showAccessDenied();

        return;
    }


    app.innerHTML =
        HomePage(
            currentUser
        );


    initHome({

        onUsers:
            showUsers,

        onRoles:
            showRoles,

        onLogout:
            doLogout
    });
}


// =====================================
// USERS
// =====================================

function showUsers() {

    if (
        !hasPermission(
            "users.read"
        )
    ) {

        alert(
            "Нет прав на просмотр пользователей"
        );

        return;
    }


    app.innerHTML =
        UsersPage();


    initUsers({
        onBack:
            showHome
    });
}


// =====================================
// ROLES
// =====================================

function showRoles() {

    if (
        !hasPermission(
            "roles.read"
        )
    ) {

        alert(
            "Нет прав на просмотр ролей"
        );

        return;
    }


    app.innerHTML =
        RolesPage();


    initRoles({
        onBack:
            showHome
    });
}


// =====================================
// LOGOUT
// =====================================

async function doLogout() {

    try {

        await logout();

    } catch (error) {

        console.error(error);

    } finally {

        showLogin();
    }
}


// =====================================
// INIT
// =====================================

start();