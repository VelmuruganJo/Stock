import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../img/websitebanner-career.jpg';

function Login(){

  const navigate = useNavigate();

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [remember,setRemember] = useState(false);
  const [error,setError] = useState("");

  const handleLogin = (e)=>{
    e.preventDefault();

    if(username === "admin" && password === "1"){

      const fakeToken = "demo-token-123";

      if (remember) {
        localStorage.setItem("token", fakeToken);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", fakeToken);
        localStorage.removeItem("token");
      }

      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  }

  return(

    <div style={styles.container}>

      <div style={styles.overlay}></div>

      <div style={styles.card}>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="logo"
          style={styles.logo}
        />

        <h2>Ozone Technologies</h2>

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

  backgroundImage: `url(${logo})`,
  backgroundSize:"cover",
  backgroundPosition:"center",
  backgroundRepeat:"no-repeat",

  position:"relative"
},

// 🌑 Gradient overlay (more premium look)
overlay:{
  position:"absolute",
  top:0,
  left:0,
  width:"100%",
  height:"100%",
  background:"linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,100,200,0.4))",
  backdropFilter:"blur(3px)"
},

// 💎 Glass Card
card:{
  position:"relative",
  zIndex:1,
  background:"rgba(255,255,255,0.12)",
  padding:"40px",
  borderRadius:"15px",
  width:"390px",
  textAlign:"center",

  backdropFilter:"blur(12px)",
  WebkitBackdropFilter:"blur(12px)",

  border:"1px solid rgba(255,255,255,0.2)",
  boxShadow:"0 8px 40px rgba(0,0,0,0.4)"
},

logo:{
  width:"70px",
  marginBottom:"10px",
  borderRadius:"50%",
  border:"2px solid white"
},

// ✨ Better Inputs
input:{
  width:"100%",
  padding:"12px",
  margin:"10px 0",
  border:"none",
  borderRadius:"8px",
  outline:"none",
  background:"rgba(255,255,255,0.9)",
  fontSize:"14px"
},

// 🔥 Gradient Button
button:{
  width:"100%",
  padding:"12px",
  background:"linear-gradient(135deg, #4facfe, #00f2fe)",
  color:"#fff",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer",
  fontWeight:"bold",
  transition:"0.3s"
},

eye:{
  position:"absolute",
  right:"10px",
  top:"18px",
  cursor:"pointer"
},

remember:{
  display:"flex",
  alignItems:"center",
  gap:"5px",
  marginBottom:"10px",
  color:"#fff"
},

error:{
  background:"rgba(255,0,0,0.2)",
  color:"#fff",
  padding:"8px",
  marginBottom:"10px",
  borderRadius:"5px"
}
};
export default Login;