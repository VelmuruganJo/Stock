// StockIn.js
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API from "../api";
import "./style/common.css";

function StockIn() {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [vendor, setVendor] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const loadStock = async () => {
    const res = await API.get("/stockin");
    setRecords(res.data || []);
    setFiltered(res.data || []);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStock(); }, []);

  const searchMaterial = async () => {
    try {
      const res = await API.get(`/materials/search/${materialCode}`);
      const d = res.data || {};
      setMaterialName(d.materialName || ""); // ✅ match backend field
      setVendor(d.vendor || "");
      setPrice(d.price || 0);
    } catch {
      alert("Material Not Found");
    }
  };
  useEffect(() => {
  if (search === "") {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltered(records);
  } else {
    const f = records.filter(r =>
      Object.values(r).some(v =>
        String(v).toLowerCase().includes(search.toLowerCase())
      )
    );
    setFiltered(f);
  }
}, [search, records]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { date, materialCode, materialName, vendor, price, qty: parseFloat(qty) };

    if (editId) {
      await API.put(`/stockin/${editId}`, data);
      setEditId(null);
    } else {
      await API.post("/stockin", data);
    }

    resetForm();
    loadStock();
  };

  const resetForm = () => {
    setDate(""); setMaterialCode(""); setMaterialName(""); setVendor("");
    setPrice(""); setQty(""); setEditId(null); setShowForm(false);
  };

  const editStock = (r) => {
    setEditId(r.id); setShowForm(true);
    setDate(r.date); setMaterialCode(r.materialCode); setMaterialName(r.materialName);
    setVendor(r.vendor); setPrice(r.price); setQty(r.qty);
  };

  const exportExcel = () => {
    const data = filtered.map((r,i)=>({
      "SlNo": i+1,
      "Date": r.date,
      "Material Code": r.materialCode,
      "Material": r.materialName,
      "vendor": r.vendor,
      "Price": r.price,
      "Qty": r.qty
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockIn");
    const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
    saveAs(new Blob([buf]),"StockIn.xlsx");
  };

    // DELETE
  const deleteStock = async (id) => {
    await API.delete(`/stockin/${id}`);
    loadStock();
  };

  return (
  <div className="stock-page">

    <h2>Stock In</h2>

    {/* TOP BAR */}
    <div className="top-bar">
      <button className="stock-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Close Form" :"+ Stock In"}
      </button>

      <input
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      <button onClick={exportExcel} className="btn-export">
        Export Excel
      </button>
    </div>

    {/* FORM */}
    {showForm && (
      <form className="stock-form" onSubmit={handleSubmit}>

        <input
          className="form-input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />

        <input
          className="form-input"
          type="text"
          placeholder="Material Code"
          value={materialCode}
          onChange={e => setMaterialCode(e.target.value)}
        />

        <button type="button" className="stock-btn" onClick={searchMaterial}>
          Search
        </button>

        <input className="form-input" type="text" value={materialName} readOnly />
        <input className="form-input" type="text" value={vendor} readOnly />
        <input className="form-input" type="number" value={price} readOnly />

        <input
          className="form-input"
          type="number"
          placeholder="Qty"
          value={qty}
          onChange={e => setQty(e.target.value)}
          required
        />

        <button className="btn-save">
          {editId ? "Update" : "Add"}
        </button>

        <button type="button" className="btn-cancel" onClick={resetForm}>
          Cancel
        </button>

      </form>
    )}

    {/* TABLE */}
    <div className="table-container">
      <table className="stock-table">

        <thead>
          <tr>
            <th>Sl No</th>
            <th>Date</th>
            <th>Material Code</th>
            <th>Description</th>
            <th>vendor</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((r, i) => (
              <tr key={r.id} onClick={() => editStock(r)}>

                <td>{i + 1}</td>
                <td>{r.date}</td>

                <td style={{ cursor: "pointer", color: "#4f46e5", fontWeight: 600 }}>
                  {r.materialCode}
                </td>

                <td>{r.materialName}</td>
                <td>{r.vendor}</td>
                <td>₹ {r.price?.toFixed(2)}</td>
                <td>{r.qty}</td>
                <td>
                    <button
                      className="btn-cancel"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStock(r.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No Data Found</td>
            </tr>
          )}
        </tbody>

      </table>
    </div>

  </div>
);
}

export default StockIn;