import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../../services/AuthService";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useToast } from "../../components/ToastContext";

const Recover = () => {
  const [email, setEmail] = useState("");
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();

    try {
      const response = await authService.forgotPassword(email);

      addToast({
        type: "success",
        title: "Instructions sent",
        description: response.message || "Check your inbox or spam folder",
      });

      if (response.debugToken) {
        console.log("DEBUG TOKEN:", response.debugToken);
        setTimeout(() => {
          navigate(`/reset-password/${response.debugToken}`);
        }, 1500);
      }
      setEmail("");
    } catch (errorMessage) {
      addToast({
        type: "error",
        title: "Recovery failed",
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : "Please enter a valid email",
      });
      setEmail("");
    }
  };

  return (
    <AuthLayout
      title="Recover your password"
      subtitle="Inform your email to receive instructions"
      showLogo={true}
    >
      <form noValidate onSubmit={handleRecover} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit">Send</Button>
        <div className="mt-2 flex justify-center gap-2 text-sm text-[#a88d6f] hover:text-[#d6bfa7] hover:underline">
          <Link to="/login" className="flex gap-1 items-center font-semibold">
            <ArrowLeft />
            Return to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Recover;
