import { useState, useEffect } from 'react';

const useModal = (modalContent, setModalContent) => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (modalContent.content !== '') {
            setShowModal(true);
        }
    }, [modalContent]);

    const closeModal = () => {
        setShowModal(false);
        setModalContent({type: '', content: ''});    
    }

    return [showModal, closeModal];
}
 
export default useModal;