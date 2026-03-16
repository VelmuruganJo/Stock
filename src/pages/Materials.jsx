import { useState, useEffect } from "react";
import API from "../api";
import "./style/Materials.css";

function Materials() {

const [materialCode,setMaterialCode] = useState("");
const [itemName,setItemName] = useState("");
const [make,setMake] = useState("");
const [vendor,setVendor] = useState("");
const [currency,setCurrency] = useState("INR");
const [price,setPrice] = useState("");
const [uom,setUom] = useState("");

const [records,setRecords] = useState([]);
const [editCode,setEditCode] = useState(null);
const [showForm,setShowForm] = useState(false);


// LOAD MATERIALS
const loadData = async () => {

try{

const res = await API.get("/materials");
setRecords(res.data || []);

}catch(err){

console.error("Load error",err);

}

};


useEffect(()=>{
loadData();
},[]);


// SAVE / UPDATE
const handleSubmit = async (e) => {

e.preventDefault();

const data = {
materialCode,
itemName,
make,
vendor,
currency,
price,
uom
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
alert("Error saving material");

}

resetForm();
loadData();

};


// RESET FORM
const resetForm = () => {

setMaterialCode("");
setItemName("");
setMake("");
setVendor("");
setCurrency("INR");
setPrice("");
setUom("");

setShowForm(false);

};


// EDIT
const editMaterial = (r) => {

setEditCode(r.materialCode);

setMaterialCode(r.materialCode || "");
setItemName(r.itemName || "");
setMake(r.make || "");
setVendor(r.vendor || "");
setCurrency(r.currency || "INR");
setPrice(r.price || "");
setUom(r.uom || "");

setShowForm(true);

};


// DELETE
const deleteMaterial = async (code) => {

if(!window.confirm("Delete this material?")) return;

try{

await API.delete("/materials/" + code);
loadData();

}catch(err){

console.error(err);

}

};


return (

<div className="stock-page">

<h2>Material List</h2>


{!showForm && (

<button
className="btn-add"
onClick={()=>setShowForm(true)}
>
Add Material
</button>

)}


{showForm && (

<form className="material-form" onSubmit={handleSubmit}>

<input
type="text"
placeholder="Material Code"
className="form-input"
value={materialCode}
onChange={(e)=>setMaterialCode(e.target.value)}
required
/>

<input
type="text"
placeholder="Item Name"
className="form-input"
value={itemName}
onChange={(e)=>setItemName(e.target.value)}
required
/>

<input
type="text"
placeholder="Make"
className="form-input"
value={make}
onChange={(e)=>setMake(e.target.value)}
/>

<input
type="text"
placeholder="Vendor"
className="form-input"
value={vendor}
onChange={(e)=>setVendor(e.target.value)}
/>

<input
type="text"
placeholder="Currency"
className="form-input"
value={currency}
onChange={(e)=>setCurrency(e.target.value)}
/>

<input
type="text"
placeholder="UOM"
className="form-input"
value={uom}
onChange={(e)=>setUom(e.target.value)}
/>

<input
type="number"
placeholder="Price"
className="form-input"
value={price}
onChange={(e)=>setPrice(e.target.value)}
required
/>

<button className="btn-save">

{editCode ? "Update Material" : "Save Material"}

</button>


<button
type="button"
className="btn-cancel"
onClick={resetForm}
>
Cancel
</button>

</form>

)}


<div className="table-container">
<table className="material-table">

<thead>

<tr>
<th>SlNo</th>
<th>Material Code</th>
<th>Item Name</th>
<th>Make</th>
<th>Vendor</th>
<th>Currency</th>
<th>UOM</th>
<th>Price</th>
<th>Delete</th>
</tr>

</thead>

<tbody>

{records.map((r,index)=>(

<tr key={r.materialCode}>

<td>{index+1}</td>

<td
style={{
color:"blue",
cursor:"pointer",
fontWeight:"bold"
}}
onClick={()=>editMaterial(r)}
>
{r.materialCode}
</td>

<td>{r.itemName}</td>
<td>{r.make}</td>
<td>{r.vendor}</td>
<td>{r.currency}</td>
<td>{r.uom}</td>
<td>{r.price}</td>

<td>

<button
className="btn-delete"
onClick={()=>deleteMaterial(r.materialCode)}
>
Delete
</button>

</td>

</tr>


))}

</tbody>

</table>
</div>

</div>

);

}

export default Materials;