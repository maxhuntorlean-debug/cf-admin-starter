import {
    getUsers,
    getUser,
    getRoles,
    createUser,
    updateUser,
    changeUserPassword
} from "../api.js";


export function UsersPage() {

    return `
        <div class="adminPage">

            <header class="adminHeader">

                <button
                    id="usersBack"
                    class="headerButton"
                    type="button"
                >
                    ←
                </button>

                <div class="headerTitle">
                    Пользователи
                </div>

                <button
                    id="usersAdd"
                    class="headerButton"
                    type="button"
                >
                    ＋
                </button>

            </header>


            <main class="content">

                <div
                    id="usersError"
                    class="pageError"
                ></div>

                <div
                    id="usersList"
                    class="usersList"
                >
                    Загрузка...
                </div>

            </main>

        </div>
    `;
}


export async function initUsers({
    onBack
}) {

    const backButton =
        document.getElementById("usersBack");

    const addButton =
        document.getElementById("usersAdd");

    const list =
        document.getElementById("usersList");

    const errorBox =
        document.getElementById("usersError");


    backButton.addEventListener(
        "click",
        onBack
    );


    addButton.addEventListener(
        "click",
        () => showCreateUserForm(
            list,
            errorBox
        )
    );


    list.addEventListener(
        "click",
        async (event) => {

            const row =
                event.target.closest(
                    "[data-user-id]"
                );

            if (!row) {
                return;
            }

            const userId =
                Number(row.dataset.userId);

            await showEditUserForm(
                userId,
                list,
                errorBox
            );
        }
    );


    await loadUsers(
        list,
        errorBox
    );
}


// =====================================
// LIST
// =====================================

async function loadUsers(
    list,
    errorBox
) {

    errorBox.textContent = "";

    list.innerHTML = `
        <div class="loading">
            Загрузка...
        </div>
    `;


    try {

        const result =
            await getUsers();


        if (!result.ok) {

            errorBox.textContent =
                result.error ||
                "Не удалось получить пользователей";

            list.innerHTML = "";

            return;
        }


        renderUsers(
            list,
            result.users || []
        );


    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Нет связи с сервером";

        list.innerHTML = "";
    }
}


function renderUsers(
    list,
    users
) {

    if (!users.length) {

        list.innerHTML = `
            <div class="emptyState">
                Пользователей нет
            </div>
        `;

        return;
    }


    list.innerHTML =
        users
            .map(
                (user) => `
                    <button
                        class="userRow"
                        type="button"
                        data-user-id="${user.id}"
                    >

                        <div class="userMain">

                            <div class="userName">
                                ${escapeHtml(user.name)}
                            </div>

                            <div class="userUsername">
                                ${escapeHtml(user.username)}
                            </div>

                        </div>


                        <div class="userMeta">

                            <div class="userRole">
                                ${escapeHtml(
                                    user.role_name ||
                                    user.role ||
                                    "Без роли"
                                )}
                            </div>

                            <div class="${
                                user.active
                                    ? "statusActive"
                                    : "statusInactive"
                            }">
                                ${
                                    user.active
                                        ? "Активен"
                                        : "Заблокирован"
                                }
                            </div>

                        </div>

                    </button>
                `
            )
            .join("");
}


// =====================================
// CREATE USER
// =====================================

