import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Hook to navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Validate phone number
    const phoneRegex = /^\d+$/; // Regex to check if the phone number contains only digits
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage('Số điện thoại chỉ được chứa số.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname,
          username,
          email,
          phoneNumber,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setErrorMessage('');

        // Redirect to SignIn page after 3 seconds
        setTimeout(() => {
          navigate('/sign-in');
        }, 1500);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi khi đăng ký!');
    }
  };

  return (
    <div className="sign-up-container" style={styles.container}>
      <h1 style={styles.title}>Đăng ký</h1>
      <p>
        Hoặc <Link to="/sign-in" style={{ textDecoration: 'underline', fontWeight: 'bold', color: '#555' }}>đăng nhập vào tài khoản đã có</Link>
      </p>

      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="username">Tên người dùng</label>
            <input
              style={styles.input}
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="fullname">Họ và tên</label>
            <input
              style={styles.input}
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="phoneNumber">Số điện thoại</label>
            <input
              style={styles.input}
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              style={styles.input}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Vai trò</label>
            <select
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Học viên</option>
              <option value="instructor">Giảng viên</option>
            </select>
          </div>
          
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

          <button type="submit" style={styles.button}>Đăng ký</button>
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
    height: '150vh',
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

export default SignUp;
