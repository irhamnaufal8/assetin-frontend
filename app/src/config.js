export const baseURL = 'http://127.0.0.1:8000/api';
export const baseStorage = 'http://127.0.0.1:8000';
export const getImage = (path) => {
    return `${baseStorage}${path}`;
}

export const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';