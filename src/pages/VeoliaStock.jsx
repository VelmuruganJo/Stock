import { useEffect, useState } from "react";
import API from "../api";
import "./style/common.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function VeoliaStock() {

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/veolia-stock")
      .then(res => {
        setData(res.data || []);
        setFiltered(res.data || []);
      });
  }, []);

  // 🔍 SEARCH
  const handleSearch = (val) => {
    setSearch(val);

    if (val.trim() === "") {
      setFiltered(data);
      return;
    }

    const result = data.filter(item =>
      Object.values(item).some(v =>
        String(v).toLowerCase().includes(val.toLowerCase())
      )
    );

    setFiltered(result);
  };

  // 📊 EXPORT EXCEL
  const exportExcel = () => {
    const excelData = filtered.map((s, i) => ({
      "Sl No": i + 1,
      "Material Code": s.materialCode,
      "Description": s.materialName,
      "Available Stock": s.currentStock
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "VeoliaStock");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([buffer], {
      type: "application/octet-stream"
    });

    saveAs(file, "VeoliaStock.xlsx");
  };

  return (

    <div className="stock-page">

      <h2>Veolia Current Stock</h2>

      {/* TOP BAR */}
      <div className="top-bar">

        <input
          type="text"
          placeholder="Search Material..."
          className="search-input"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <button className="btn-export" onClick={exportExcel}>
          Export Excel
        </button>

      </div>

      <table className="stock-table">

        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Material Code</th>
            <th>Description</th>
            <th>Available Stock</th>
          </tr>
        </thead>

        <tbody>

          {filtered.length > 0 ? (
            filtered.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{s.materialCode}</td>
                <td>{s.materialName}</td>
                <td>{s.currentStock}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "red" }}>
                No Stock Found
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}

export default VeoliaStock;