async function showCreateUserForm(
    list,
    errorBox
) {

    errorBox.textContent = "";

    list.innerHTML = `
        <div class="loading">
            Загрузка ролей...
        </div>
    `;


    let rolesResult;


    try {

        rolesResult =
            await getRoles();

    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Не удалось загрузить роли";

        return;
    }


    if (!rolesResult.ok) {

        errorBox.textContent =
            rolesResult.error ||
            "Не удалось загрузить роли";

        return;
    }


    const roles =
        rolesResult.roles || [];


    list.innerHTML = `
        <form
            id="createUserForm"
            class="editForm"
        >

            <div class="formGroup">

                <label for="userName">
                    Имя
                </label>

                <input
                    id="userName"
                    class="loginInput"
                    type="text"
                    required
                >

            </div>


            <div class="formGroup">

                <label for="userUsername">
                    Логин
                </label>

                <input
                    id="userUsername"
                    class="loginInput"
                    type="text"
                    autocomplete="off"
                    required
                >

            </div>


            <div class="formGroup">

                <label for="userPassword">
                    Пароль
                </label>

                <input
                    id="userPassword"
                    class="loginInput"
                    type="password"
                    autocomplete="new-password"
                    required
                >

            </div>


            <div class="formGroup">

                <label for="userRole">
                    Роль
                </label>

                <select
                    id="userRole"
                    class="formSelect"
                    required
                >

                    <option value="">
                        Выберите роль
                    </option>

                    ${roles
                        .filter(
                            (role) =>
                                role.active
                        )
                        .map(
                            (role) => `
                                <option value="${role.id}">
                                    ${escapeHtml(role.name)}
                                </option>
                            `
                        )
                        .join("")}

                </select>

            </div>


            <div
                id="createUserError"
                class="pageError"
            ></div>


            <button
                id="createUserButton"
                class="primaryButton"
                type="submit"
            >
                Создать пользователя
            </button>


            <button
                id="createUserCancel"
                class="secondaryButton"
                type="button"
            >
                Отмена
            </button>

        </form>
    `;


    const form =
        document.getElementById(
            "createUserForm"
        );

    const cancel =
        document.getElementById(
            "createUserCancel"
        );

    const button =
        document.getElementById(
            "createUserButton"
        );

    const formError =
        document.getElementById(
            "createUserError"
        );


    cancel.addEventListener(
        "click",
        () => loadUsers(
            list,
            errorBox
        )
    );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            formError.textContent = "";

            button.disabled = true;
            button.textContent = "Создание...";


            const data = {

                name:
                    document
                        .getElementById("userName")
                        .value
                        .trim(),

                username:
                    document
                        .getElementById("userUsername")
                        .value
                        .trim(),

                password:
                    document
                        .getElementById("userPassword")
                        .value,

                roleId:
                    Number(
                        document
                            .getElementById("userRole")
                            .value
                    )
            };


            try {

                const result =
                    await createUser(data);


                if (!result.ok) {

                    formError.textContent =
                        result.error ||
                        "Не удалось создать пользователя";

                    return;
                }


                await loadUsers(
                    list,
                    errorBox
                );


            } catch (error) {

                console.error(error);

                formError.textContent =
                    "Нет связи с сервером";


            } finally {

                button.disabled = false;

                button.textContent =
                    "Создать пользователя";
            }
        }
    );
}


// =====================================
// EDIT USER
// =====================================

