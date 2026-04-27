import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaHome,
  FaBoxes,
  FaIndustry,
  FaCogs,
  FaClipboardList
} from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import "./Sidebar.css";

function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  // Toggle dropdown (only one open at a time)
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Close all dropdowns
  const closeAll = () => {
    setOpenMenu(null);
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>OTSIL ERP</h2>
      </div>

      <ul className="menu">
        {/* Dashboard */}
        <li>
          <NavLink to="/" end onClick={closeAll}>
            <FaHome /> <span>Dashboard</span>
          </NavLink>
        </li>

        {/* OTSIL */}
        <li>
          <div className="dropdown-title" onClick={() => toggleMenu("otsil")}>
            <FaBoxes />
            <span>OTSIL</span>
            <MdKeyboardArrowDown
              className={`arrow ${openMenu === "otsil" ? "open" : ""}`}
            />
          </div>

          <div className={`submenu ${openMenu === "otsil" ? "show" : ""}`}>
            <NavLink to="/materials">Material</NavLink>
            <NavLink to="/stockin">Stock In</NavLink>
            <NavLink to="/stockout">Stock Out</NavLink>
            <NavLink to="/stock">Stock</NavLink>
          </div>
        </li>

        {/* VEOLIA */}
        <li>
          <div className="dropdown-title" onClick={() => toggleMenu("veolia")}>
            <FaIndustry />
            <span>VEOLIA</span>
            <MdKeyboardArrowDown
              className={`arrow ${openMenu === "veolia" ? "open" : ""}`}
            />
          </div>

          <div className={`submenu ${openMenu === "veolia" ? "show" : ""}`}>
            <NavLink to="/veolia-material">Material</NavLink>
            <NavLink to="/veolia-in">Stock In</NavLink>
            <NavLink to="/veolia-out">Stock Out</NavLink>
            <NavLink to="/veolia-stock">Stock</NavLink>
          </div>
        </li>

        {/* Other Sections */}
        <li>
          <NavLink to="/bankstock" onClick={closeAll}>
            <FaBoxes /> <span>Bank Stock</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/bom" onClick={closeAll}>
            <FaClipboardList /> <span>BOM</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/panel-check" onClick={closeAll}>
            <FaCogs /> <span>Panel Vs BOM</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/panelout" onClick={closeAll}>
            <FaIndustry /> <span>Panel Out</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/assets" onClick={closeAll}>
            <FaBoxes /> <span>Assets</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;