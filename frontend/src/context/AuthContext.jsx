import { useState, useEffect } from 'react'
import API from '../services/api.js'
import { AuthContext } from '../hooks/useAuth.js';



export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
    }

    useEffect(()=>{
        const checkLogin = async()=>{
            const token = localStorage.getItem('token');
            if(token){
                try {
                    await API.get('/user/profile');
                    const storedUser = localStorage.getItem('userInfo');
                    if(storedUser) setUser(JSON.parse(storedUser));
                }catch{
                    logout();
                }
            }
            setLoading(false);
        }
        checkLogin();
    },[])

    const register = async (username, email, password) =>{
        try{
            const {data} = await API.post('/auth/register' , { username, email, password});
            return {
                success: true,
                message: data.message
            }
        }
        catch(error){
            return{
                success: false,
                message: error.response?.data?.message || 'Register failed'
            }
        }
    }
    const login = async(username, password) =>{
        try{
            const {data} = await API.post('/auth/login', {username, password});
            const { token, user } = data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userInfo', JSON.stringify({id: user._id, username: user.username}));
            setUser({id: user._id, username: user.username});
            return{
                success: true,
                message: data.message
            }
        }
        catch(error){
            return{
                success: false,
                message: error.response?.data?.message || 'Login failed'
            }
        }
    }
    return(
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    )
};