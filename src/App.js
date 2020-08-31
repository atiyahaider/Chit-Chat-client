import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

//components
import Home from './components/home/Home';
import Login from './components/login/Login';
import Register from './components/register/Register';
import ForgotPassword from './components/forgotPassword/ForgotPassword';
import ResetPassword from './components/resetPassword/ResetPassword';
import Rooms from './components/rooms/Rooms';
import Chat from './components/chat/Chat';
import UpdateProfile from './components/updateProfile/UpdateProfile';
import ChangePassword from './components/changePassword/ChangePassword';
import ManageRooms from './components/manageRooms/ManageRooms';
import NotFound from './components/notFound/NotFound';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div>
        <Switch>
          <Route exact path='/'><Home /></Route>
          <Route path='/login'><Login /></Route>
          <Route path='/register'><Register /></Route>
          <Route path='/forgotPassword'><ForgotPassword /></Route>
          <Route path='/resetPassword/:token'><ResetPassword /></Route>
          <Route path='/rooms'><Rooms /></Route>
          <Route path='/chat/:roomId'><Chat /></Route>
          <Route path='/updateProfile/:roomId?'><UpdateProfile /></Route>
          <Route path='/changePassword/:email/:name/:roomId?'><ChangePassword /></Route>
          <Route path='/manageRooms/:roomId?'><ManageRooms /></Route>
          <Route><NotFound /></Route>
        </Switch>    
      </div>
    </Router>
  );
}

export default App;