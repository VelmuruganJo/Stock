import { Routes, Route } from "react-router-dom";
// import { Routes, Route } from "react-router-dom";

import Sidebar from "./layouts/Sidebar.jsx";
import Header from "./pages/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Materials from "./pages/Materials.jsx";
import Stock from "./pages/Stock.jsx";
import StockIn from "./pages/StockIn.jsx";
import StockOut from "./pages/StockOut.jsx";
import UploadMaterials from "./pages/UploadMaterials.jsx";

// ✅ IMPORT VEOLIA PAGES
import VeoliaMaterial from "./pages/VeoliaMaterial.jsx";
import VeoliaStockIn from "./pages/VeoliaStockIn.jsx";
import VeoliaStockOut from "./pages/VeoliaStockOut.jsx";
import VeoliaStock from "./pages/VeoliaStock.jsx";
import BankStock from "./pages/BankStock.jsx";
import Assets from "./pages/Assets.jsx";
import Panel from "./pages/Panel.jsx";
import PanelOut from "./pages/PanelOut.jsx";
import PanelNew from "./pages/PanelNew";
import PanelCheck from "./pages/PanelCompare.jsx";
import PanelBOM from "./pages/PanelBOM.jsx";

function Appx(){

return(

<div>

<Header/>

<div style={{display:"flex"}}>

<Sidebar/>

<div style={{flex:1,padding:"20px"}}>

<Routes>

{/* MAIN MODULE */}
<Route path="/" element={<Dashboard />} />
<Route path="/materials" element={<Materials />} />
<Route path="/stock" element={<Stock />} />
<Route path="/stockin" element={<StockIn />} />
<Route path="/stockout" element={<StockOut />} />
<Route path="/uploadmaterials" element={<UploadMaterials />} />

{/* ✅ VEOLIA MODULE */}
<Route path="/veolia-material" element={<VeoliaMaterial />} />
<Route path="/veolia-in" element={<VeoliaStockIn />} />
<Route path="/veolia-out" element={<VeoliaStockOut />} />
<Route path="/veolia-stock" element={<VeoliaStock />} />
<Route path="/bankstock" element={<BankStock />} />
<Route path="/Assets" element={<Assets />} />
<Route path="/Panel" element={<Panel />} />
<Route path="/panelOut" element={<PanelOut />} />
<Route path="/panel-new" element={<PanelNew />} />
<Route path="/panel-check" element={<PanelCheck/>}/>
<Route path="/bom" element={<PanelBOM />} />

</Routes>

</div>

</div>

</div>

)

}

export default Appx;