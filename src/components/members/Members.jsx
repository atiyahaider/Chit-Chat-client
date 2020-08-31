import React from 'react';
import PulseLoader from "react-spinners/PulseLoader";
import './members.css';

const Members = ({ members }) => {
    return (  
        <div id='peopleList'>
            <ul>
                {members ? 
                    members.map((e, i) => 
                        <li key={i}>
                            <div>{e.name}</div>
                            {e.typing !== '' && <div><PulseLoader size={6} color={'#bfbfbf'} /></div> }
                            {e.status !== '' && <div id='status'></div>}
                        </li>
                    ) 
                    : null
                }                        
            </ul>
        </div>
    );
}
 
export default React.memo(Members);