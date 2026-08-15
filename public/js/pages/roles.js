import {
    getRoles,
    createRole,
    updateRole,
    getPermissions,
    createPermission,
    updatePermission,
    getRolePermissions,
    updateRolePermissions
} from "../api.js";


export function RolesPage() {

    return `
        <div class="adminPage">

            <header class="adminHeader">

                <button
                    id="rolesBack"
                    class="headerButton"
                    type="button"
                >
                    ←
                </button>

                <div class="headerTitle">
                    Роли и права
                </div>

                <button
                    id="rolesAdd"
                    class="headerButton"
                    type="button"
                    title="Добавить роль"
                >
                    +
                </button>

            </header>

            <main class="content">

                <div
                    id="rolesError"
                    class="pageError"
                ></div>

                <div id="rolesContent">
                    Загрузка...
                </div>

            </main>

        </div>
    `;
}


export async function initRoles({
    onBack
}) {

    const backButton =
        document.getElementById(
            "rolesBack"
        );

    const addButton =
        document.getElementById(
            "rolesAdd"
        );

    const content =
        document.getElementById(
            "rolesContent"
        );

    const errorBox =
        document.getElementById(
            "rolesError"
        );


    backButton.addEventListener(
        "click",
        onBack
    );


    addButton.addEventListener(
        "click",
        () => showCreateRole(
            content,
            errorBox
        )
    );


    content.addEventListener(
        "click",
        async (event) => {

            const roleRow =
                event.target.closest(
                    "[data-role-id]"
                );

            if (roleRow) {

                const roleId =
                    Number(
                        roleRow.dataset.roleId
                    );

                await showRole(
                    roleId,
                    content,
                    errorBox
                );

                return;
            }


            const permissionRow =
                event.target.closest(
                    "[data-permission-id]"
                );

            if (permissionRow) {

                const permissionId =
                    Number(
                        permissionRow.dataset
                            .permissionId
                    );

                await showEditPermission(
                    permissionId,
                    content,
                    errorBox
                );
            }
        }
    );


    await loadRoles(
        content,
        errorBox
    );
}


// =====================================
// ROLE LIST
// =====================================

async function loadRoles(
    content,
    errorBox
) {

    errorBox.textContent = "";

    content.innerHTML = `
        <div class="loading">
            Загрузка...
        </div>
    `;


    try {

        const result =
            await getRoles();


        if (!result.ok) {

            errorBox.textContent =
                result.error ||
                "Не удалось получить роли";

            content.innerHTML = "";

            return;
        }


        renderRoles(
            content,
            result.roles || []
        );


    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Нет связи с сервером";

        content.innerHTML = "";
    }
}


function renderRoles(
    content,
    roles
) {

    content.innerHTML = `

        <div class="usersList">

            ${roles.length
                ? roles
                    .map(
                        (role) => `
                            <button
                                class="userRow"
                                type="button"
                                data-role-id="${role.id}"
                            >

                                <div class="userMain">

                                    <div class="userName">
                                        ${escapeHtml(role.name)}
                                    </div>

                                    <div class="userUsername">
                                        ${escapeHtml(role.code)}
                                    </div>

                                </div>

                                <div class="userMeta">

                                    <div class="${
                                        role.active
                                            ? "statusActive"
                                            : "statusInactive"
                                    }">
                                        ${
                                            role.active
                                                ? "Активна"
                                                : "Отключена"
                                        }
                                    </div>

                                    <div>
                                        ›
                                    </div>

                                </div>

                            </button>
                        `
                    )
                    .join("")
                : `
                    <div class="emptyState">
                        Ролей нет
                    </div>
                `
            }

        </div>

        <button
            id="managePermissions"
            class="secondaryButton"
            type="button"
        >
            Управление правами
        </button>
    `;


    document
        .getElementById(
            "managePermissions"
        )
        .addEventListener(
            "click",
            () => showPermissions(
                content,
                document.getElementById(
                    "rolesError"
                )
            )
        );
}


// =====================================
// CREATE ROLE
// =====================================

