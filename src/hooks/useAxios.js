import axios from 'axios';
import { LOCAL_STORAGE, API_URL } from '../constants';

const useAxios = (token) => {
    if (!token)
        token = localStorage.getItem(LOCAL_STORAGE);
        
    const authAxios = axios.create({
        baseURL: API_URL,
        headers: {
            // Authorization: 'Bearer ' + localStorage.getItem(LOCAL_STORAGE)
            Authorization: 'Bearer ' + token
        }
    })

    return [authAxios];
}
 
export default useAxios;