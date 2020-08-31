import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import './rooms.css';
import { LOCAL_STORAGE } from '../../constants';

//components
import Banner from '../banner/Banner';
import Modal from '../modal/Modal';
import NewRoom from '../newRoom/NewRoom';
import Spinner from '../spinner/Spinner';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';
import useSocket from '../../hooks/useSocket';
import useAxios from '../../hooks/useAxios';
import useNewRoom from '../../hooks/useNewRoom';
import useLogout from '../../hooks/useLogout';

const Rooms = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionError, setSessionError] = useState('');

    //hooks
    const { errorDescription, sessionExpired } = useError();
    const [authAxios] = useAxios();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { userRooms, setUserRooms, rooms, setRooms, broadcastLogin, emitLogout, emitNewRoom } = useSocket(setSessionError);
    const [createNewRoom] = useNewRoom(setModalContent, setIsLoading, emitNewRoom);
    const [logout] = useLogout(sessionError, setSessionError,setIsLoading, setModalContent, emitLogout, email, name);
    const history = useHistory();
        
    useEffect(() => {
        if (localStorage.getItem(LOCAL_STORAGE)) {
            setIsLoading(true);
            authAxios.get('/rooms')
            .then(res => {
                setEmail(res.data.email);
                setName(res.data.name);
                setUserRooms(res.data.userRooms);
                setRooms(res.data.rooms);
                broadcastLogin(res.data.email, res.data.name);
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
                if (sessionExpired(err))
                    setSessionError(errorDescription(err));
                else
                    setModalContent({ type: 'Error', content: errorDescription(err) });
            })
        }
        else
            history.push('/login');
            
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleJoinRoom = e => {
        e.persist();
        setIsLoading(true);
        authAxios.put('/rooms/join', 
        {
            roomId: e.target.id,
            email
        })
        .then(() => {
            setIsLoading(false);
            history.push('/chat/' + e.target.id);
        }) 
        .catch(err => {
            setIsLoading(false);
            if (sessionExpired(err)) 
                setSessionError(errorDescription(err));
            else    
                setModalContent({ type: 'Error', content: errorDescription(err) });
        })
    }

    return (
        <div>
            <Banner displayMenu={true} name={name} email={email} logout={logout} />
            <div className='roomButtonContainer'> 
                <Spinner loading={isLoading} />
                <NewRoom createNewRoom={createNewRoom} isLoading={isLoading}/>
            </div>
            <div className='chatRooms'>
                <div>
                    <div className='subBanner'>My Chatrooms</div>
                    <div className='roomContainer roomGrid'>
                        {userRooms.map( room => 
                                <div key={room._id} id={room._id} onClick={handleJoinRoom}>{room.room}</div>
                        )}                        
                    </div>
                </div>
                <div>
                    <div className='subBanner'>Other Chatrooms</div>
                    <div className='roomContainer roomGrid'>
                        {rooms.map( room => 
                            <div key={room._id} id={room._id} onClick={handleJoinRoom}>{room.room}</div>
                        )}                        
                    </div>
                </div>
            </div>
            {modalContent.content !== '' && <Modal showModal={showModal} closeModal={closeModal} modalContent={modalContent} />}
        </div>
    );
}
 export default Rooms;