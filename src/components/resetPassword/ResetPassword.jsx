import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { API_URL, PASSWORD_REGEX } from '../../constants';

//components
import Banner from '../banner/Banner';
import Spinner from '../spinner/Spinner';
import Modal from '../modal/Modal';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';
import useAxios from '../../hooks/useAxios';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionError, setSessionError] = useState('');

    //hooks
    const history = useHistory();
    const btnRef = useRef();
    const { token } = useParams();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { errorDescription, sessionExpired } = useError();
    const [authAxios] = useAxios(token);

    useEffect(() => {
        if (sessionError !== '') 
            history.push('/login?err=' + sessionError);
    }, [sessionError]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setIsLoading(true);

        authAxios.get('/user/')
        .then(res => {
            setEmail(res.data.email);
            setIsLoading(false);
        })
        .catch(err => {
            setIsLoading(false);
            if (sessionExpired(err))
                setSessionError(errorDescription(err));
            else
                setModalContent({ type: 'Error', content: errorDescription(err) });
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const validate = () => {
        if (password.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter the new password' });
            return false;
        }
        if (!PASSWORD_REGEX.test(password)) {
            setModalContent({ type: 'Error', content: 'Password must have at least 1 lowercase and 1 uppercase letter, 1 number, 1 special character (!@#$%^&*), and must be at least 8 characters long.' });
            return false;
        }

        if (confirmPassword.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please confirm the password' });
            return false;
        }
        if (password.trim() !== confirmPassword.trim()) {
            setModalContent({ type: 'Error', content: 'Passwords do not match' });
            return false;
        }

        setModalContent({type:'', content: ''});
        return true;
    }

    const handleResetPassword = e => {
        e.preventDefault();
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
        authAxios.post(API_URL + '/reset', 
        {
            email,
            password
        })
        .then(() => {
            setIsLoading(false);
            history.push('/login');
        })
        .catch(err => {
            setIsLoading(false);
            if(btnRef.current){
                btnRef.current.removeAttribute('disabled');
            }
            if (sessionExpired(err))
                setSessionError(errorDescription(err));
            else
                setModalContent({ type: 'Error', content: errorDescription(err) });
        })
    }

    return (
        <div>
            <Banner displayMenu={false} />
            <div className='container'>
                <h1 className='heading'>Reset Password</h1>
                <Spinner loading={isLoading} />

                <form className='formFields'>
                    <div className='inputField'>
                        <label>New Password</label>
                        <input id='password' type='password' value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>Confirm Password</label>
                        <input id='confirmPassword' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                    </div>
                    <button className='largeButton' ref={btnRef} onClick={handleResetPassword}>Reset</button>
                </form>

                {modalContent.content !== '' && <Modal showModal={showModal} closeModal={closeModal} modalContent={modalContent} />}
            </div>
        </div>  
    )
}
 export default ResetPassword;