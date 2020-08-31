import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LOCAL_STORAGE } from '../../constants';

//components
import Banner from '../banner/Banner';
import Spinner from '../spinner/Spinner';
import Modal from '../modal/Modal';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';
import useSocket from '../../hooks/useSocket';
import useAxios from '../../hooks/useAxios';
import useLogout from '../../hooks/useLogout';

const UpdateProfile = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionError, setSessionError] = useState('');

    //hooks
    const btnRef = useRef();
    const history = useHistory();
    const { roomId } = useParams();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { errorDescription, sessionExpired } = useError();
    const { leaveRoom, updateProfile, emitLogout } = useSocket(setSessionError);
    const [authAxios] = useAxios();
    const [logout] = useLogout(sessionError, setSessionError, setIsLoading, setModalContent, emitLogout, email, name);    

    useEffect(() => {
        if (localStorage.getItem(LOCAL_STORAGE)) {
            setIsLoading(true);
            authAxios.get('/user/')
            .then(res => {
                setEmail(res.data.email);
                setName(res.data.name);
                setIsLoading(false);
                // if arriving from a chat room, send msg of client leaving to that room
                if (roomId)
                    leaveRoom(roomId, res.data.name);
            })
            .catch(err => {
                setIsLoading(false);
                if (sessionExpired(err)) {
                    setSessionError(errorDescription(err));
                }
                else
                    setModalContent({ type: 'Error', content: errorDescription(err) });
            })
        }
        else
            history.push('/login');

    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const validate = () => {
        if (name.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter your name' });
            return false;
        }

        setModalContent({type:'', content: ''});
        return true;
    }

    const handleUpdate = async (e) => {
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
        try {
            await updateProfile(email, name);
            setIsLoading(false);
            history.goBack();
        } catch(err) {
            setIsLoading(false);
            if(btnRef.current){
                btnRef.current.removeAttribute('disabled');
            }
            setModalContent({ type: 'Error', content: err });
        }
    }

    const goBack = e => {
        e.preventDefault();
        history.goBack();
    }

    return (  
        <div>
            <Banner displayMenu={true} name={name} email={email} logout={logout} />
            <div className='container'>
                <h1 className='heading'>Update Profile</h1>
                <Spinner loading={isLoading} />

                <form className='formFields'>
                    <div className='inputField'>
                        <label>Email: {email}</label>
                    </div>
                    <div className='inputField'>
                        <label>Name</label>
                        <input id='name' type='text' value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className='buttonContainer'>
                        <button className='largeButton' onClick={goBack}>&lt;&lt; Back</button>
                        <button className='largeButton' ref={btnRef} onClick={handleUpdate}>Update</button>
                    </div>
                </form>

                {modalContent.content !== '' && <Modal showModal={showModal} closeModal={closeModal} modalContent={modalContent} />}
            </div>
        </div>          
    );
}
 
export default UpdateProfile;