function showCreateRole(
    content,
    errorBox
) {

    errorBox.textContent = "";

    content.innerHTML = `
        <div class="editForm">

            <form id="createRoleForm">

                <div class="formGroup">

                    <label for="roleName">
                        Название
                    </label>

                    <input
                        id="roleName"
                        class="loginInput"
                        type="text"
                        autocomplete="off"
                        required
                    >

                </div>


                <div class="formGroup">

                    <label for="roleCode">
                        Код
                    </label>

                    <input
                        id="roleCode"
                        class="loginInput"
                        type="text"
                        autocomplete="off"
                        placeholder="cashier"
                        required
                    >

                </div>


                <div class="formGroup">

                    <label>
                        <input
                            id="roleActive"
                            type="checkbox"
                            checked
                        >

                        Роль активна
                    </label>

                </div>


                <div
                    id="roleFormError"
                    class="pageError"
                ></div>


                <button
                    id="createRoleButton"
                    class="primaryButton"
                    type="submit"
                >
                    Создать роль
                </button>


                <button
                    id="createRoleBack"
                    class="secondaryButton"
                    type="button"
                >
                    Назад
                </button>

            </form>

        </div>
    `;


    const form =
        document.getElementById(
            "createRoleForm"
        );

    const button =
        document.getElementById(
            "createRoleButton"
        );

    const formError =
        document.getElementById(
            "roleFormError"
        );


    document
        .getElementById(
            "createRoleBack"
        )
        .addEventListener(
            "click",
            () => loadRoles(
                content,
                errorBox
            )
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            formError.textContent = "";

            const name =
                document
                    .getElementById(
                        "roleName"
                    )
                    .value
                    .trim();

            const code =
                document
                    .getElementById(
                        "roleCode"
                    )
                    .value
                    .trim()
                    .toLowerCase();

            const active =
                document
                    .getElementById(
                        "roleActive"
                    )
                    .checked;


            if (!name || !code) {

                formError.textContent =
                    "Заполните название и код";

                return;
            }


            button.disabled = true;
            button.textContent =
                "Создание...";


            try {

                const result =
                    await createRole({
                        name,
                        code,
                        active
                    });


                if (!result.ok) {

                    formError.textContent =
                        result.error ||
                        "Не удалось создать роль";

                    return;
                }


                await showRole(
                    Number(result.role.id),
                    content,
                    errorBox
                );


            } catch (error) {

                console.error(error);

                formError.textContent =
                    "Нет связи с сервером";


            } finally {

                button.disabled = false;
                button.textContent =
                    "Создать роль";
            }
        }
    );
}


// =====================================
// ROLE
// =====================================

