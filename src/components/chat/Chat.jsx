import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import './chat.css';
import { LOCAL_STORAGE } from '../../constants';

//components
import Banner from '../banner/Banner';
import Modal from '../modal/Modal';
import Spinner from '../spinner/Spinner';
import Members from '../members/Members';
import Messages from '../messages/Messages';
import NewMessage from '../newMessage/NewMessage';

//hooks
import useError from '../../hooks/useError';
import useModal from '../../hooks/useModal';
import useSocket from '../../hooks/useSocket';
import useCheckboxes from '../../hooks/useCheckboxes';
import useAxios from '../../hooks/useAxios';
import useLogout from '../../hooks/useLogout';

const Chat = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [admin, setAdmin] = useState();
    const [noOfMsgs, setNoOfMsgs] = useState(0);
    const [modalContent, setModalContent] = useState({type:'', content: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [sessionError, setSessionError] = useState('');
    
    //hooks
    const history = useHistory();
    const { roomId } = useParams();
    const { errorDescription, sessionExpired } = useError();
    const [authAxios] = useAxios();
    const [showModal, closeModal] = useModal(modalContent, setModalContent);
    const { room, setRoom, members, setMembers, messages, setMessages, joinRoom, leaveRoom, emitTyping, emitStopTyping,
            emitMessage, emitClearChat, emitDeleteMessages, emitLogout, broadcastOffline } = useSocket(setSessionError, setNoOfMsgs);
    const [deleteMessages, selectMessages, checkboxes, showDeleteButtons, handleSelectAll, handleDeselectAll, handleCancelDelete, handleCheckboxChange, checkboxSelected] = useCheckboxes(messages);
    const [logout] = useLogout(sessionError, setSessionError, setIsLoading, setModalContent, emitLogout, email, name, roomId);

    useEffect(() => {
        if (localStorage.getItem(LOCAL_STORAGE)) {
            setIsLoading(true);
            authAxios.get('/chat/' + roomId)
            .then(res => {
                setEmail(res.data.email);
                setName(res.data.name);
                setRoom(res.data.roomData.room);
                setAdmin(res.data.roomData.admin);
                setMembers(res.data.roomData.members);
                setMessages(res.data.roomData.messages);
                setNoOfMsgs(res.data.roomData.messages.length);
                joinRoom(roomId, res.data.email, res.data.name);    //broadcast to all other clients that this member has joined
                if (res.data.offline.length > 0)
                    broadcastOffline(res.data.offline)    //broadcast to all other clients the offline members
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

    const sendMessage = async (message) => {
        if (message.trim() === '') {
            setModalContent({ type: 'Error', content: 'Please enter a message' });
            return;
        }

        setIsLoading(true);
        try {
            await emitMessage({roomId, email, name, message});
        } catch(err) {
            setModalContent({ type: 'Error', content: err });
        }
        setIsLoading(false);
    }

    const handleLeaveRoom = async () => {
        try {
            await leaveRoom(roomId, name);
            history.push('/rooms');
        } catch(err) {
            setModalContent({ type: 'Error', content: err });
        }
    }

    const handleClearChat = () => {
        setModalContent({ type: 'DeleteAll', content: 'This will delete all the messages. Are you sure you want to clear the chat?' });
    }

    const clearChat = async () => {
        setIsLoading(true);
        try {
            await emitClearChat(roomId);
            setIsLoading(false);
            closeModal();
            setMessages([]);
            setNoOfMsgs(0);
        } catch(err) {
            setIsLoading(false);
            setModalContent({ type: 'Error', content: err });
        }
    }

    const handleDeleteMessages = () => {
        if (!checkboxSelected())
            setModalContent({ type: 'Error', content: 'Please select the messages to delete' });
        else
            setModalContent({ type: 'Delete', content: 'Are you sure you want to delete the selected messages?' });
    }

    const deleteSelectedMessages = async () => {
        //convert the msg ids into an array
        let chkboxArr = Object.keys(checkboxes).filter(checkbox => checkboxes[checkbox]);

        setIsLoading(true);
        try {
            await emitDeleteMessages(roomId, chkboxArr);
            setIsLoading(false);
            closeModal();
            handleCancelDelete();
        } catch(err) {
            setIsLoading(false);
            setModalContent({ type: 'Error', content: err });
        }
    }

    const handleEmitTyping = () => {
        emitTyping(roomId, email, name);
    }

    const handleEmitStopTyping = () => {
        emitStopTyping(roomId, email, name);
    }

    const uploadImage = (imageFile) => {
        console.log(imageFile.type)
        if (!imageFile || (!imageFile.type.match('image.*'))) {
        // && !imageFile.type.match('video.*'))) {
            setModalContent({ type: 'Error', content: 'Please select an image file' });
            return;
        }

        //Read the file
        let reader = new FileReader();
        reader.addEventListener('load', async () => {
            setIsLoading(true);
            let image = reader.result;
            let imageType = imageFile.type.match('image.*') ? 'image' : 'video';
            try {
                await emitMessage({ roomId, email, name, message: image, type: imageType });
            } catch(err) {
                setModalContent({ type: 'Error', content: err });
            }
            setIsLoading(false);
        });
        reader.readAsDataURL(imageFile);
    }

    return (
        <div>
            <Banner  displayMenu={true} name={name} email={email} logout={logout} roomId={roomId} />
            <div id='topContainer'>
                <div id='spinnerContainer'>
                    <Spinner loading={isLoading} />
                </div>

                <div id='chatButtonContainer'>
                    {deleteMessages ?
                        <Fragment>
                            <div className='leftButtons'>
                                {!selectMessages ?
                                    <button className='icon' onClick={handleSelectAll} title='Select All'>
                                        <i className='far fa-square'></i>    
                                    </button>
                                :
                                    <button className='icon' onClick={handleDeselectAll} title='Deselect All'>
                                        <i className='far fa-check-square'></i>        
                                    </button>
                                }
                                <button className='icon' onClick={handleDeleteMessages} title='Delete Messages'>
                                    <i className='fas fa-trash-alt'></i>
                                </button>
                                <button className='icon' onClick={handleCancelDelete} title='Cancel'>
                                    <i className='fas fa-times'></i>
                                </button>
                           </div>
                        </Fragment>
                        : (admin === email && noOfMsgs > 0) ? 
                            <Fragment>
                                <div className='leftButtons'>
                                    <button className='icon' onClick={handleClearChat} title='Clear Chat'>
                                        <i className='fas fa-comment-slash'></i>
                                    </button>
                                    <button className='icon' onClick={showDeleteButtons} title='Delete Messages'>
                                        <i className='fas fa-trash-alt'></i>
                                    </button>
                                </div>
                            </Fragment>
                            : null
                    }
                    <div className='rightButtons'>
                            <button className='icon' onClick={handleLeaveRoom} title='Leave Room'>
                                <i id='leaveIcon' className='fas fa-sign-out-alt fa-rotate-180'></i>
                            </button>
                    </div>
                </div>
            </div>

            <div id='chatroomContent'>
                <div id='sidePanel'>
                    <div id='room'>Room: <span id='roomName'>{room}</span></div>
                    <p id='subHeading'>People in chatroom</p>
                    <Members members={members} />
                </div>
                <div id='chatContainer'>
                    <Messages 
                        messages={messages} 
                        email={email} 
                        deleteMessages={deleteMessages} 
                        checkboxes={checkboxes}
                        handleCheckboxChange={handleCheckboxChange}                            
                    />
                    <NewMessage sendMessage={sendMessage} isLoading={isLoading} 
                                handleEmitTyping={handleEmitTyping} handleEmitStopTyping={handleEmitStopTyping}
                                uploadImage={uploadImage}
                    />
                </div>
            </div>

            {modalContent.content !== '' && 
                <Modal 
                    showModal={showModal} 
                    closeModal={closeModal} 
                    modalContent={modalContent} 
                    callback={modalContent.type === 'DeleteAll' ? clearChat : deleteSelectedMessages}
                />
            }            
        </div>
    );
}

export default Chat;
