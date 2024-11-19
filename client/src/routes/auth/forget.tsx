import {useState} from "react";
import {AuthService} from "@genezio/auth";
import {useNavigate} from "react-router-dom";
import {GenezioError} from "@genezio/types";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const recoverPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (email === "") {
      alert("Please enter your email");
      return;
    }
    try {
      await AuthService.getInstance().resetPassword(email);
      alert("Please check your email");
      // Redirect your users to the sign in form
      navigate("/login");
    } catch (error) {
      alert(
        "Error code: " +
        (error as GenezioError).code +
        ": " +
        (error as GenezioError).message
      );
    }
  };

  return (
    <div className="center">
      <form className="auth-form" onSubmit={recoverPassword}>
        <h2>Forgot Password</h2>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="actions">
          <button type="submit">Recover Password</button>
        </div>
      </form>
    </div>
  );
}