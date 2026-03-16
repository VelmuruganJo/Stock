import { useState, useEffect } from "react";
import axios from "axios";
import "./style/StockIn.css";

function StockIn(){

const MATERIAL_API="http://localhost:8080/api/materials/search/";
const STOCK_API="http://localhost:8080/api/stockin";

const [showForm,setShowForm]=useState(false);

const [date,setDate]=useState("");
const [materialCode,setMaterialCode]=useState("");
const [materialName,setMaterialName]=useState("");
const [supplierName,setSupplierName]=useState("");
const [price,setPrice]=useState("");
const [qty,setQty]=useState("");

const [records,setRecords]=useState([]);
const [editId,setEditId]=useState(null);


 // LOAD STOCK
const loadStock=async()=>{
try{
const res=await axios.get(STOCK_API);
setRecords(res.data || []);
}catch(err){
console.error(err);
}
};

useEffect(()=>{
loadStock();
},[]);



 // SEARCH MATERIAL
const searchMaterial = async () => {

if(!materialCode){
alert("Enter Material Code");
return;
}

try{

const res = await axios.get(MATERIAL_API + materialCode);

const data = res.data || {};
console.log("Data fetched:", data);

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



 // ADD / UPDATE
const handleSubmit=async(e)=>{

e.preventDefault();

const data={
date,
materialCode,
materialName,
supplierName,
price,
qty
};

try{

if(editId){

await axios.put(STOCK_API+"/"+editId,data);
setEditId(null);

}else{

await axios.post(STOCK_API,data);

}

}catch(err){

console.error(err);
alert("Error saving stock");

}

resetForm();

setShowForm(false);

loadStock();

};



 // RESET FORM
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

setDate(r?.date || "");
setMaterialCode(r?.materialCode || "");
setMaterialName(r?.materialName || "");
setSupplierName(r?.supplierName || "");
setPrice(r?.price || "");
setQty(r?.qty || "");

};



 // DELETE
const deleteStock=async(id)=>{

try{
await axios.delete(STOCK_API+"/"+id);
loadStock();
}catch(err){
console.error(err);
}

};



return(

<div className="stock-page">

<h2>Stock In</h2>

<button
className="stock-btn"
onClick={()=>setShowForm(!showForm)}
>
Stock In
</button>


{showForm && (

<form className="stock-form" onSubmit={handleSubmit}>

<input
type="date"
value={date}
onChange={(e)=>setDate(e.target.value)}
required
/>

<input
type="text"
placeholder="Material Code"
value={materialCode}
onChange={(e)=>setMaterialCode(e.target.value)}
/>

<button
type="button"
className="search-btn"
onClick={searchMaterial}
>
Search
</button>

<input
type="text"
placeholder="Material Name"
value={materialName}
readOnly
/>

<input
type="text"
placeholder="Supplier Name"
value={supplierName}
readOnly
/>

<input
type="number"
placeholder="Price"
value={price}
readOnly
/>

<input
type="number"
placeholder="Quantity"
value={qty}
onChange={(e)=>setQty(e.target.value)}
required
/>

<button className="submit-btn">
{editId ? "Update Stock" : "Add Stock"}
</button>

</form>

)}



<h3>Stock In History</h3>

<table className="stock-table">

<thead>
<tr>
<th>SlNo</th>
<th>Date</th>
<th>Material Code</th>
<th>Material</th>
<th>Supplier</th>
<th>Price</th>
<th>Qty</th>
<th>Edit</th>
<th>Delete</th>
</tr>
</thead>

<tbody>

{records.map((r,index)=>(

<tr key={r.id}>

<td>{index+1}</td>
<td>{r.date}</td>
<td>{r.materialCode}</td>
<td>{r.materialName}</td>
<td>{r.supplierName}</td>
<td>{r.price}</td>
<td>{r.qty}</td>

<td>
<button
className="edit-btn"
onClick={()=>editStock(r)}
>
Edit
</button>
</td>

<td>
<button
className="delete-btn"
onClick={()=>deleteStock(r.id)}
>
Delete
</button>
</td>

</tr>

))}

</tbody>

</table>

</div>

);

}

export default StockIn;