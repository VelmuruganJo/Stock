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

    if (val.trim() === "") {
      setFiltered(stocks);
      return;
    }

    const f = stocks.filter(s =>
      Object.values(s).some(v =>
        String(v ?? "").toLowerCase().includes(val.toLowerCase())
      )
    );

    setFiltered(f);
  };

  // GRAND TOTAL
  const grandTotal = filtered.reduce(
    (sum, s) => sum + Number(s.totalValue || 0),
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
      "Description": "GRAND TOTAL",
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
              <th>Min</th>
              <th>Status</th>
              <th>Price (₹)</th>
              <th>Total Value (₹)</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length > 0 ? (
              <>
                {filtered.map((s, i) => {
                  const stock = Number(s.currentStock || 0);
                  const min = Number(s.minStock || 0);

                  return (
                    <tr
                      key={i}
                      style={{
                        backgroundColor:
                          stock === 0
                            ? "#fecaca"
                            : stock <= min
                            ? "#fef08a"
                            : ""
                      }}
                    >
                      <td>{i + 1}</td>
                      <td>{s.materialCode}</td>
                      <td>{s.materialName}</td>
                      <td>{s.make}</td>
                      <td>{stock}</td>
                      <td>{min}</td>
                      <td>
                        {stock === 0
                          ? "Out"
                          : stock <= min
                          ? "Low"
                          : "OK"}
                      </td>
                      <td>₹ {Number(s.price || 0).toFixed(2)}</td>
                      <td>₹ {Number(s.totalValue || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}

                <tr style={{ fontWeight: "bold", background: "#f3f4f6" }}>
                  <td colSpan="8" style={{ textAlign: "right" }}>
                    Grand Total
                  </td>
                  <td>₹ {grandTotal.toFixed(2)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "red" }}>
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