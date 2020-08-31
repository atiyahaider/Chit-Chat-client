import React, { useState, useRef, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { PASSWORD_REGEX } from '../../constants';

//components
import Banner from '../banner/Banner';
import Spinner from '../spinner/Spinner';
import Modal from '../modal/Modal';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';
import useAxios from '../../hooks/useAxios';
import useSocket from '../../hooks/useSocket';
import useLogout from '../../hooks/useLogout';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionError, setSessionError] = useState('');

    //hooks
    const btnRef = useRef();
    const history = useHistory();
    const { email, name, roomId } = useParams();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { errorDescription, sessionExpired } = useError();
    const [authAxios] = useAxios();
    const { emitLogout, leaveRoom } = useSocket(setSessionError);
    const [logout] = useLogout(sessionError, setSessionError, setIsLoading, setModalContent, emitLogout, email, name);


    useEffect(() => {
        // if arriving from a chat room, send msg of client leaving to that room
        if (roomId)
            leaveRoom(roomId, name);
    }, [roomId, name, leaveRoom])

    const validate = () => {
        if (oldPassword.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter the old password' });
            return false;
        }

        if (newPassword.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter the new password' });
            return false;
        }
        if (!PASSWORD_REGEX.test(newPassword)) {
            setModalContent({ type: 'Error', content: 'Password must have at least 1 lowercase and 1 uppercase letter, 1 number, 1 special character (!@#$%^&*), and must be at least 8 characters long.' });
            return false;
        }

        if (confirmPassword.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please confirm the new password' });
            return false;
        }
        if (newPassword.trim() !== confirmPassword.trim()) {
            setModalContent({ type: 'Error', content: 'Passwords do not match' });
            return false;
        }

        setModalContent({type:'', content: ''});
        return true;
    }

    const handleChangePassword = e => {
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
        authAxios.put('/changePassword', 
        {
            email,
            oldPassword,
            newPassword
        })
        .then(() => {
            setIsLoading(false);
            history.goBack();
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

    const goBack = e => {
        e.preventDefault();
        history.goBack();
    }

    return (
        <div>
            <Banner displayMenu={true} name={name} email={email} logout={logout} />
            <div className='container'>
                <h1 className='heading'>Change Password</h1>
                <Spinner loading={isLoading} />

                <form className='formFields'>
                <div className='inputField'>
                        <label>Email: {email}</label>
                    </div>
                    <div className='inputField'>
                        <label>Old Password</label>
                        <input id='oldPassword' type='password' value={oldPassword} onChange={e => setOldPassword(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>New Password</label>
                        <input id='newPassword' type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                    </div>
                    <div className='inputField'>
                        <label>Confirm Password</label>
                        <input id='confirmPassword' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                    </div>
                    <div className='buttonContainer'>
                        <button className='largeButton' onClick={goBack}>&lt;&lt; Back</button>
                        <button className='largeButton' ref={btnRef} onClick={handleChangePassword}>Change</button>
                    </div>
                </form>

                {modalContent.content !== '' && <Modal showModal={showModal} closeModal={closeModal} modalContent={modalContent} />}
            </div>
        </div>  
    )
}

export default ChangePassword;