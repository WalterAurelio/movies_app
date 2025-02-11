import { motion } from 'framer-motion';
import Input from './Input';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const LOGIN_URL = '/api/auth/login';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email, password }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      const formated = response as { data: { roles: [number], accessToken: string } };
      const roles = formated?.data?.roles;
      const accessToken = formated?.data?.accessToken;
      setAuth({ email, roles, accessToken });
      setEmail('');
      setPassword('');
      navigate('/home', { state: email });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
    >
      <Input
        icon={Mail}
        type='text'
        placeholder='Correo electrónico'
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <Input
        icon={Lock}
        type='password'
        placeholder='Contraseña'
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <motion.button>
        Iniciar sesión
      </motion.button>
    </motion.form>
  );
}
export default LoginForm;
