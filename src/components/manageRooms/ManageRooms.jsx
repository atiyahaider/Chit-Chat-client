import React, { useEffect, useState, Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LOCAL_STORAGE } from '../../constants';
import './manageRooms.css';

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
import useLogout from '../../hooks/useLogout';
import useNewRoom from '../../hooks/useNewRoom';

const ManageRooms = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionError, setSessionError] = useState('');
    const [edit, setEdit] = useState(false);
    const [editedRoom, setEditedRoom] = useState('');

    //hooks
    const history = useHistory();
    let { roomId } = useParams();
    const { errorDescription, sessionExpired } = useError();
    const [authAxios] = useAxios();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { userRooms, setUserRooms, emitLogout, leaveRoom, emitNewRoom, emitEdittedRoomName, emitClearChat, emitDeleteRoom } = useSocket(setSessionError);
    const [createNewRoom] = useNewRoom(setModalContent, setIsLoading, emitNewRoom);
    const [logout] = useLogout(sessionError, setSessionError,setIsLoading, setModalContent, emitLogout, email, name);
        
    useEffect(() => {
        if (localStorage.getItem(LOCAL_STORAGE)) {
            setIsLoading(true);
            authAxios.get('/userRooms')
            .then(res => {
                setEmail(res.data.email);
                setName(res.data.name);
                setUserRooms(res.data.userRooms);
                setIsLoading(false);
                // if arriving from a chat room, send msg of client leaving to that room
                if (roomId) {
                    leaveRoom(roomId, res.data.name);
                }
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

    const clearEdit = () => {
        setEdit(false);
        setEditedRoom('');
        setSelectedRoomId('');
    }

    const handleEditRoom = (i) => {
        setEdit(true);
        setSelectedRoomId(i);
        setEditedRoom(userRooms[i].room);
    }

    const handleCancelEdit = (e) => {
        e.preventDefault();
        clearEdit();
    }

    const handleSaveRoom = async (e) => {
        e.preventDefault();
        if (editedRoom.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter a name for the chatroom' });
            return;
        }

        //no changes made to room name
        if (editedRoom.trim() === userRooms[selectedRoomId].room) {
            clearEdit();
            return;
        }

        setIsLoading(true);
        try {
            await emitEdittedRoomName(userRooms[selectedRoomId]._id, editedRoom);
            setIsLoading(false);
            clearEdit();
        } catch(err) {
            setIsLoading(false);
            setModalContent({ type: 'Error', content: err });
        }
    }

    const handleClearChat = (i) => {
        setEdit(false);
        setEditedRoom('');
        setSelectedRoomId(i);
        setModalContent({ type: 'DeleteAll', content: 'This will delete all the messages. Are you sure you want to clear the chat?' });
    }

    const clearChat = async () => {
        setIsLoading(true);
        try {
            await emitClearChat(userRooms[selectedRoomId]._id);
            setIsLoading(false);
            setSelectedRoomId('');
            closeModal();
            setModalContent({ type: 'Information', content: 'Chat cleared.' });
        } catch(err) {
            console.log(err)
            setIsLoading(false);
            setModalContent({ type: 'Error', content: err });
        }
    }

    const handleDeleteRoom = (i) => {
        setEdit(false);
        setEditedRoom('');
        setSelectedRoomId(i);
        setModalContent({ type: 'Delete', content: 'This will delete all the messages and all member subscriptions to this room. Are you sure you want to delete this room?' });
    }

    const deleteRoom = async () => {
        setIsLoading(true);
        try {
            await emitDeleteRoom(userRooms[selectedRoomId]._id);
            setIsLoading(false);
            setSelectedRoomId('');
            closeModal();
        } catch(err) {
            setIsLoading(false);
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
            <div className='roomButtonContainer'> 
                <Spinner loading={isLoading} /> 
                <NewRoom createNewRoom={createNewRoom} isLoading={isLoading}/>
            </div>
            <div className='chatRooms'>
                <div>
                    <div className='subBanner'>My Chatrooms</div>
                    <div className='roomContainer'>
                        {userRooms.map( (room, i) => 
                            <div className='roomItem' key={room._id}>
                                {edit && selectedRoomId === i ?
                                    <Fragment>
                                        <input type='text' value={editedRoom} onChange={e => setEditedRoom(e.target.value)}/>
                                        <div>
                                            <button className='icon' onClick={handleSaveRoom} title='Save'>
                                                <i id='saveIcon' className='fas fa-check'></i>
                                            </button>
                                            <button className='icon' onClick={handleCancelEdit} title='Cancel'>
                                                <i id='cancelIcon' className='fas fa-times'></i>
                                            </button>
                                        </div>
                                    </Fragment>
                                    :
                                    <Fragment>
                                        <div id={room._id}>{room.room}</div>
                                        <div>
                                            <button className='icon' onClick={() => handleEditRoom(i)} title='Edit Room'>
                                                <i className='fas fa-pencil-alt'></i>
                                            </button>
                                            <button className='icon' onClick={() => handleClearChat(i)} title='Clear Chat'>
                                                <i className='fas fa-comment-slash'></i>
                                            </button>
                                            <button className='icon' onClick={() => handleDeleteRoom(i)} title='Delete Room'>
                                                <i className='fas fa-trash-alt'></i>
                                            </button>
                                        </div>
                                    </Fragment>
                                }
                            </div>                  
                        )}
                    </div>
                </div>
            </div>

            <button className='largeButton' onClick={goBack}>&lt;&lt; Back</button>

            {modalContent.content !== '' && 
                <Modal 
                    showModal={showModal} 
                    closeModal={closeModal} 
                    modalContent={modalContent} 
                    callback={modalContent.type === 'DeleteAll' ? clearChat : modalContent.type === 'Delete' ? deleteRoom : closeModal}
                />
            }            
        </div>
    );
}
 export default ManageRooms;