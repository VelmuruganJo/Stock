import { NavLink } from "react-router-dom";
import { useState } from "react";
import { FaHome, FaBoxes, FaWarehouse, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { MdInventory } from "react-icons/md";
import "./Sidebar.css";

function Sidebar() {

  const [veoliaOpen, setVeoliaOpen] = useState(false);

  return (
    <div className="sidebar">

      <div className="logo">
        <h2>OTSIL ERP</h2>
      </div>

      <ul className="menu">

        <li>
          <NavLink to="/" end>
            <FaHome /> <span>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/materials">
            <FaBoxes /> <span>Materials</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/stock">
            <FaWarehouse /> <span>Current Stock</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/stockin">
            <FaArrowDown /> <span>Stock In</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/stockout">
            <FaArrowUp /> <span>Stock Out</span>
          </NavLink>
        </li>

        {/* VEOLIA */}
        <li>
          <div 
            className="dropdown-title"
            onClick={() => setVeoliaOpen(!veoliaOpen)}
          >
            <MdInventory /> 
            <span>VEOLIA</span>
            <span className={`arrow ${veoliaOpen ? "open" : ""}`}>▾</span>
          </div>

          <div className={`submenu ${veoliaOpen ? "show" : ""}`}>
            <NavLink to="/veolia-material">Material</NavLink>
            <NavLink to="/veolia-in">In</NavLink>
            <NavLink to="/veolia-out">Out</NavLink>
            <NavLink to="/veolia-stock">Stock</NavLink>
          </div>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;