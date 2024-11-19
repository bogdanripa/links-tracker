import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthService} from '@genezio/auth';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');

    const logout = async () => {
        try {
          // Logout the user
          await AuthService.getInstance().logout();
          navigate('/login');
        } catch (error) {
          console.error(error);
        }
    }

    useEffect(() => {
        if (name) {
          return;
        }
    
        AuthService.getInstance().userInfo().then((user) => {
          setName(user.name!);
        }).catch((error) => {
          navigate('/login');
          console.error(error);
        })
      }, []);
    
    return (
        <header className="header">
            <div className="app-name" onClick={() => {navigate('/')}}>Link Sharing App</div>
            <div className="user-info">
                <span className="user-name">{name}</span>
                <button className="logout-button" onClick={logout}>Logout</button>
            </div>
        </header>
    );
}

export default Header;