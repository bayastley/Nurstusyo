import StudioApp from "./StudioApp";

// God Mode yalnızca /admin girişinden, oturum belleğinde açılır.
// false = normal kullanıcılar kilitli modda başlar, admin giriş yapınca açılır
const isMasterSürüm = false;

export default function App() {
  return <StudioApp isMasterSürüm={isMasterSürüm} />;
}
