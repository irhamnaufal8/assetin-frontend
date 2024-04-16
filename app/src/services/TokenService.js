const ID_ACCESS_TOKEN = 'access_token'
const ID_ROLE = 'role'

export const getToken = () => {
    return localStorage.getItem(ID_ACCESS_TOKEN)
}

export const setToken = (token) => {
    localStorage.setItem(ID_ACCESS_TOKEN, token)
}

export const removeToken = () => {
    localStorage.removeItem(ID_ACCESS_TOKEN)
}

export const getRole = () => {
    return localStorage.getItem(ID_ROLE)
}

export const setRole = (role) => {
    localStorage.setItem(ID_ROLE, role)
}

export const removeRole = () => {
    localStorage.removeItem(ID_ROLE)
}

export default { getToken, setToken, removeToken, getRole, setRole, removeRole }