import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../SVG/Logo';
import './banner.css';

const Banner = ({ displayMenu, email, name, logout, roomId }) => {

    const appendRoomId = () => {
        return roomId ? '/' + roomId : '';
    }

    return (  
    <div className='banner'>
        <Logo width='80' height='40' />
        <p>{name ? 'Welcome ' + name : null}</p>
        {displayMenu && 
            <div id='menu'>
                <div id='bar1' className='bar'></div>
                <div id='bar2' className='bar'></div>
                <div id='bar3' className='bar'></div>
                <div className='menuContent'>
                    <Link className='menuLink' to={ '/updateProfile' + appendRoomId() }>Update Profile</Link>
                    <Link className='menuLink' to={ '/changePassword/' + email + '/' + name + appendRoomId() }>Change Password</Link>
                    <Link className='menuLink' to={ '/manageRooms' + appendRoomId() }>Manage Rooms</Link>
                    <div className='menuLink' onClick={logout}>Logout</div>
                </div>            
            </div>
        }
    </div>

    );
}
 
export default Banner;