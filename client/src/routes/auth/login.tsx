import React, {useState} from 'react';
import "../styles.css";
import {useNavigate} from 'react-router-dom';
import {AuthService, ErrorCode} from '@genezio/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);

    try {
      await AuthService.getInstance().login(email, password);
      navigate("/");
    } catch (error: any) {
      switch(error.code) {
        case ErrorCode.INCORRECT_EMAIL_OR_PASSWORD:
          alert('Incorrect email or password');
          break;
        case ErrorCode.EMAIL_NOT_VERIFIED:
          alert('Email address not verified. Please check your inbox to verify your email');
          break;
        default:
          alert('Login Failed');
        }
    }
    setLoginLoading(false);
  };

  return (
    <div className="center">
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="actions">
          <label>
            <a href="/forgot-password">Forgot password?</a>
          </label>
          <button type="submit">
            {loginLoading ? "Loading..." : "Login"}
          </button>
          <button onClick={() => navigate('/signup')}>Create</button>
        </div>
      </form>
    </div>
  );
};

export default Login;