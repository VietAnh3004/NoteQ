import { useState } from 'react'

function App() {
  return (
    <button onClick={() => {
        //
        fetch(`http://localhost:8080/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'testpassword'
            })
        }).then(res => res.json()).then(res => console.log(res))
    }}>Duma</button>  
  );
}

export default App
