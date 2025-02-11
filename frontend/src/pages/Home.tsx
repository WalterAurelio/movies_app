import { useLocation } from 'react-router-dom';

function Home() {
  const { state } = useLocation();

  return <div>Bienvenido {state}</div>;
}

export default Home;
