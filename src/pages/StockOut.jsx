import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API from "../api";
import "./style/common.css";

function StockOut() {

  const [showForm, setShowForm] = useState(false);

  const [date, setDate] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [vendor, setVendor] = useState("");
  const [reference, setReference] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // LOAD
  const loadStock = async () => {
    const res = await API.get("/stockout");
    setRecords(res.data || []);
    setFiltered(res.data || []);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStock(); }, []);

  // 🔥 AUTO FILL
  const searchMaterial = async () => {
    try {
      const res = await API.get(`/materials/search/${materialCode}`);
      const d = res.data || {};

      setMaterialName(d.materialName || "");
      setVendor(d.vendor || "");
      setPrice(d.price || 0);

    } catch {
      alert("Material Not Found");
    }
  };

  // SEARCH FILTER
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

  // CSV UPLOAD
  const handleFileUpload = async () => {
  if (!file) {
    alert("Select CSV file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await API.post("/stockout/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setUploadResult(res.data);
    setShowPopup(true);

    setFile(null);
    loadStock();

  } catch (err) {
    console.error(err);
    alert("Upload Failed");
  }
};

  // SAVE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      date,
      materialCode,
      materialName,
      vendor,
      reference,
      price,
      qty: parseFloat(qty)
    };

    if (editId) {
      await API.put(`/stockout/${editId}`, data);
      setEditId(null);
    } else {
      await API.post("/stockout", data);
    }

    resetForm();
    loadStock();
  };

  const resetForm = () => {
    setDate("");
    setMaterialCode("");
    setMaterialName("");
    setVendor("");
    setReference("");
    setPrice("");
    setQty("");
    setEditId(null);
    setShowForm(false);
  };

  // EDIT
  const editStock = (r) => {
    setEditId(r.id);
    setShowForm(true);

    setDate(r.date);
    setMaterialCode(r.materialCode);
    setMaterialName(r.materialName);
    setVendor(r.vendor);
    setReference(r.reference);
    setPrice(r.price);
    setQty(r.qty);
  };

  // DELETE
  const deleteStock = async (id) => {
    await API.delete(`/stockout/${id}`);
    loadStock();
  };

  // EXPORT
  const exportExcel = () => {
    const data = filtered.map((r,i)=>({
      "SlNo": i+1,
      "Date": r.date,
      "Material Code": r.materialCode,
      "Material": r.materialName,
      "Vendor": r.vendor,
      "Reference": r.reference,
      "Price": r.price,
      "Qty": r.qty,
      "Total": r.qty * r.price
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockOut");

    const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
    saveAs(new Blob([buf]),"StockOut.xlsx");
  };

  // GRAND TOTAL
  const grandTotal = filtered.reduce(
    (sum, r) => sum + (r.qty * r.price), 0
  );

  return (
    <div className="stock-page">

      <h2>Stock Out</h2>

      {/* TOP BAR */}
      <div className="top-bar">
        <button className="stock-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "+ Stock Out"}
        </button>
        <div className="csv-top-upload">

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            type="button"
            className="btn-save"
            onClick={handleFileUpload}
            disabled={!file}
          >
            Upload CSV
          </button>

        </div>

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

          <input className="form-input" type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />

          <input className="form-input" type="text"
            placeholder="Material Code"
            value={materialCode}
            onChange={e => setMaterialCode(e.target.value)}
          />

          <button type="button" className="stock-btn" onClick={searchMaterial}>
            Search
          </button>

          <input className="form-input" type="text" value={materialName} readOnly />
          <input className="form-input" type="text" value={vendor} readOnly />

          <input className="form-input" type="text"
            placeholder="Reference"
            value={reference}
            onChange={e => setReference(e.target.value)}
          />

          <input className="form-input" type="number" value={price} readOnly />

          <input className="form-input" type="number"
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
              <th>Reference</th>
              <th>Code</th>
              <th>Material</th>
              <th>Vendor</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total ₹</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r, i) => (
                <tr key={r.id} onClick={() => editStock(r)}>

                  <td>{i + 1}</td>
                  <td>{r.date}</td>
                  <td>{r.reference}</td>
                  <td>{r.materialCode}</td>
                  <td>{r.materialName}</td>
                  <td>{r.vendor}</td>
                  <td>₹ {r.price}</td>
                  <td>{r.qty}</td>
                  <td>{r.qty * r.price}</td>

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
                <td colSpan="10">No Data Found</td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan="8" style={{textAlign:"right",fontWeight:"bold"}}>
                Grand Total
              </td>
              <td style={{fontWeight:"bold"}}>₹ {grandTotal}</td>
              <td></td>
            </tr>
          </tfoot>

        </table>
      </div>

      {showPopup && uploadResult && (
  <div className="modal-overlay" onClick={()=>setShowPopup(false)}>
    <div className="modal-1" onClick={e=>e.stopPropagation()}>

      {/* HEADER */}
      <div className="modal-header">
        <h3>CSV Upload Result</h3>
      </div>

      {/* BODY */}
      <div className="modal-body">

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "15px",
          fontWeight: "bold"
        }}>
          <span style={{color:"#16a34a"}}>
            ✅ Success: {uploadResult.successCount}
          </span>

          <span style={{color:"#ef4444"}}>
            ❌ Failed: {uploadResult.failedCount}
          </span>
        </div>

        <div className="csv-result-grid">

          {/* SUCCESS LIST */}
          <div className="csv-box success-box">
            <h4>Added Materials</h4>

            <div className="csv-scroll">
              {uploadResult.successList.length > 0 ? (
                uploadResult.successList.map((s,i)=>(
                  <div key={i} className="csv-item success">
                    {s}
                  </div>
                ))
              ) : (
                <p>No Success</p>
              )}
            </div>
          </div>

          {/* FAILED LIST */}
          <div className="csv-box failed-box">
            <h4>Not Added</h4>

            <div className="csv-scroll">
              {uploadResult.failedList.length > 0 ? (
                uploadResult.failedList.map((f,i)=>(
                  <div key={i} className="csv-item failed">
                    {f}
                  </div>
                ))
              ) : (
                <p>No Failures</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="modal-actions">
        <button className="btn-cancel" onClick={()=>setShowPopup(false)}>
          Close
        </button>
      </div>

    </div>
  </div>
)}

    </div>

  );
}

export default StockOut;