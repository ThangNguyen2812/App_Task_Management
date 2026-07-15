import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true, // Allow cookies to be sent along with API requests
    headers:{
        "Content-Type": "application/json",
    }
})

API.interceptors.request.use(
    (config) =>{
    const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check token is expired or not
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Call refresh token API. Use raw axios to prevent request loop.
                const { data } = await axios.post("http://localhost:5000/auth/refresh", {}, {
                    withCredentials: true
                });

                const newAccessToken = data.data.token;
                localStorage.setItem('token', newAccessToken);

                // Retry original request with the new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                // If refresh token request fails, log out the user
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Logout if token is outdated
        if (error.response && error.response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default API;