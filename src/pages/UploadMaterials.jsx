import { useState } from "react";
import API from "../api";

function UploadMaterials(){

const [file,setFile] = useState(null);

const upload = async ()=>{

if(!file){
alert("Please select CSV file");
return;
}

const formData = new FormData();
formData.append("file",file);

try{

await API.post("/materials/upload",formData,{
headers:{
"Content-Type":"multipart/form-data"
}
});

alert("CSV Uploaded Successfully");

}catch(err){

console.error(err);
alert("Upload Failed");

}

};

return(

<div className="stock-page">

<h2>Upload Materials CSV</h2>

<input
type="file"
accept=".csv"
onChange={(e)=>setFile(e.target.files[0])}
/>

<br/><br/>

<button onClick={upload}>
Upload
</button>

</div>

)

}

export default UploadMaterials;