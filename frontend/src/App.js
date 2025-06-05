import React, { useEffect, useState } from 'react';
import api from './api'; // seu axios configurado

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Erro ao chamar backend:', error);
        setMessage('Erro ao conectar com backend');
      });
  }, []);

  return (
    <div>
      <h1>Mensagem do backend:</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
