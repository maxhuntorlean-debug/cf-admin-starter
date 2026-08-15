import { API_URL } from "./config.js";

async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...options.headers
        }
    });

    let data;
    try {
        data = await response.json();
    } catch {
        data = { ok: false, error: "Некорректный ответ сервера" };
    }

    if (!response.ok && data.ok !== false) {
        data.ok = false;
    }

    return data;
}

// AUTH
export function login(username, password) {
    return request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
}

export function getCurrentUser() {
    return request("/api/auth/me");
}

export function logout() {
    return request("/api/auth/logout", { method: "POST" });
}

// USERS
export function getUsers() {
    return request("/api/admin/users");
}

export function getUser(id) {
    return request(`/api/admin/users/${id}`);
}

export function createUser(data) {
    return request("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export function updateUser(id, data) {
    return request(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export function changeUserPassword(id, password) {
    return request(`/api/admin/users/${id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });
}

// ROLES & PERMISSIONS
export function getRoles() {
    return request("/api/admin/roles");
}

export function createRole(data) {
    return request("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export function updateRole(id, data) {
    return request(`/api/admin/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export function getPermissions() {
    return request("/api/admin/roles/permissions");
}

export function createPermission(data) {
    return request("/api/admin/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export function updatePermission(id, data) {
    return request(`/api/admin/roles/permissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export function getRolePermissions(id) {
    return request(`/api/admin/roles/${id}/permissions`);
}

export function updateRolePermissions(id, permissionIds) {
    return request(`/api/admin/roles/${id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds })
    });
}
