import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";


const FormField = (props) => {
  return (
    <div className="login field">
      <label className="login label">{props.label}</label>
      <input
        className="login input"
        placeholder="enter here.."
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const Register = () => {
  
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();
  const backtoLogin = () => {
    navigate("/login"); 
  };

  const handleRegister = async () => {
    try {
      const requestBody = JSON.stringify({ username, password });
      const response = await api.post("/register", requestBody);

      const userData = response.data;

      // Check if registration was successful
      if (userData && userData.id) {
        const user = new User(userData);

        // Store the token into the local storage.
        localStorage.setItem("token", user.token);
        localStorage.setItem('userId', user.id);
        

        // Navigate to user overview page with necessary information
        navigate("/game", { state: { user } });
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      alert(`Something went wrong during the registration: \n${handleError(error)}`);
    }
  };
  return (
    <BaseContainer>
    <h1>Register Page</h1>
      <div className="login container">
        <div className="login form">

          
          <FormField
            label="Username"
            value={username}
            onChange={(un) => setUsername(un)}
          />
          <FormField
            label="Password"
            value={password}
            onChange={(n) => setPassword(n)}
          />
          <div className="login button-container">
            <Button
              disabled={!username || !password}
              width="100%"
              onClick={handleRegister}
            >
              Register
            </Button>
            <Button width="100%" onClick={backtoLogin}>
              Return to login 
            </Button>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Register;