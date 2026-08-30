import StudioApp from "./StudioApp";

// Production'da açık bırakılmaz. God Mode yalnızca /admin girişinden, oturum belleğinde açılır.
// Kilit durumu: true = tüm kilitler açık (geliştirme/test), false = normal kilitli mod
const isMasterSürüm = false;

export default function App() {
  return <StudioApp isMasterSürüm={isMasterSürüm} />;
}
