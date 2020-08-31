import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../SVG/Logo';

import './home.css';

const Home = () => {
    return (
        <div className='container'>
            <h1 id='welcome' className='heading'>
                Welcome to <Logo width='110' height='50' />
            </h1>
            <p id='intro'>Join chatrooms and chat with people on various topics and interests,
               or create your own chatroom.</p>
            <p id='loginMsg'><Link to="/login"><button className='largeButton'>Login</button></Link>to start chatting</p>
            <p>Don't have an account yet? <Link to="/register">Register now</Link></p>
        </div>
    );
}

export default Home;