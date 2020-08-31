import { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import { BASE_URL, LOCAL_STORAGE } from '../constants';

const useSocket = (setSessionError, setNoOfMsgs) => {
    const [room, setRoom] = useState('');
    const [userRooms, setUserRooms] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef();

  useEffect(() => {
        const token = localStorage.getItem(LOCAL_STORAGE);
        socketRef.current = socketIOClient(BASE_URL, {
            query: {token}
        });

        socketRef.current.on('error', err => {
            setSessionError(err);
        });

        socketRef.current.on('loginMember', (email, name) => {
            setMembers(members => {
                let index = members.findIndex( e => e.email === email);
                if ( index !== -1)  
                    return [...members.slice(0, index), 
                            {email, name, typing: '', status: 'online'},
                            ...members.slice(index + 1)];
                else
                    return [...members];

            })
        });

        socketRef.current.on('setMember', (email, name) => {
            setMembers(members => {
                let index = members.findIndex( e => e.email === email);
                if ( index === -1)  
                    return [...members, {email, name, status: 'online'}];
                else    //if member already enrolled in the room, but was offline, update status to online
                    return [...members.slice(0, index), 
                               {email, name, typing: '', status: 'online'},
                            ...members.slice(index + 1)];
            })
        });

        socketRef.current.on('logoutMember', (email, name) => {
            setMembers(members => {
                let index = members.findIndex( e => e.email === email);
                //if member already enrolled in a room, update status as logged out
                if ( index !== -1)  {
                    return [...members.slice(0, index), 
                            {email, name, typing: '', status: ''},
                            ...members.slice(index + 1)];
                }
                else
                    return [...members];
            })
        });

        socketRef.current.on('typing', (email, name) => {
            setMembers(members => {
                let index = members.findIndex( e => e.email === email);
                //if member already enrolled in a room, update status to typing
                if ( index !== -1)  {
                    let status = members[index].status;
                    return [...members.slice(0, index), 
                            {email, name: name, typing: '...', status},
                            ...members.slice(index + 1)];
                }
                else
                    return [...members];
            })
        });

        socketRef.current.on('stopTyping', (email, name) => {
            setMembers(members => {
                let index = members.findIndex( e => e.email === email);
                //if member already enrolled in a room, update status to typing
                if ( index !== -1)  {
                    let status = members[index].status;
                    return [...members.slice(0, index), 
                            {email, name, typing: '', status},
                            ...members.slice(index + 1)];
                }
                else
                    return [...members];
            })
        });

        socketRef.current.on('showNewMessage', message => {
            setMessages(messages => [...messages, message]);
            if (message.email !== '')
                setNoOfMsgs(prev => prev + 1);
        });

        socketRef.current.on('deleteMessages', deletedMessages => {
            setMessages(messages => {
                            let msgCopy = messages.map(msg => {
                                //Change the text of all deleted messages
                                if (deletedMessages.includes(msg._id)) {
                                    return ({...msg, name: '', message: 'This message has been deleted', date: '', type: 'txt'});
                                }
                                else
                                    return msg;
                            });
                        return msgCopy;
            });

            setNoOfMsgs(prev => prev - deletedMessages.length);
        });

        socketRef.current.on('userRoomAdded', (room) => {
            setUserRooms(rooms => [...rooms, room]);
        });

        socketRef.current.on('roomAdded', (room) => {
            setRooms(rooms => [...rooms, room]);
        });

        socketRef.current.on('userRoomDeleted', (roomId) => {
            setUserRooms(rooms => {
                let index = rooms.findIndex( e => e._id === roomId);
                if (index !== -1)  
                    return [...rooms.slice(0, index), 
                            ...rooms.slice(index + 1)];
                else
                    return [...rooms]; 
            })
        });

        socketRef.current.on('roomDeleted', (roomId) => {
            setRooms(rooms => {
                let index = rooms.findIndex( e => e._id === roomId);
                if (index !== -1)  
                    return [...rooms.slice(0, index), 
                            ...rooms.slice(index + 1)];
                else
                    return [...rooms]; 
            })
        });

        socketRef.current.on('roomNameChange', (roomId, name) => {
            setRoom(name);
            setUserRooms(rooms => {
                let index = rooms.findIndex( e => e._id === roomId);
                if (index !== -1)  
                    return [...rooms.slice(0, index), 
                            {...rooms[index], room: name},
                            ...rooms.slice(index + 1)];
                else
                    return [...rooms]; 
            });
            setRooms(rooms => {
                let index = rooms.findIndex( e => e._id === roomId);
                if (index !== -1)  
                    return [...rooms.slice(0, index), 
                            {...rooms[index], room: name},
                            ...rooms.slice(index + 1)];
                else    
                    return [...rooms];
            })
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [setSessionError, setNoOfMsgs]);

    const broadcastLogin = (email, name) => {
        socketRef.current.emit('login', email, name);
    };

    const joinRoom = (roomId, email, name) => {
        socketRef.current.emit('joinRoom', roomId, email, name);
    };

    const leaveRoom = (roomId, name) => {
        return new Promise((resolve) => 
            socketRef.current.emit('leaveRoom', roomId, name, () => {
                    resolve();
            })
        )
    };

    const emitTyping = (roomId, email, name) => {
        socketRef.current.emit('typing', roomId, email, name);
    };

    const emitStopTyping = (roomId, email, name) => {
        socketRef.current.emit('stopTyping', roomId, email, name);
    };

    const emitMessage = message => {
        console.log(message)
        return new Promise((resolve, reject) => 
            socketRef.current.emit('newMessage', message, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    const emitClearChat = roomId => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('clearChat', roomId, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    const emitDeleteMessages = (roomId, messages) => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('deleteMessages', roomId, messages, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    const emitLogout = (roomId, email, name) => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('logout', roomId, email, name, error => {
                if (error) {
                    reject(error);
                }
                else {
                    localStorage.removeItem(LOCAL_STORAGE);
                    resolve();
                }
            })
        )
    };

    const broadcastOffline = offline => {
        socketRef.current.emit('offline', offline);
    };

    const emitNewRoom = (room) => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('addRoom', room, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    const emitEdittedRoomName = (roomId, room) => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('updateRoomName', roomId, room, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    const emitDeleteRoom = (roomId) => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('deleteRoom', roomId, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    const updateProfile = (email, name) => {
        return new Promise((resolve, reject) => 
            socketRef.current.emit('updateProfile', email, name, error => {
                if (error) 
                    reject(error);
                else 
                    resolve();
            })
        )
    };

    return { room, setRoom, userRooms, setUserRooms, rooms, setRooms, members, setMembers, messages, setMessages, 
             broadcastLogin, joinRoom, leaveRoom, emitTyping, emitStopTyping, emitMessage, emitClearChat, emitDeleteMessages, 
             emitLogout, broadcastOffline,
             emitNewRoom, emitEdittedRoomName, emitDeleteRoom, updateProfile };
};

export default useSocket;