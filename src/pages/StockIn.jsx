import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/StockIn.css";

function StockIn(){

const MATERIAL_API="http://192.168.1.9:8080/api/materials/search/";
const STOCK_API="http://192.168.1.9:8080/api/stockin";

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

// LOAD
const loadStock=async()=>{
try{
const res=await axios.get(STOCK_API);
setRecords(res.data || []);
setFiltered(res.data || []);
}catch(err){
console.error(err);
}
};

useEffect(()=>{
loadStock();
},[]);

// SEARCH
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

// EXPORT
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

// SEARCH MATERIAL
const searchMaterial = async () => {
try{
const res = await axios.get(MATERIAL_API + materialCode);
const data = res.data || {};
setMaterialName(data.itemName || "");
setSupplierName(data.vendor || "");
setPrice(data.price || "");
}catch(err){
alert("Material Not Found");
setMaterialName("");
setSupplierName("");
setPrice("");
}
};

// SUBMIT
const handleSubmit=async(e)=>{
e.preventDefault();

const data={date,materialCode,materialName,supplierName,price,qty};

try{
if(editId){
await axios.put(STOCK_API+"/"+editId,data);
setEditId(null);
}else{
await axios.post(STOCK_API,data);
}
}catch(err){
alert("Error saving stock");
}

resetForm();
setShowForm(false);
loadStock();
};

// RESET
const resetForm=()=>{
setDate("");
setMaterialCode("");
setMaterialName("");
setSupplierName("");
setPrice("");
setQty("");
};

// EDIT
const editStock=(r)=>{
setEditId(r.id);
setShowForm(true);
setDate(r.date);
setMaterialCode(r.materialCode);
setMaterialName(r.materialName);
setSupplierName(r.supplierName);
setPrice(r.price);
setQty(r.qty);
};

// DELETE
const deleteStock=async(id)=>{
await axios.delete(STOCK_API+"/"+id);
loadStock();
};

return(

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

<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required/>

<input type="text" placeholder="Material Code"
value={materialCode}
onChange={(e)=>setMaterialCode(e.target.value)}/>

<button type="button" onClick={searchMaterial}>Search</button>

<input type="text" value={materialName} readOnly/>
<input type="text" value={supplierName} readOnly/>
<input type="number" value={price} readOnly/>

<input type="number" placeholder="Qty"
value={qty}
onChange={(e)=>setQty(e.target.value)} required/>

<button>{editId ? "Update" : "Add"}</button>

</form>
)}

<h3>Stock In History</h3>

<table className="stock-table">
<thead>
<tr>
<th>SlNo</th>
<th>Date</th>
<th>Code</th>
<th>Material</th>
<th>Supplier</th>
<th>Price</th>
<th>Qty</th>
<th>Edit</th>
<th>Delete</th>
</tr>
</thead>

<tbody>

{filtered.length>0 ? filtered.map((r,i)=>(
<tr key={r.id}>
<td>{i+1}</td>
<td>{r.date}</td>
<td>{r.materialCode}</td>
<td>{r.materialName}</td>
<td>{r.supplierName}</td>
<td>{r.price}</td>
<td>{r.qty}</td>

<td><button onClick={()=>editStock(r)}>Edit</button></td>
<td><button onClick={()=>deleteStock(r.id)}>Delete</button></td>
</tr>
)) : (
<tr><td colSpan="9">No Data Found</td></tr>
)}

</tbody>
</table>

</div>
);
}

export default StockIn;