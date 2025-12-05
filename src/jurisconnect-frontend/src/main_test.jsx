import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

console.log('Main.jsx running');
console.log('React:', typeof React);
console.log('ReactDOM:', typeof ReactDOM);

// Teste simples
const TestApp = () => {
    console.log('TestApp rendering');
    return (
        <div style={{ padding: '20px', background: 'red', color: 'white' }}>
            <h1>TESTE - Se você vê isso, o React está funcionando!</h1>
            <p>Data: {new Date().toLocaleString()}</p>
        </div>
    );
};

try {
    const root = document.getElementById('root');
    console.log('Root element:', root);

    if (root) {
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                <BrowserRouter>
                    <TestApp />
                </BrowserRouter>
            </React.StrictMode>
        );
        console.log('React render called successfully');
    } else {
        console.error('Root element not found!');
    }
} catch (error) {
    console.error('Error during render:', error);
    document.body.innerHTML = `<h1 style="color: red;">ERROR: ${error.message}</h1><pre>${error.stack}</pre>`;
}
