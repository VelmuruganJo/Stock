import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

function Sidebar(){

const [veoliaOpen, setVeoliaOpen] = useState(false);

// const logout = () => {
//   localStorage.removeItem("token");
//   sessionStorage.removeItem("token");
//   window.location = "/login";
// };

return(

<div className="sidebar">

{/* <div className="logo">
<h3>OTSIL ERP</h3>
</div> */}

<ul className="menu">

<li>
<NavLink to="/" end>
Dashboard
</NavLink>
</li>

<li>
<NavLink to="/materials">
Materials
</NavLink>
</li>

{/* <li>
<NavLink to="/uploadmaterials">
Upload Materials
</NavLink>
</li> */}

<li>
<NavLink to="/stock">
Current Stock
</NavLink>
</li>

<li>
<NavLink to="/stockin">
Stock In
</NavLink>
</li>

<li>
<NavLink to="/stockout">
Stock Out
</NavLink>
</li>

{/* VEOLIA DROPDOWN */}
<li>
<div 
className="dropdown-title"
onClick={() => setVeoliaOpen(!veoliaOpen)}
>
VEOLIA ▾
</div>

{veoliaOpen && (
<ul className="submenu">

<li>
<NavLink to="/veolia-material">
MATERIAL
</NavLink>
</li>

<li>
<NavLink to="/veolia-in">
IN
</NavLink>
</li>

<li>
<NavLink to="/veolia-out">
OUT
</NavLink>
</li>

<li>
<NavLink to="/veolia-stock">
STOCK
</NavLink>
</li>

</ul>
)}

</li>

</ul>

{/* <div className="logout-area"><button
className="logout-btn"
onClick={logout}
>
Logout
</button></div> */}

</div>

)

}

export default Sidebar;