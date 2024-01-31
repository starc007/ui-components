import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/appComp/Navbar";
import { Home } from "@/Pages";
import { Layout } from "@/components/appComp/Layout";

const App = () => {
  return (
    <Layout>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
};

export default App;
