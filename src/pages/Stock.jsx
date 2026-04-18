import { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/Stock.css";

function Stock() {

  const [stocks, setStocks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  // LOAD
  useEffect(() => {
    API.get("/currentstock")
      .then(res => {
        const data = res.data || [];

        // ✅ SORT BY MAKE A → Z
        const sorted = [...data].sort((a, b) =>
          (a.make || "").localeCompare(b.make || "")
        );

        setStocks(sorted);
        setFiltered(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  // SEARCH
  const handleSearch = (val) => {
    setSearch(val);

    if (val === "") {
      setFiltered(stocks);
      return;
    }

    const f = stocks.filter(s =>
      Object.values(s).some(v =>
        String(v).toLowerCase().includes(val.toLowerCase())
      )
    );

    setFiltered(f);
  };

  // GRAND TOTAL
  const grandTotal = filtered.reduce(
    (sum, s) => sum + (s.totalValue || 0),
    0
  );

  // EXPORT
  const exportExcel = () => {
    const data = filtered.map((s, i) => ({
      "Sl No": i + 1,
      "Material Code": s.materialCode,
      "Description": s.materialName,
      "Make": s.make,
      "Stock": s.currentStock,
      "Price": s.price,
      "Total Value": s.totalValue
    }));

    data.push({
      "Sl No": "",
      "Material Code": "",
      "Description": "GRAND TOTAL",
      "Make": "",
      "Stock": "",
      "Price": "",
      "Total Value": grandTotal
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "Stock.xlsx");
  };

  return (
    <div className="stock-page">

      <h2>Current Stock</h2>

      <div className="top-bar">
        <input
          placeholder="Search..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="search-input"
        />

        <button onClick={exportExcel} className="btn-export">
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
              <th>Make</th>
              <th>Stock</th>
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
                    <td>{s.make}</td>
                    <td>{s.currentStock}</td>
                    <td>₹ {Number(s.price || 0).toFixed(2)}</td>
                    <td>₹ {Number(s.totalValue || 0).toFixed(2)}</td>
                  </tr>
                ))}

                <tr style={{ fontWeight: "bold", background: "#f3f4f6" }}>
                  <td colSpan="6" style={{ textAlign: "right" }}>
                    Grand Total
                  </td>
                  <td>₹ {grandTotal.toFixed(2)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "red" }}>
                  No Data Found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Stock;