async function showRole(
    roleId,
    content,
    errorBox
) {

    errorBox.textContent = "";

    content.innerHTML = `
        <div class="loading">
            Загрузка...
        </div>
    `;


    let permissionsResult;
    let roleResult;


    try {

        [
            permissionsResult,
            roleResult
        ] = await Promise.all([
            getPermissions(),
            getRolePermissions(roleId)
        ]);


    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Нет связи с сервером";

        return;
    }


    if (!permissionsResult.ok) {

        errorBox.textContent =
            permissionsResult.error ||
            "Не удалось получить список прав";

        return;
    }


    if (!roleResult.ok) {

        errorBox.textContent =
            roleResult.error ||
            "Не удалось получить роль";

        return;
    }


    const role =
        roleResult.role;

    const allPermissions =
        permissionsResult.permissions || [];

    const rolePermissions =
        roleResult.permissions || [];


    const selectedIds =
        new Set(
            rolePermissions.map(
                (permission) =>
                    Number(permission.id)
            )
        );


    const groups =
        groupPermissions(
            allPermissions
        );

    const isAdmin =
        role.code === "admin";


    content.innerHTML = `
        <div class="editForm">

            <form id="roleForm">

                <div class="formGroup">

                    <label for="editRoleName">
                        Роль
                    </label>

                    <input
                        id="editRoleName"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(role.name)}"
                        required
                    >

                </div>


                <div class="formGroup">

                    <label for="editRoleCode">
                        Код
                    </label>

                    <input
                        id="editRoleCode"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(role.code)}"
                        ${isAdmin ? "disabled" : ""}
                        required
                    >

                </div>


                <div class="formGroup">

                    <label>

                        <input
                            id="editRoleActive"
                            type="checkbox"
                            ${role.active ? "checked" : ""}
                            ${isAdmin ? "disabled" : ""}
                        >

                        Роль активна

                    </label>

                </div>


                <div
                    id="roleEditError"
                    class="pageError"
                ></div>

                <div
                    id="roleEditSuccess"
                ></div>


                <button
                    id="saveRole"
                    class="primaryButton"
                    type="submit"
                >
                    Сохранить роль
                </button>

            </form>


            <hr>


            <form id="rolePermissionsForm">

                ${Object.entries(groups)
                    .map(
                        ([groupName, permissions]) => `
                            <div class="permissionGroup">

                                <div class="permissionGroupTitle">
                                    ${escapeHtml(groupName)}
                                </div>

                                ${permissions
                                    .map(
                                        (permission) => {

                                            const locked =
                                                isAdmin &&
                                                permission.code ===
                                                "admin.access";

                                            return `
                                                <label class="permissionRow">

                                                    <input
                                                        type="checkbox"
                                                        name="permission"
                                                        value="${permission.id}"
                                                        ${
                                                            selectedIds.has(
                                                                Number(
                                                                    permission.id
                                                                )
                                                            )
                                                                ? "checked"
                                                                : ""
                                                        }
                                                        ${
                                                            locked
                                                                ? "disabled"
                                                                : ""
                                                        }
                                                    >

                                                    <span>

                                                        <strong>
                                                            ${escapeHtml(
                                                                permission.name
                                                            )}
                                                        </strong>

                                                        <small>
                                                            ${escapeHtml(
                                                                permission.code
                                                            )}
                                                        </small>

                                                    </span>

                                                </label>
                                            `;
                                        }
                                    )
                                    .join("")}

                            </div>
                        `
                    )
                    .join("")}


                <div
                    id="rolePermissionsError"
                    class="pageError"
                ></div>

                <div
                    id="rolePermissionsSuccess"
                ></div>


                <button
                    id="saveRolePermissions"
                    class="primaryButton"
                    type="submit"
                >
                    Сохранить права
                </button>

            </form>


            <button
                id="rolePermissionsBack"
                class="secondaryButton"
                type="button"
            >
                Назад
            </button>

        </div>
    `;


    // =====================================
    // SAVE ROLE
    // =====================================

    const roleForm =
        document.getElementById(
            "roleForm"
        );

    const saveRoleButton =
        document.getElementById(
            "saveRole"
        );

    const roleError =
        document.getElementById(
            "roleEditError"
        );

    const roleSuccess =
        document.getElementById(
            "roleEditSuccess"
        );


    roleForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            roleError.textContent = "";
            roleSuccess.textContent = "";

            const name =
                document
                    .getElementById(
                        "editRoleName"
                    )
                    .value
                    .trim();

            const code =
                isAdmin
                    ? "admin"
                    : document
                        .getElementById(
                            "editRoleCode"
                        )
                        .value
                        .trim()
                        .toLowerCase();

            const active =
                isAdmin
                    ? true
                    : document
                        .getElementById(
                            "editRoleActive"
                        )
                        .checked;


            saveRoleButton.disabled = true;

            saveRoleButton.textContent =
                "Сохранение...";


            try {

                const result =
                    await updateRole(
                        roleId,
                        {
                            name,
                            code,
                            active
                        }
                    );


                if (!result.ok) {

                    roleError.textContent =
                        result.error ||
                        "Не удалось сохранить роль";

                    return;
                }


                roleSuccess.textContent =
                    "Роль сохранена";


            } catch (error) {

                console.error(error);

                roleError.textContent =
                    "Нет связи с сервером";


            } finally {

                saveRoleButton.disabled = false;

                saveRoleButton.textContent =
                    "Сохранить роль";
            }
        }
    );


    // =====================================
    // SAVE PERMISSIONS
    // =====================================

    const permissionForm =
        document.getElementById(
            "rolePermissionsForm"
        );

    const permissionButton =
        document.getElementById(
            "saveRolePermissions"
        );

    const permissionError =
        document.getElementById(
            "rolePermissionsError"
        );

    const permissionSuccess =
        document.getElementById(
            "rolePermissionsSuccess"
        );


    permissionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            permissionError.textContent = "";
            permissionSuccess.textContent = "";


            const permissionIds =
                [
                    ...permissionForm
                        .querySelectorAll(
                            'input[name="permission"]:checked'
                        )
                ]
                    .map(
                        (input) =>
                            Number(input.value)
                    );


            if (isAdmin) {

                const adminAccess =
                    allPermissions.find(
                        (permission) =>
                            permission.code ===
                            "admin.access"
                    );


                if (
                    adminAccess &&
                    !permissionIds.includes(
                        Number(adminAccess.id)
                    )
                ) {

                    permissionIds.push(
                        Number(adminAccess.id)
                    );
                }
            }


            permissionButton.disabled = true;

            permissionButton.textContent =
                "Сохранение...";


            try {

                const result =
                    await updateRolePermissions(
                        roleId,
                        permissionIds
                    );


                if (!result.ok) {

                    permissionError.textContent =
                        result.error ||
                        "Не удалось сохранить права";

                    return;
                }


                permissionSuccess.textContent =
                    "Права сохранены";


            } catch (error) {

                console.error(error);

                permissionError.textContent =
                    "Нет связи с сервером";


            } finally {

                permissionButton.disabled = false;

                permissionButton.textContent =
                    "Сохранить права";
            }
        }
    );


    document
        .getElementById(
            "rolePermissionsBack"
        )
        .addEventListener(
            "click",
            () => loadRoles(
                content,
                errorBox
            )
        );
}


