import React, { useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { API_URL, EMAIL_REGEX, PASSWORD_REGEX } from '../../constants';

//components
import Banner from '../banner/Banner';
import Spinner from '../spinner/Spinner';
import Modal from '../modal/Modal';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);

    //hooks
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { errorDescription } = useError();
    const history = useHistory();
    const btnRef = useRef();

    const validate = () => {
        if (name.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter your name' });
            return false;
        }
        
        if (email.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter an email address' });
            return false;
        }
        if (!EMAIL_REGEX.test(email)) {
            setModalContent({ type: 'Error', content: 'Invalid email address' });
            return false;
        }

        if (password.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter the password' });
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

    const handleRegister = e => {
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
        axios.post(API_URL + '/register', 
        {
            name,
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
            setModalContent({ type: 'Error', content: errorDescription(err) });
        })
    }

    return (
        <div>
            <Banner displayMenu={false} />
            <div className='container'>
                <h1 className='heading'>Register</h1>
                <Spinner loading={isLoading} />

                <form className='formFields'>
                    <div className='inputField'>
                        <label>Name</label>
                        <input id='name' type='text' value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>Email</label>
                        <input id='email' type='email' value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>Password</label>
                        <input id='password' type='password' value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>Confirm Password</label>
                        <input id='confirmPassword' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                    </div>
                    <button className='largeButton' ref={btnRef} onClick={handleRegister}>Register</button>
                </form>
                <p className='footNote'>Already have an account?&nbsp;
                    <Link to='/login' style={ isLoading ? {pointerEvents: 'none'} : null }>Login</Link>
                </p>

                {modalContent.content !== '' && <Modal showModal={showModal} closeModal={closeModal} modalContent={modalContent} />}
            </div>
        </div>  
    )
}
 export default Register;