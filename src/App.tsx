import "./App.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import Tailwind from "primereact/passthrough/tailwind";
import { PrimeReactProvider } from "primereact/api";
import "primeicons/primeicons.css";
import { ActorsList } from "@containers/ActorsList/ActorsList";

function App() {
  return (
    <PrimeReactProvider value={{ pt: Tailwind }}>
      <ActorsList />
    </PrimeReactProvider>
  );
}

export default App;
