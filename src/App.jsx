import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Appx from "./Appx.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Appx />
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App;