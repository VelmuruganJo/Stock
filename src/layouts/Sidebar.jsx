import { NavLink } from "react-router-dom";
import { useState } from "react";
import { FaHome, FaWarehouse } from "react-icons/fa";
import { MdInventory } from "react-icons/md";
import "./Sidebar.css";

function Sidebar() {
  const [otsilOpen, setOtsilOpen] = useState(false);
  const [veoliaOpen, setVeoliaOpen] = useState(false);

  // Close all dropdowns (ONLY for outside links)
  const closeAllDropdowns = () => {
    setOtsilOpen(false);
    setVeoliaOpen(false);
  };

  // Toggle dropdowns (only one open)
  const toggleOtsil = () => {
    setOtsilOpen(!otsilOpen);
    setVeoliaOpen(false);
  };

  const toggleVeolia = () => {
    setVeoliaOpen(!veoliaOpen);
    setOtsilOpen(false);
  };

  return (
    <div className="sidebar">
      {/* <div className="logo">
        <h2>OTSIL ERP</h2>
      </div> */}

      <ul className="menu">
        {/* Dashboard */}
        <li>
          <NavLink to="/" end onClick={closeAllDropdowns}>
            <FaHome /> <span>Dashboard</span>
          </NavLink>
        </li>

        {/* OTSIL */}
        <li>
          <div className="dropdown-title" onClick={toggleOtsil}>
            <MdInventory />
            <span>OTSIL</span>
            <span className={`arrow ${otsilOpen ? "open" : ""}`}>▾</span>
          </div>

          <div className={`submenu ${otsilOpen ? "show" : ""}`}>
            <NavLink to="/materials">Material</NavLink>
            <NavLink to="/stockin">In</NavLink>
            <NavLink to="/stockout">Out</NavLink>
            <NavLink to="/stock">Stock</NavLink>
          </div>
        </li>

        {/* VEOLIA */}
        <li>
          <div className="dropdown-title" onClick={toggleVeolia}>
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

        {/* Outside links → close dropdown */}
        <li>
          <NavLink to="/Bankstock" onClick={closeAllDropdowns}>
            <FaWarehouse /> <span>Bank Stock</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/Panel" onClick={closeAllDropdowns}>
            <FaWarehouse /> <span>Panel</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/PanelOut" onClick={closeAllDropdowns}>
            <FaWarehouse /> <span>Panel Out</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/Assets" onClick={closeAllDropdowns}>
            <FaWarehouse /> <span>Assets</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;