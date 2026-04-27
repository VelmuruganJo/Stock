import { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";

function Bom(){

  const [showForm,setShowForm] = useState(false);

  const [materialCode,setMaterialCode] = useState("");
  const [materialName,setMaterialName] = useState("");
  const [model,setModel] = useState("");
  const [qty,setQty] = useState("");
  const [price,setPrice] = useState("");

  const [records,setRecords] = useState([]);
  const [filtered,setFiltered] = useState([]);

  const [selectedModel,setSelectedModel] = useState("");
  const [search,setSearch] = useState("");

  const [file,setFile] = useState(null);
  const [editId,setEditId] = useState(null);

  // LOAD DATA
  const load = async ()=>{
    const res = await API.get("/bom");
    setRecords(res.data || []);
    setFiltered(res.data || []);
  };

  useEffect(()=>{ load(); },[]);

  // ✅ FILTER (MODEL + SEARCH)
  useEffect(()=>{

    let temp = [...records];

    // MODEL FILTER
    if(selectedModel !== ""){
      temp = temp.filter(r => r.model === selectedModel);
    }

    // SEARCH FILTER
    if(search !== ""){
      temp = temp.filter(r =>
        Object.values(r).some(v =>
          String(v ?? "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    setFiltered(temp);

  },[selectedModel, search, records]);

  // AUTO FETCH MATERIAL
  const searchMaterial = async ()=>{
    try{
      const res = await API.get(`/materials/search/${materialCode}`);
      const d = res.data;

      setMaterialName(d.materialName || "");
      setPrice(d.price || 0);

    }catch{
      alert("Material Not Found");
    }
  };

  // SAVE / UPDATE
  const save = async ()=>{

    const payload = {
      materialCode,
      materialName,
      model,
      qty,
      price
    };

    if(editId){
      await API.put(`/bom/${editId}`, payload);
    }else{
      await API.post("/bom", payload);
    }

    reset();
    load();
  };

  // RESET FORM
  const reset = ()=>{
    setMaterialCode("");
    setMaterialName("");
    setModel("");
    setQty("");
    setPrice("");
    setEditId(null);
    setShowForm(false);
  };

  // EDIT ROW
  const editRow = (r)=>{
    setEditId(r.id);
    setShowForm(true);

    setMaterialCode(r.materialCode);
    setMaterialName(r.materialName);
    setModel(r.model);
    setQty(r.qty);
    setPrice(r.price);
  };

  // DELETE
  const deleteRow = async (id)=>{
    await API.delete(`/bom/${id}`);
    load();
  };

  // CSV UPLOAD
  const uploadCSV = async ()=>{
    if(!file){
      alert("Select file");
      return;
    }

    const formData = new FormData();
    formData.append("file",file);

    await API.post("/bom/upload",formData,{
      headers:{"Content-Type":"multipart/form-data"}
    });

    alert("Uploaded Successfully");
    setFile(null);
    load();
  };

  // EXPORT EXCEL
  const exportExcel = ()=>{
    const data = filtered.map((r,i)=>({
      SlNo: i+1,
      Model: r.model,
      Code: r.materialCode,
      Name: r.materialName,
      Qty: r.qty,
      Price: r.price,
      Total: r.qty * r.price
    }));

    data.push({
      Name: "GRAND TOTAL",
      Total: filtered.reduce((sum,r)=> sum + (r.qty * r.price),0)
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"BOM");

    const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
    saveAs(new Blob([buf]),"BOM.xlsx");
  };

  const grandTotal = filtered.reduce(
    (sum,r)=> sum + (r.qty * r.price),0
  );

  return(
    <div className="stock-page">

      <h2>BOM Management</h2>

      {/* TOP BAR */}
      <div className="top-bar">

        <button className="stock-btn" onClick={()=>setShowForm(!showForm)}>
          {showForm ? "Close Form" : "+ Add BOM"}
        </button>

        {/* MODEL FILTER */}
        <select
          className="form-input"
          value={selectedModel}
          onChange={e=>setSelectedModel(e.target.value)}
        >
          <option value="">All Models</option>

          <option>25G ID</option>
            <option>25G WD</option>
            <option>25G WOD</option>

            <option>50G ID</option>
            <option>50G WD</option>
            <option>50G WOD</option>

            <option>25G TRI-ID</option>

            <option>50G TRI-ID</option>
        </select>

        {/* 🔍 SEARCH */}
        <input
          className="search-input"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* CSV */}
        <input type="file" accept=".csv"
          onChange={e=>setFile(e.target.files[0])}
        />

        <button className="btn-save" onClick={uploadCSV}>
          Upload CSV
        </button>

        <button className="btn-export" onClick={exportExcel}>
          Export Excel
        </button>

      </div>

      {/* FORM */}
      {showForm && (
        <div className="stock-form">

          <input className="form-input"
            placeholder="Material Code"
            value={materialCode}
            onChange={e=>setMaterialCode(e.target.value)}
          />

          <button className="stock-btn" onClick={searchMaterial}>
            Search
          </button>

          <input className="form-input" value={materialName} readOnly />

          <select
            className="form-input"
            value={model}
            onChange={e=>setModel(e.target.value)}
          >
            <option value="">Select Model</option>

            <option>25G ID</option>
            <option>25G WD</option>
            <option>25G WOD</option>

            <option>50G ID</option>
            <option>50G WD</option>
            <option>50G WOD</option>

            <option>25G TRI-ID</option>

            <option>50G TRI-ID</option>

          </select>

          <input className="form-input"
            type="number"
            placeholder="Qty"
            value={qty}
            onChange={e=>setQty(e.target.value)}
          />

          <input className="form-input"
            type="number"
            value={price}
            readOnly
          />

          <button className="btn-save" onClick={save}>
            {editId ? "Update" : "Save"}
          </button>

          <button className="btn-cancel" onClick={reset}>
            Cancel
          </button>

        </div>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Model</th>
              <th>Code</th>
              <th>Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total ₹</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              <>
                {filtered.map((r,i)=>(
                  <tr key={r.id} onClick={()=>editRow(r)}>

                    <td>{i+1}</td>
                    <td>{r.model}</td>
                    <td>{r.materialCode}</td>
                    <td>{r.materialName}</td>
                    <td>{r.qty}</td>
                    <td>₹ {r.price}</td>
                    <td>₹ {(r.qty * r.price).toFixed(2)}</td>

                    <td>
                      <button
                        className="btn-cancel"
                        onClick={(e)=>{
                          e.stopPropagation();
                          deleteRow(r.id);
                        }}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}

                <tr style={{fontWeight:"bold",background:"#f3f4f6"}}>
                  <td colSpan="6" style={{textAlign:"right"}}>
                    Grand Total
                  </td>
                  <td>₹ {grandTotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </>
            ):(
              <tr>
                <td colSpan="8">No Data</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Bom;