import React, { useState, useEffect, useRef, Fragment } from 'react';
import {emojify} from 'react-emojione';
import { EmojiOptions } from '../../constants';
import data from 'emoji-mart/data/apple.json';
import { NimblePicker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import './newMessage.css';
//import ContentEditable from "react-contenteditable";
//import ContentEditable from './ContentEditable';

const NewMessage = ({ sendMessage, isLoading, handleEmitTyping, handleEmitStopTyping, uploadImage }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const sendBtnRef = useRef();
    const imageFileRef = useRef();
    const imageBtnRef = useRef();
    let typingTimer;
    const timeOut = 1000;

    useEffect(() => {
        if(!isLoading) {
            //enable send button again
            if(sendBtnRef.current) 
                sendBtnRef.current.removeAttribute('disabled');
        }
    });
    
    const handleTyping = (e) => {
        clearTimeout(typingTimer);
        handleEmitTyping();
    }

    const handleStopTyping = (e) => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            handleEmitStopTyping();
        }, timeOut)
    }

    const handleSendMessage = e => {
        e.preventDefault();
        //disable button
        if(sendBtnRef.current) {
            sendBtnRef.current.setAttribute('disabled', 'disabled');
        }

        setShowEmojiPicker(false);
        sendMessage(message);
        setMessage('');
    }

    const getFileName = e => {
        if (e.target.files[0])
            uploadImage(e.target.files[0]);
    }

    const handleUploadImage = e => {
        e.preventDefault();
        //force click of the input
        if(imageBtnRef.current) 
            imageFileRef.current.click();
    }

    const addEmoji = emoji => {
        setMessage(prev => prev + emoji.native);
    }

    return (  
        <div>
            <form id='messageForm'>
                <input id='message' type='text' value={message} 
                       onChange={e => setMessage(e.target.value)} 
                       onKeyPress={handleTyping}
                       onKeyUp={handleStopTyping}
                       onClick={() => setShowEmojiPicker(false)}/>

                {/* <ContentEditable id='message' html={message} onBlur={handleBlur} onChange={handleChange} onFocus={() => setShowEmojiPicker(false)}/> */}

                <button className='icon' ref={sendBtnRef} onClick={handleSendMessage}>
                    <i className="fas fa-paper-plane"></i>
                </button>

                <input type='file' onChange={getFileName} accept='image/*' style={{display: 'none'}} ref={imageFileRef}/>
                <button className='icon' ref={imageBtnRef} onClick={handleUploadImage}>
                    <i className="fas fa-paperclip"></i>
                </button>

                {showEmojiPicker ? (
                    <Fragment>
                        <span className='emojiPicker'>
                            <NimblePicker set='apple' data={data}
                                onSelect={addEmoji}
                                perLine={6}
                                emojiSize={20}
                                showPreview={false}
                                showSkinTones={false}
                                />
                        </span>
                        <p className='icon emojiButton' onClick={() => setShowEmojiPicker(false)}>
                            <i className="fas fa-keyboard"></i>
                        </p>
                    </Fragment>
                ) : (
                    <p className='emojiButton' onClick={() => setShowEmojiPicker(true)}>
                        {emojify(':)', EmojiOptions)}
                    </p>
                )}
            </form>
        </div>
    );
}
 
export default NewMessage;