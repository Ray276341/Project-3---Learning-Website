import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Đăng nhập thành công!');
        setErrorMessage('');

        // Remove old token if it exists
        localStorage.removeItem('token');

        // Store the new token in local storage
        localStorage.setItem('token', data.token);

        // Set a timer to remove the token after 2 hours
        setTimeout(() => {
          localStorage.removeItem('token');
          console.log('Token đã hết hạn và đã được xóa khỏi local storage.');
        }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds

        // Redirect to the profile page after login
        navigate('/dashboard');
      } else {
        setErrorMessage(data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi khi đăng nhập!');
      setSuccessMessage('');
    }
  };

  return (
    <div className="sign-in-container" style={styles.container}>
      <h1 style={styles.title}>Đăng nhập</h1>
      <p>
        Hoặc <Link to="/sign-up" style={{ textDecoration: 'underline', fontWeight: 'bold', color: '#555' }}>đăng ký tài khoản mới</Link>
      </p>
      
      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="identifier">Tên người dùng / Email / Số điện thoại</label>
            <input
              style={styles.input}
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Mật khẩu</label>
            <input
              style={styles.input}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          
          <button type="submit" style={styles.button}>Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

// Basic inline styles for simplicity
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    boxSizing: 'border-box',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontSize: '18px',
    color: '#555',
    textAlign: 'left',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#0f766e',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default SignIn;
