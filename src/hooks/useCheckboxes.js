import { useState } from 'react';

const useCheckboxes = (messages) => {
    const [deleteMessages, setDeleteMessages] = useState(false);
    const [selectMessages, setSelectMessages] = useState(false);
    const [checkboxes, setCheckboxes] = useState({});
    
    const showDeleteButtons = () => {
        //show checkboxes next to the messages
        setDeleteMessages(true);
        setCheckboxes( 
            messages.filter(msg => msg.email !== '' && msg.name !== '')    //get only user msgs and undeleted msgs
                    .reduce( (boxes, msg) => ({         //initialize all checkboxes to false
                        ...boxes,
                        [msg._id]: false
                    }), {} )
        )
    }

    const selectCheckboxes = (isSelected) => {         
        //check all the checkboxes next to the messages
        Object.keys(checkboxes).forEach(checkbox => {
            setCheckboxes(prevState => ({
                ...prevState,
                [checkbox]: isSelected
            }) )
        });
    }

    const handleSelectAll = () => {
        setSelectMessages(true);
        selectCheckboxes(true);
    }

    const handleDeselectAll = () => {
        setSelectMessages(false);
        selectCheckboxes(false);
    }

    const handleCancelDelete = () => {
        setDeleteMessages(false);
        selectCheckboxes(false);
    }

    const handleCheckboxChange = e => {
        let { id } = e.target;
        setCheckboxes(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }) );
    };

    const checkboxSelected = () => {         
        //check if a checkbox is selected, filter true values, return true if something is selected
        return Object.values(checkboxes).filter(checkbox => checkbox).length > 0;
    }

    return [deleteMessages, selectMessages, checkboxes, showDeleteButtons, handleSelectAll, handleDeselectAll, handleCancelDelete, handleCheckboxChange, checkboxSelected] ;
}
 
export default useCheckboxes;
