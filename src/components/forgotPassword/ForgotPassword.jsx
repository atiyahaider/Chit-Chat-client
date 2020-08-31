import React, { useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { API_URL, EMAIL_REGEX } from '../../constants';

//components
import Banner from '../banner/Banner';
import Spinner from '../spinner/Spinner';
import Modal from '../modal/Modal';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    
    //hooks
    const { errorDescription } = useError();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const history = useHistory();
    const btnRef = useRef();

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
        
        setModalContent({type:'', content: ''});
        return true;
    }

    const sendEmail = e => {
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
        axios.post(API_URL + '/forgotPassword', 
        {
            email
        })
        .then((res) => {
            setIsLoading(false);
            setModalContent({ type: 'Information', content: 'An email has been sent to reset the password. Please follow the link in the email. The link will expire in an hour.' })
        })
        .catch(err => {
            setIsLoading(false);
            if(btnRef.current){
                btnRef.current.removeAttribute('disabled');
            }
            setModalContent({ type: 'Error', content: errorDescription(err) });
        })
    }

    const confirmMessage = () => {
        history.push('/');
    }

    return (  
        <div>
            <Banner displayMenu={false} />
            <div className='container'>
                <h1 className='heading'>Forgot Password</h1>
                <Spinner loading={isLoading} />

                <form className='formFields'>
                    <div className='inputField'>
                        <label>Email</label>
                        <input id='email' type='email' value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <button className='largeButton' ref={btnRef} onClick={sendEmail}>Reset Password</button>
                </form>
                <div>
                    <p className='footNote'>Don't have an account?&nbsp;
                        <Link to='/register' style={ isLoading ? {pointerEvents: 'none'} : null }>Register</Link>
                    </p><br></br>
                    <p className='footNote'>Already have an account?&nbsp;
                        <Link to='/login' style={ isLoading ? {pointerEvents: 'none'} : null }>Login</Link>
                    </p>
                </div>

                {modalContent.content !== '' && 
                    <Modal 
                        showModal={showModal} 
                        closeModal={closeModal} 
                        modalContent={modalContent} 
                        callback={confirmMessage}
                    />
                }            

            </div>
        </div>        
    );
}
 
export default ForgotPassword;