// =====================================
// PERMISSION LIST
// =====================================

async function showPermissions(
    content,
    errorBox
) {

    errorBox.textContent = "";

    content.innerHTML = `
        <div class="loading">
            Загрузка прав...
        </div>
    `;


    try {

        const result =
            await getPermissions();


        if (!result.ok) {

            errorBox.textContent =
                result.error ||
                "Не удалось получить права";

            return;
        }


        const permissions =
            result.permissions || [];

        const groups =
            groupPermissions(
                permissions
            );


        content.innerHTML = `

            ${Object.entries(groups)
                .map(
                    ([groupName, items]) => `
                        <div class="permissionGroup">

                            <div class="permissionGroupTitle">
                                ${escapeHtml(groupName)}
                            </div>

                            ${items
                                .map(
                                    (permission) => `
                                        <button
                                            class="permissionRow"
                                            type="button"
                                            data-permission-id="${permission.id}"
                                        >

                                            <span>

                                                <strong>
                                                    ${escapeHtml(
                                                        permission.name
                                                    )}
                                                </strong>

                                                <small>
                                                    ${escapeHtml(
                                                        permission.code
                                                    )}
                                                </small>

                                            </span>

                                        </button>
                                    `
                                )
                                .join("")}

                        </div>
                    `
                )
                .join("")}


            <button
                id="createPermission"
                class="primaryButton"
                type="button"
            >
                Добавить право
            </button>


            <button
                id="permissionsBack"
                class="secondaryButton"
                type="button"
            >
                Назад
            </button>
        `;


        document
            .getElementById(
                "createPermission"
            )
            .addEventListener(
                "click",
                () => showCreatePermission(
                    content,
                    errorBox
                )
            );


        document
            .getElementById(
                "permissionsBack"
            )
            .addEventListener(
                "click",
                () => loadRoles(
                    content,
                    errorBox
                )
            );


    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Нет связи с сервером";
    }
}


// =====================================
// CREATE PERMISSION
// =====================================

function showCreatePermission(
    content,
    errorBox
) {

    renderPermissionForm({
        content,
        errorBox,

        title: "Новое право",

        permission: null,

        onSave: async (data) =>
            createPermission(data)
    });
}


// =====================================
// EDIT PERMISSION
// =====================================

