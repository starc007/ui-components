import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ButtonPage, Home } from "@/Pages";
import { Layout, Navbar } from "@/components/appComp";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route path="buttons" element={<ButtonPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
