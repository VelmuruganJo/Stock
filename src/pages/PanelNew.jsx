import { useEffect, useState } from "react";
import API from "../api";
import "./style/common.css";
import { data } from "react-router-dom";

function PanelNew() {

  const [otsil, setOtsil] = useState([]);
  const [veolia, setVeolia] = useState([]);
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [otsilRes, veoliaRes, panelRes] = await Promise.all([
        API.get("/currentstock"),
        API.get("/veolia-stock"),
        API.get("/panel")
      ]);

      setOtsil(otsilRes.data || []);
      setVeolia(veoliaRes.data || []);
      setPanels(panelRes.data || []);

    } catch (err) {
      console.error(err);
    }
  };
  console.log(panels,data);

  return (
    <div className="stock-page">

      <h2>Master Data View</h2>

      {/* ================= OTSIL ================= */}
      <h3>OTSIL Materials</h3>
      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {otsil.map((m, i) => (
              <tr key={i}>
                <td>{m.materialCode}</td>
                <td>{m.materialName}</td>
                <td>{m.currentStock}</td>
                <td>₹ {Number(m.totalValue || 0).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= VEOLIA ================= */}
      <h3 style={{ marginTop: "30px" }}>Veolia Materials</h3>
      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {veolia.map((m, i) => (
              <tr key={i}>
                <td>{m.materialCode}</td>
                <td>{m.materialName}</td>
                <td>{m.currentStock}</td>
                <td>₹ {Number(m.totalValue || 0).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PANELS ================= */}
      <h3 style={{ marginTop: "30px" }}>Panels</h3>
      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Panel Serial</th>
              <th>Project</th>
              <th>PO Number</th>
              <th>Model</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {panels.map((p, i) => (
              <tr key={i}>
                <td>{p.panelSerialNumber}</td>
                <td>{p.projectName}</td>
                <td>{p.poNumber || "-"}</td>
                <td>{p.model}</td>
                <td>{p.totalValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default PanelNew;