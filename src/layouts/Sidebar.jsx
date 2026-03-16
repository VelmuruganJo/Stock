import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar(){

const logout = ()=>{
localStorage.removeItem("login");
sessionStorage.removeItem("login");
window.location="/login";
}

return(

<div className="sidebar">

<div className="logo">
<h3>OTSIL ERP</h3>
</div>

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

<li>
<NavLink to="/uploadmaterials">
Upload Materials
</NavLink>
</li>

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

</ul>

<div className="logout-area">

<button
className="logout-btn"
onClick={logout}
>
Logout
</button>

</div>

</div>

)

}

export default Sidebar;