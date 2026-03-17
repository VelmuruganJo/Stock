import { useEffect,useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/Stock.css";

function Stock(){

const [stocks,setStocks]=useState([]);
const [filtered,setFiltered]=useState([]);
const [search,setSearch]=useState("");

// LOAD
useEffect(()=>{
API.get("/currentstock")
.then(res=>{
setStocks(res.data || []);
setFiltered(res.data || []);
})
.catch(err=>console.error(err));
},[]);

// SEARCH
const handleSearch = (val) => {
setSearch(val);

if(val===""){
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

// EXPORT
const exportExcel = () => {
const data = filtered.map((s,i)=>({
"SlNo":i+1,
"Material":s.materialName,
"Total In":s.totalIn,
"Total Out":s.totalOut,
"Current":s.currentStock
}));

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Stock");

const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
saveAs(new Blob([buf]),"Stock.xlsx");
};

return(

<div className="stock-page">

<h2>Current Stock</h2>

<div className="top-bar">
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

<table className="stock-table">

<thead>
<tr>
<th>Material</th>
<th>Total In</th>
<th>Total Out</th>
<th>Current</th>
</tr>
</thead>

<tbody>

{filtered.length>0 ? filtered.map((s,i)=>(

<tr key={i}>
<td>{s.materialName}</td>
<td>{s.totalIn}</td>
<td>{s.totalOut}</td>
<td>{s.currentStock}</td>
</tr>

)) : (
<tr>
<td colSpan="4">No Data Found</td>
</tr>
)}

</tbody>

</table>

</div>
)

}

export default Stock;