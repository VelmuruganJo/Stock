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

  // 🔥 GRAND TOTAL
  const grandTotal = filtered.reduce(
    (sum, s) => sum + (s.totalValue || 0),
    0
  );

  // 📊 EXPORT EXCEL
  const exportExcel = () => {

    const excelData = filtered.map((s, i) => ({
      "Sl No": i + 1,
      "Material Code": s.materialCode,
      "Description": s.materialName,
      "Available Stock": s.currentStock,
      "Price": s.price,
      "Total Value": s.totalValue
    }));

    // ADD GRAND TOTAL ROW
    excelData.push({
      "Sl No": "",
      "Material Code": "",
      "Description": "GRAND TOTAL",
      "Available Stock": "",
      "Price": "",
      "Total Value": grandTotal
    });

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

      <div className="table-container">

        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Material Code</th>
              <th>Description</th>
              <th>Available Stock</th>
              <th>Price (₹)</th>
              <th>Total Value (₹)</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length > 0 ? (
              <>
                {filtered.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.materialCode}</td>
                    <td>{s.materialName}</td>
                    <td>{s.currentStock}</td>
                    <td>₹ {s.price?.toFixed(2)}</td>
                    <td>₹ {s.totalValue?.toFixed(2)}</td>
                  </tr>
                ))}

                {/* 🔥 GRAND TOTAL ROW */}
                <tr style={{ fontWeight: "bold", background: "#f3f4f6" }}>
                  <td colSpan="5" style={{ textAlign: "right" }}>
                    Grand Total
                  </td>
                  <td>₹ {grandTotal.toFixed(2)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "red" }}>
                  No Stock Found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default VeoliaStock;