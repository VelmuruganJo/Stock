import { Routes, Route } from "react-router-dom";

import Sidebar from "./layouts/Sidebar.jsx";
import Header from "./pages/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Materials from "./pages/Materials.jsx";
import Stock from "./pages/Stock.jsx";
import StockIn from "./pages/StockIn.jsx";
import StockOut from "./pages/StockOut.jsx";
import UploadMaterials from "./pages/UploadMaterials.jsx";

function Appx(){

return(

<div>

<Header/>

<div style={{display:"flex"}}>

<Sidebar/>

<div style={{flex:1,padding:"20px"}}>

<Routes>

<Route path="/" element={<Dashboard />} />

<Route path="/materials" element={<Materials />} />

<Route path="/stock" element={<Stock />} />

<Route path="/stockin" element={<StockIn />} />

<Route path="/stockout" element={<StockOut />} />

<Route path="/uploadmaterials" element={<UploadMaterials />} />

</Routes>

</div>

</div>

</div>

)

}

export default Appx;