import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return ( <
                div style = {
                    styles.container
                } >
                <
                div style = {
                    styles.card
                } >
                <
                h1 style = {
                    styles.title
                } > Something went wrong < /h1> <
                p style = {
                    styles.message
                } > {
                    this.state.error?.message || 'An unexpected error occurred'
                } < /p> <
                button onClick = {
                    () => window.location.reload()
                }
                style = {
                    styles.button
                } >
                Reload Page <
                /button> <
                /div> <
                /div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
    },
    title: {
        color: '#e74c3c',
        marginBottom: '20px'
    },
    message: {
        color: '#666',
        marginBottom: '30px'
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    }
};

export default ErrorBoundary;