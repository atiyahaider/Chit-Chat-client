import React, { useState, useEffect, useRef } from 'react';
import './newRoom.css';

const NewRoom = ({createNewRoom, isLoading}) => {
    const [room, setRoom] = useState('');
    const btnRef = useRef();

    useEffect(() => {
        if(!isLoading) {
            //enable button again
            if(btnRef.current) {
                btnRef.current.removeAttribute('disabled');
            }
        }
    });

    const handleCreateRoom = e => {
        e.preventDefault();
        //disable button
        if(btnRef.current) {
            btnRef.current.setAttribute('disabled', 'disabled');
        }

        createNewRoom(room);
        setRoom('');
    }

    return (  
        <div id="newRoomDiv">
            <form>
                <input id='newRoom' type='text' value={room} onChange={e=>setRoom(e.target.value)} />
                <button className='smallButton' ref={btnRef} onClick={handleCreateRoom}>New Chatroom</button>
            </form>
        </div>
    );
}
 
export default NewRoom;