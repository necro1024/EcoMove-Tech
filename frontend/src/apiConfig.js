export const API_BASE_URL = ' https://8d26-2001-1388-18-7ae7-4d6b-9346-82c9-2695.ngrok-free.app/api';
const API_SECRET_KEY = 'HVFSXgdn8PgPZoPJ!T$n#';

export const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key': API_SECRET_KEY,
    'ngrok-skip-browser-warning': 'true'
});