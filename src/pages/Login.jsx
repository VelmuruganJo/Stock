import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){

  const navigate = useNavigate();

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [remember,setRemember] = useState(false);
  const [error,setError] = useState("");

  const handleLogin = (e)=>{
    e.preventDefault();

    if(username === "admin" && password === "Fraudu@ve1"){

      if (remember) {
        localStorage.setItem("login", "true");
        sessionStorage.removeItem("login");
        } 
        else 
          {
            sessionStorage.setItem("login", "true");
            localStorage.removeItem("login");
          }

      navigate("/");

    }else{
      setError("Invalid username or password");
    }
  }

  return(

    <div style={styles.container}>

      <div style={styles.card}>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="logo"
          style={styles.logo}
        />

        <h2>Ozone Tech</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            style={styles.input}
          />

          <div style={{position:"relative"}}>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              style={styles.input}
            />

            <span
              onClick={()=>setShowPassword(!showPassword)}
              style={styles.eye}
            >
              {showPassword ? "🙈" : "👁"}
            </span>

          </div>

          <div style={styles.remember}>

            <input
              type="checkbox"
              checked={remember}
              onChange={()=>setRemember(!remember)}
            />

            <label>Remember Me</label>

          </div>

          <button style={styles.button}>
            Login
          </button>

        </form>

      </div>

    </div>
  )

}

const styles = {

container:{
height:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(135deg,#4facfe,#00f2fe)"
},

card:{
background:"#fff",
padding:"40px",
borderRadius:"10px",
width:"320px",
textAlign:"center",
boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
},

logo:{
width:"70px",
marginBottom:"10px"
},

input:{
width:"100%",
padding:"10px",
margin:"10px 0",
border:"1px solid #ccc",
borderRadius:"5px"
},

button:{
width:"100%",
padding:"10px",
background:"#4facfe",
color:"#fff",
border:"none",
borderRadius:"5px",
cursor:"pointer"
},

eye:{
position:"absolute",
right:"10px",
top:"15px",
cursor:"pointer"
},

remember:{
display:"flex",
alignItems:"center",
gap:"5px",
marginBottom:"10px"
},

error:{
background:"#ffdddd",
color:"#d8000c",
padding:"8px",
marginBottom:"10px",
borderRadius:"5px"
}

};

export default Login;