import React from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import './spinner.css';

const Spinner = ({loading}) => {
    return (
        <div className='loading'>
            <ClipLoader size={25} color={'#41747c'} loading={loading} />
        </div>
    );
}

export default Spinner;