async function showEditPermission(
    permissionId,
    content,
    errorBox
) {

    errorBox.textContent = "";


    try {

        const result =
            await getPermissions();


        if (!result.ok) {

            errorBox.textContent =
                result.error ||
                "Не удалось получить права";

            return;
        }


        const permission =
            (result.permissions || [])
                .find(
                    (item) =>
                        Number(item.id) ===
                        Number(permissionId)
                );


        if (!permission) {

            errorBox.textContent =
                "Право не найдено";

            return;
        }


        renderPermissionForm({
            content,
            errorBox,

            title: "Редактирование права",

            permission,

            onSave: async (data) =>
                updatePermission(
                    permissionId,
                    data
                )
        });


    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Нет связи с сервером";
    }
}


// =====================================
// PERMISSION FORM
// =====================================

function renderPermissionForm({
    content,
    errorBox,
    title,
    permission,
    onSave
}) {

    const isAdminAccess =
        permission?.code ===
        "admin.access";


    content.innerHTML = `
        <div class="editForm">

            <h2>
                ${escapeHtml(title)}
            </h2>

            <br>


            <form id="permissionForm">

                <div class="formGroup">

                    <label for="permissionName">
                        Название
                    </label>

                    <input
                        id="permissionName"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(
                            permission?.name || ""
                        )}"
                        required
                    >

                </div>


                <div class="formGroup">

                    <label for="permissionCode">
                        Код
                    </label>

                    <input
                        id="permissionCode"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(
                            permission?.code || ""
                        )}"
                        placeholder="sales.create"
                        ${isAdminAccess ? "disabled" : ""}
                        required
                    >

                </div>


                <div class="formGroup">

                    <label for="permissionGroup">
                        Группа
                    </label>

                    <input
                        id="permissionGroup"
                        class="loginInput"
                        type="text"
                        value="${escapeAttribute(
                            permission?.group_name || ""
                        )}"
                        placeholder="sales"
                        required
                    >

                </div>


                <div
                    id="permissionFormError"
                    class="pageError"
                ></div>

                <div
                    id="permissionFormSuccess"
                ></div>


                <button
                    id="savePermission"
                    class="primaryButton"
                    type="submit"
                >
                    ${
                        permission
                            ? "Сохранить право"
                            : "Создать право"
                    }
                </button>


                <button
                    id="permissionFormBack"
                    class="secondaryButton"
                    type="button"
                >
                    Назад
                </button>

            </form>

        </div>
    `;


    const form =
        document.getElementById(
            "permissionForm"
        );

    const button =
        document.getElementById(
            "savePermission"
        );

    const formError =
        document.getElementById(
            "permissionFormError"
        );

    const successBox =
        document.getElementById(
            "permissionFormSuccess"
        );


    document
        .getElementById(
            "permissionFormBack"
        )
        .addEventListener(
            "click",
            () => showPermissions(
                content,
                errorBox
            )
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            formError.textContent = "";
            successBox.textContent = "";


            const name =
                document
                    .getElementById(
                        "permissionName"
                    )
                    .value
                    .trim();

            const code =
                isAdminAccess
                    ? "admin.access"
                    : document
                        .getElementById(
                            "permissionCode"
                        )
                        .value
                        .trim()
                        .toLowerCase();

            const groupName =
                document
                    .getElementById(
                        "permissionGroup"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            if (
                !name ||
                !code ||
                !groupName
            ) {

                formError.textContent =
                    "Заполните все поля";

                return;
            }


            button.disabled = true;

            button.textContent =
                "Сохранение...";


            try {

                const result =
                    await onSave({
                        name,
                        code,
                        groupName
                    });


                if (!result.ok) {

                    formError.textContent =
                        result.error ||
                        "Не удалось сохранить право";

                    return;
                }


                if (permission) {

                    successBox.textContent =
                        "Право сохранено";

                } else {

                    await showPermissions(
                        content,
                        errorBox
                    );
                }


            } catch (error) {

                console.error(error);

                formError.textContent =
                    "Нет связи с сервером";


            } finally {

                button.disabled = false;

                button.textContent =
                    permission
                        ? "Сохранить право"
                        : "Создать право";
            }
        }
    );
}


// =====================================
// HELPERS
// =====================================

function groupPermissions(
    permissions
) {

    const groups = {};


    for (const permission of permissions) {

        const group =
            permission.group_name ||
            "other";


        if (!groups[group]) {

            groups[group] = [];
        }


        groups[group].push(
            permission
        );
    }


    return groups;
}


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