async function showEditUserForm(
    userId,
    list,
    errorBox
) {

    errorBox.textContent = "";

    list.innerHTML = `
        <div class="loading">
            Загрузка пользователя...
        </div>
    `;


    let userResult;
    let rolesResult;


    try {

        [
            userResult,
            rolesResult
        ] = await Promise.all([
            getUser(userId),
            getRoles()
        ]);

    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Нет связи с сервером";

        return;
    }


    if (!userResult.ok) {

        errorBox.textContent =
            userResult.error ||
            "Не удалось получить пользователя";

        return;
    }


    if (!rolesResult.ok) {

        errorBox.textContent =
            rolesResult.error ||
            "Не удалось получить роли";

        return;
    }


    const user =
        userResult.user;

    const roles =
        rolesResult.roles || [];


    list.innerHTML = `
        <div class="editForm">

            <form id="editUserForm">

                <div class="formGroup">

                    <label for="editUserName">
                        Имя
                    </label>

                    <input
                        id="editUserName"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(user.name)}"
                        required
                    >

                </div>


                <div class="formGroup">

                    <label for="editUserUsername">
                        Логин
                    </label>

                    <input
                        id="editUserUsername"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(user.username)}"
                        disabled
                    >

                </div>


                <div class="formGroup">

                    <label for="editUserRole">
                        Роль
                    </label>

                    <select
                        id="editUserRole"
                        class="formSelect"
                        required
                    >

                        ${roles
                            .filter(
                                (role) =>
                                    role.active ||
                                    Number(role.id) ===
                                    Number(user.role_id)
                            )
                            .map(
                                (role) => `
                                    <option
                                        value="${role.id}"
                                        ${
                                            Number(role.id) ===
                                            Number(user.role_id)
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(role.name)}
                                    </option>
                                `
                            )
                            .join("")}

                    </select>

                </div>


                <div class="formGroup">

                    <label>

                        <input
                            id="editUserActive"
                            type="checkbox"
                            ${user.active ? "checked" : ""}
                        >

                        Пользователь активен

                    </label>

                </div>


                <div
                    id="editUserError"
                    class="pageError"
                ></div>


                <button
                    id="editUserSave"
                    class="primaryButton"
                    type="submit"
                >
                    Сохранить
                </button>


                <button
                    id="editUserCancel"
                    class="secondaryButton"
                    type="button"
                >
                    Назад
                </button>

            </form>


            <hr>


            <form id="changePasswordForm">

                <div class="formGroup">

                    <label for="newUserPassword">
                        Новый пароль
                    </label>

                    <input
                        id="newUserPassword"
                        class="loginInput"
                        type="password"
                        autocomplete="new-password"
                        required
                    >

                </div>


                <div
                    id="passwordError"
                    class="pageError"
                ></div>


                <div
                    id="passwordSuccess"
                ></div>


                <button
                    id="changePasswordButton"
                    class="secondaryButton"
                    type="submit"
                >
                    Сменить пароль
                </button>

            </form>

        </div>
    `;


    const editForm =
        document.getElementById(
            "editUserForm"
        );

    const cancelButton =
        document.getElementById(
            "editUserCancel"
        );

    const saveButton =
        document.getElementById(
            "editUserSave"
        );

    const editError =
        document.getElementById(
            "editUserError"
        );

    const passwordForm =
        document.getElementById(
            "changePasswordForm"
        );

    const passwordButton =
        document.getElementById(
            "changePasswordButton"
        );

    const passwordError =
        document.getElementById(
            "passwordError"
        );

    const passwordSuccess =
        document.getElementById(
            "passwordSuccess"
        );


    cancelButton.addEventListener(
        "click",
        () => loadUsers(
            list,
            errorBox
        )
    );


    editForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            editError.textContent = "";

            saveButton.disabled = true;
            saveButton.textContent =
                "Сохранение...";


            const data = {

                name:
                    document
                        .getElementById(
                            "editUserName"
                        )
                        .value
                        .trim(),

                roleId:
                    Number(
                        document
                            .getElementById(
                                "editUserRole"
                            )
                            .value
                    ),

                active:
                    document
                        .getElementById(
                            "editUserActive"
                        )
                        .checked
            };


            try {

                const result =
                    await updateUser(
                        userId,
                        data
                    );


                if (!result.ok) {

                    editError.textContent =
                        result.error ||
                        "Не удалось сохранить пользователя";

                    return;
                }


                await loadUsers(
                    list,
                    errorBox
                );


            } catch (error) {

                console.error(error);

                editError.textContent =
                    "Нет связи с сервером";


            } finally {

                saveButton.disabled = false;
                saveButton.textContent =
                    "Сохранить";
            }
        }
    );


    passwordForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            passwordError.textContent = "";
            passwordSuccess.textContent = "";

            const password =
                document
                    .getElementById(
                        "newUserPassword"
                    )
                    .value;


            if (!password) {

                passwordError.textContent =
                    "Введите новый пароль";

                return;
            }


            passwordButton.disabled = true;
            passwordButton.textContent =
                "Смена пароля...";


            try {

                const result =
                    await changeUserPassword(
                        userId,
                        password
                    );


                if (!result.ok) {

                    passwordError.textContent =
                        result.error ||
                        "Не удалось сменить пароль";

                    return;
                }


                document
                    .getElementById(
                        "newUserPassword"
                    )
                    .value = "";

                passwordSuccess.textContent =
                    "Пароль изменён";


            } catch (error) {

                console.error(error);

                passwordError.textContent =
                    "Нет связи с сервером";


            } finally {

                passwordButton.disabled = false;

                passwordButton.textContent =
                    "Сменить пароль";
            }
        }
    );
}


// =====================================
// HELPERS
// =====================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}