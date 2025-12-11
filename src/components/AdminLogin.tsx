import { useState } from "react";
import { toast } from "sonner";
import "./AdminLogin.css";

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onNavigateBack: () => void;
}

export function AdminLogin({ onLogin, onNavigateBack }: AdminLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple passcode check
    if (passcode === "1234567!") {
      toast.success("Login successful!");
      onLogin(true);
    } else {
      toast.error("Invalid passcode");
      onLogin(false);
    }

    setIsLoading(false);
  };

  return (
    <div className="admin-login-container">
      <button onClick={onNavigateBack} className="back-button">
        ← Back to home
      </button>

      <div className="login-form-container">
        <h1 className="login-title">Admin Access</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label className="form-label">Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="form-input"
              placeholder="Enter admin passcode"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
