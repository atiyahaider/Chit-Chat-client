import React, { useState, useRef, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import { API_URL, LOCAL_STORAGE, EMAIL_REGEX } from '../../constants';
import './login.css';

//components
import Banner from '../banner/Banner';
import Spinner from '../spinner/Spinner';
import Modal from '../modal/Modal';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionErr, setSessionErr] = useState('');
    
    //hooks
    const { errorDescription } = useError();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const history = useHistory();
    const location = useLocation();
    const btnRef = useRef();

    useEffect(() => {
        setSessionErr(queryString.parse(location.search).err);
    }, [location.search])

    const validate = () => {
        if (email.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter an email address' });
            return false;
        }
        //validate email
        if (!EMAIL_REGEX.test(email)) {
                setModalContent({ type: 'Error', content: 'Invalid email address' });
                return false;
        }
        if (password.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter the password' });
            return false;
        }
        
        setModalContent({type:'', content: ''});
        return true;
    }

    const handleLogin = e => {
        e.preventDefault();
        setSessionErr('');

        //disable button
        if(btnRef.current){
            btnRef.current.setAttribute('disabled', 'disabled');
        }

        if (!validate()) {
            if(btnRef.current){
                btnRef.current.removeAttribute('disabled');
            }
            return;
        }

        setIsLoading(true);
        axios.get(API_URL + '/login', {
            params: {
                email,
                password
            }
        })
        .then(res => {
            //if valid login, store token in local storage
            localStorage.setItem(LOCAL_STORAGE, res.data.token);
            setIsLoading(false);
            history.push('/rooms');
        })
        .catch(err => {
            setIsLoading(false);
            if(btnRef.current){
                btnRef.current.removeAttribute('disabled');
            }
            setModalContent({ type: 'Error', content: errorDescription(err) });
        })
    }

    return (
        <div>
            <Banner displayMenu={false} />
            <div className='container'>
                <h1 className='heading'>Login</h1>
                { sessionErr !== '' ? <div className='errorDiv'>{sessionErr}</div>
                    : <Spinner loading={isLoading} />
                }

                <form className='formFields'>
                    <div className='inputField'>
                        <label>Email</label>
                        <input id='email' type='email' value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>Password</label>
                        <input id='password' type='password' value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <button className='largeButton' ref={btnRef} onClick={handleLogin}>Login</button>
                </form>
                <p className='footNote'>
                    <Link to='/forgotPassword' style={ isLoading ? {pointerEvents: 'none'} : null }>Forgot password?</Link>
                </p>
                <p className='footNote'>Don't have an account?&nbsp;
                    <Link to='/register' style={ isLoading ? {pointerEvents: 'none'} : null }>Register</Link>
                </p>

                {modalContent.content !== '' && <Modal showModal={showModal} closeModal={closeModal} modalContent={modalContent} />}
            </div>
        </div>        
    );
}
 export default Login;