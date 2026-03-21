import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";
import API from "../api";

function StockIn() {

  const [showForm,setShowForm]=useState(false);

  const [date,setDate]=useState("");
  const [materialCode,setMaterialCode]=useState("");
  const [materialName,setMaterialName]=useState("");
  const [supplierName,setSupplierName]=useState("");
  const [price,setPrice]=useState("");
  const [qty,setQty]=useState("");

  const [records,setRecords]=useState([]);
  const [filtered,setFiltered]=useState([]);
  const [search,setSearch]=useState("");
  const [editId,setEditId]=useState(null);

  const loadStock = async () => {
    const res = await API.get("/stockin");
    setRecords(res.data || []);
    setFiltered(res.data || []);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{ loadStock(); },[]);

  const handleSearch = (val) => {
    setSearch(val);

    if(val===""){
      setFiltered(records);
      return;
    }

    const f = records.filter(r =>
      Object.values(r).some(v =>
        String(v).toLowerCase().includes(val.toLowerCase())
      )
    );

    setFiltered(f);
  };

  const exportExcel = () => {
    const data = filtered.map((r,i)=>({
      "SlNo":i+1,
      "Date":r.date,
      "Material Code":r.materialCode,
      "Material":r.materialName,
      "Supplier":r.supplierName,
      "Price":r.price,
      "Qty":r.qty
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockIn");

    const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
    saveAs(new Blob([buf]),"StockIn.xlsx");
  };

  const searchMaterial = async () => {
    try {
      const res = await API.get(`/materials/search/${materialCode}`);
      const d = res.data || {};

      setMaterialName(d.itemName || "");
      setSupplierName(d.vendor || "");
      setPrice(d.price || "");
    } catch {
      alert("Material Not Found");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {date,materialCode,materialName,supplierName,price,qty};

    if(editId){
      await API.put(`/stockin/${editId}`, data);
      setEditId(null);
    } else {
      await API.post("/stockin", data);
    }

    resetForm();
    setShowForm(false);
    loadStock();
  };

  const resetForm = () => {
    setDate("");
    setMaterialCode("");
    setMaterialName("");
    setSupplierName("");
    setPrice("");
    setQty("");
    setEditId(null);
    setShowForm(false);
  };

  const editStock = (r) => {
    setEditId(r.id);
    setShowForm(true);

    setDate(r.date);
    setMaterialCode(r.materialCode);
    setMaterialName(r.materialName);
    setSupplierName(r.supplierName);
    setPrice(r.price);
    setQty(r.qty);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="stock-page">

      <h2>Stock In</h2>

      <div className="top-bar">
        <button className="stock-btn" onClick={()=>setShowForm(!showForm)}>
          Stock In
        </button>

        <input
          placeholder="Search..."
          value={search}
          onChange={e=>handleSearch(e.target.value)}
          className="search-input"
        />

        <button onClick={exportExcel} className="btn-export">
          Export Excel
        </button>
      </div>

      {showForm && (
        <form className="stock-form" onSubmit={handleSubmit}>

          <input className="form-input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} required/>

          <input className="form-input" type="text" placeholder="Material Code"
            value={materialCode}
            onChange={(e)=>setMaterialCode(e.target.value)}
          />

          <button type="button" className="stock-btn" onClick={searchMaterial}>
            Search
          </button>

          <input className="form-input" type="text" value={materialName} readOnly/>
          <input className="form-input" type="text" value={supplierName} readOnly/>
          <input className="form-input" type="number" value={price} readOnly/>

          <input className="form-input" type="number" placeholder="Qty"
            value={qty}
            onChange={(e)=>setQty(e.target.value)} required
          />

          <button className="btn-save">
            {editId ? "Update" : "Add"}
          </button>

          <button type="button" className="btn-cancel" onClick={resetForm}>
            Cancel
          </button>

        </form>
      )}

      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>SlNo</th>
              <th>Inword Date</th>
              <th>Material Code</th>
              <th>Description</th>
              <th>Supplier</th>
              <th>Price</th>
              <th>Qty</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r,i)=>(
              <tr key={r.id}>
                <td>{i+1}</td>
                <td>{r.date}</td>

                <td
                  style={{cursor:"pointer", color:"blue", textDecoration:"underline"}}
                  onClick={()=>editStock(r)}
                >
                  {r.materialCode}
                </td>

                <td>{r.materialName}</td>
                <td>{r.supplierName}</td>
                <td>{r.price}</td>
                <td>{r.qty}</td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default StockIn;