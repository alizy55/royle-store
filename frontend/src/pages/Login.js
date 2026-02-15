import React, {
    useState
} from 'react';
import {
    useDispatch
} from 'react-redux';
import {
    setCredentials
} from '../store/slices/authSlice';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('customer@royalstore.com');
    const [password, setPassword] = useState('Customer@123');
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log('Sending login request...');

            const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
                email,
                password
            });

            const data = response.data;

            if (data.success && data.token) {
                dispatch(setCredentials({
                    user: data.user,
                    token: data.token
                }));

                if (data.user.role === 'admin') {
                    window.location.href = 'http://127.0.0.1:3001/admin';
                } else if (data.user.role === 'seller') {
                    window.location.href = 'http://127.0.0.1:3001/seller';
                } else {
                    window.location.href = 'http://127.0.0.1:3001/customer';
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Cannot connect to server. Make sure backend is running on port 5000');
        }
    };

    // Rest of the component remains exactly the same...
    return ( <
        div style = {
            styles.container
        } >
        <
        div style = {
            styles.card
        } >
        <
        h2 style = {
            styles.title
        } > Login to Royal Store < /h2>

        {
            error && < div style = {
                    styles.error
                } > {
                    error
                } < /div>}

                <
                form onSubmit = {
                    handleSubmit
                } >
                <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > Email: < /label> <
                input
            type = "email"
            value = {
                email
            }
            onChange = {
                (e) => setEmail(e.target.value)
            }
            style = {
                styles.input
            }
            required
                /
                >
                <
                /div>

                <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > Password: < /label> <
                input
            type = "password"
            value = {
                password
            }
            onChange = {
                (e) => setPassword(e.target.value)
            }
            style = {
                styles.input
            }
            required
                /
                >
                <
                /div>

                <
                button type = "submit"
            style = {
                    styles.button
                } >
                Login <
                /button> <
                /form>

                <
                div style = {
                    styles.testAccounts
                } >
                <
                p > < strong > Test Accounts: < /strong></p >
                <
                button onClick = {
                    () => {
                        setEmail('admin@royalstore.com');
                        setPassword('Admin@123');
                    }
                }
            style = {
                    styles.testBtn
                } > Admin < /button> <
                button onClick = {
                    () => {
                        setEmail('seller@royalstore.com');
                        setPassword('Seller@123');
                    }
                }
            style = {
                    styles.testBtn
                } > Seller < /button> <
                button onClick = {
                    () => {
                        setEmail('customer@royalstore.com');
                        setPassword('Customer@123');
                    }
                }
            style = {
                    styles.testBtn
                } > Customer < /button> <
                /div> <
                /div> <
                /div>
        );
    }

    // Keep all styles exactly as they were
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        },
        card: {
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            width: '350px'
        },
        title: {
            textAlign: 'center',
            marginBottom: '30px',
            color: '#333'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            color: '#555'
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
        },
        error: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
        },
        testAccounts: {
            marginTop: '30px',
            textAlign: 'center'
        },
        testBtn: {
            margin: '5px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }
    };

    export default Login;