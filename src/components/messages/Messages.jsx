import React, { useEffect, useRef } from 'react';
import { formatDate } from '../../utils/formatDate';
import {emojify} from 'react-emojione';
import { EmojiOptions } from '../../constants';
import ReactTextFormat from 'react-text-format';
import './messages.css';


const Messages = ({ messages, email, deleteMessages, checkboxes, handleCheckboxChange }) => {
    const chatRef = useRef();
    useEffect(() => {
        if (!deleteMessages)
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
    })

    return (  
        <div id='chats' ref={chatRef}>
            {messages ? 
                messages.map( (msg, i) => 
                    <div className='chat' key={msg._id}>
                        {(deleteMessages && msg.email !== '' && msg.name !== '') && 
                            <input  type='checkbox' id={msg._id} 
                                    className={msg.email === email ? 'myCheckbox' : 'chatCheckbox'} 
                                    checked={checkboxes[msg._id]}
                                    onChange={handleCheckboxChange}
                            />
                        }
                        <div className={'message' + (msg.email === email ? ' myMessage' : msg.email === '' ? ' adminMessage' : ' chatMessage')}>
                            {(msg.name !== '' && msg.date !== '') && 
                                <p className='credentials'>{msg.name}, {formatDate(msg.date)}</p>                                
                            }
                            <p className={'messageContent' + (msg.name === '' && msg.date === '' ? ' messageDeleted' : '')}>
                                { msg.type === 'txt' &&
                                    <ReactTextFormat allowedFormats={['URL', 'Email', 'Image']} linkTarget='_blank'>
                                        {emojify(msg.message, EmojiOptions)}
                                    </ReactTextFormat>
                                }
                                { msg.type === 'image' &&
                                    <img src={msg.message} alt=''/>
                                }
                                { msg.type === 'video' &&
                                    <video src={msg.message} controls></video>
                                }
                            </p>
                        </div>
                    </div>
                )
                : null
            }                        
        </div>
    );
}
 
export default React.memo(Messages);