import { useState, useEffect } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";

function Materials() {

  const [materialCode,setMaterialCode] = useState("");
  const [materialName,setMaterialName] = useState("");
  const [make,setMake] = useState("");
  const [vendor,setVendor] = useState("");
  const [category,setCategory] = useState("");
  const [price,setPrice] = useState("");
  const [uom,setUom] = useState("");

  const [records,setRecords] = useState([]);
  const [filteredRecords,setFilteredRecords] = useState([]);

  const [editCode,setEditCode] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [search,setSearch] = useState("");

  // LOAD
  const loadData = async () => {
    try{
      const res = await API.get("/materials");
      setRecords(res.data || []);
    }catch(err){
      console.error(err);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{ loadData(); },[]);

  useEffect(()=>{
    const sorted = [...records].sort((a, b) =>
      (a.category || "").localeCompare(b.category || "")
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredRecords(sorted);
  },[records]);

  // SEARCH
  const handleSearch = (value) => {
    setSearch(value);

    if(value.trim() === ""){
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((r) =>
      Object.values(r).some((val) =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );

    setFilteredRecords(filtered);
  };

  // EXPORT
  const exportToExcel = () => {
    const data = filteredRecords.map((r, index) => ({
      "Sl No": index + 1,
      "Material Code": r.materialCode,
      "Material Name": r.MaterialName,
      "Make": r.make,
      "Vendor": r.vendor,
      "Category": r.category,
      "UOM": r.uom,
      "Price": r.price
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");

    const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
    saveAs(new Blob([buf]),"Materials.xlsx");
  };

  // SAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      materialCode,materialName,make,vendor,category,price,uom
    };

    try{
      if(editCode){
        await API.put("/materials/" + editCode,data);
        setEditCode(null);
      }else{
        await API.post("/materials",data);
      }
    }catch(err){
      console.error(err);
      alert("Error saving");
    }

    resetForm();
    loadData();
  };

  // RESET
  const resetForm = () => {
    setMaterialCode("");
    setMaterialName("");
    setMake("");
    setVendor("");
    setCategory("");
    setPrice("");
    setUom("");
    setShowForm(false);
  };

  // EDIT
  const editMaterial = (r) => {
    setEditCode(r.materialCode);
    setShowForm(true);

    setMaterialCode(r.materialCode || "");
    setMaterialName(r.materialName || "");
    setMake(r.make || "");
    setVendor(r.vendor || "");
    setCategory(r.category || "");
    setPrice(r.price || "");
    setUom(r.uom || "");
  };

  // DELETE
  // const deleteMaterial = async (code) => {
  //   if(!window.confirm("Delete?")) return;
  //   await API.delete("/materials/" + code);
  //   loadData();
  // };

  return (

    <div className="stock-page">

      <h2>Material List</h2>

      {/* TOP BAR ALWAYS VISIBLE */}
      <div className="top-bar">

        <button className="stock-btn" onClick={()=>setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Material"}
        </button>

        <input
          type="text"
          placeholder="Search Material..."
          className="search-input"
          value={search}
          onChange={(e)=>handleSearch(e.target.value)}
        />

        <button className="btn-export" onClick={exportToExcel}>
          Export Excel
        </button>

      </div>

      {/* FORM BELOW TOP BAR */}
      {showForm && (
        <form className="stock-form" onSubmit={handleSubmit}>

          <input type="text" placeholder="Material Code" className="form-input"
            value={materialCode} onChange={(e)=>setMaterialCode(e.target.value)} required />

          <input type="text" placeholder="Material Name" className="form-input"
            value={materialName} onChange={(e)=>setMaterialName(e.target.value)} required />

          <input type="text" placeholder="Make" className="form-input"
            value={make} onChange={(e)=>setMake(e.target.value)} />

          <input type="text" placeholder="Vendor" className="form-input"
            value={vendor} onChange={(e)=>setVendor(e.target.value)} />

          <input type="text" placeholder="Category" className="form-input"
            value={category} onChange={(e)=>setCategory(e.target.value)} />

          <input type="text" placeholder="UOM" className="form-input"
            value={uom} onChange={(e)=>setUom(e.target.value)} />

          <input type="number" placeholder="Price" className="form-input"
            value={price} onChange={(e)=>setPrice(e.target.value)} required />

          <button className="btn-save">
            {editCode ? "Update" : "Save"}
          </button>

        </form>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Material Code</th>
              <th>Material Name</th>
              <th>Make</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>UOM</th>
              <th>Price</th>
              {/* <th>Delete</th> */}
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r,index)=>(
                <tr key={r.materialCode}>
                  <td>{index+1}</td>

                  <td onClick={()=>editMaterial(r)} style={{color:"blue",cursor:"pointer"}}>
                    {r.materialCode}
                  </td>

                  <td>{r.materialName}</td>
                  <td>{r.make}</td>
                  <td>{r.vendor}</td>
                  <td>{r.category}</td>
                  <td>{r.uom}</td>
                  <td>Rs.{r.price}</td>

                  {/* <td>
                    <button className="btn-delete" onClick={()=>deleteMaterial(r.materialCode)}>
                      Delete
                    </button>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">Material Not Available</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Materials;