import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ButtonPage, Home, NavbarsPage, UIComponents } from "@/Pages";
import { Layout, Navbar } from "@/components/appComp";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="components" element={<UIComponents />}>
            <Route path="buttons" element={<ButtonPage />} />
            <Route path="navbars" element={<NavbarsPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
