import React from 'react';
import ReactModal from 'react-modal';

import './modal.css';

const Modal = ({showModal, closeModal, modalContent, callback}) => {
    return ( 
        <ReactModal
            isOpen={showModal}
            contentLabel="Error Message"
            onRequestClose={closeModal}
            shouldCloseOnOverlayClick={true}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: "rgb(238, 245, 246, 0.75)"
                },
                content: {
                    background: "#41747c",
                    width: '400px',
                    height: '150px',
                    padding: '5px',
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)'                            
                }
            }}
        >
            <div id='innerModalDiv'>
                <div id='closeDiv' onClick={closeModal}>
                    <p>{modalContent.type}</p>
                    <i id='close' className='fas fa-times' />
                </div>
                <div id='modalContent'>
                    <div id='modalText'>
                        <div>{ modalContent.content }
                        </div>
                    </div>
                    {(modalContent.type === 'DeleteAll' || modalContent.type === 'Delete') &&
                        <div className='modalButtons'>
                            <button onClick={callback}>Yes</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    }
                    {modalContent.type === 'Information' &&
                        <div className='modalButtons'>
                            <button onClick={callback}>OK</button>
                        </div>
                    }
                </div>
            </div>
        </ReactModal>
    );
}
 
export default Modal;