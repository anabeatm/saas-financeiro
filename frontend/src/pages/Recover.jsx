import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { useToast } from "../components/ToastContext";
import { ArrowLeft } from "lucide-react";

export default function Recover() {
  const [email, setEmail] = useState("");
  const { addToast } = useToast();

  const handleRecover = async (e) => {
    e.preventDefault();

    const form = e.target;

    if (email.trim() == "") {
      addToast({
        type: "error",
        title: "Required field",
        description: "Please, fill in email field to continue",
      });
      return;
    }

    if (!form.email.validity.valid) {
      addToast({
        type: "error",
        title: "Invalid email address",
        description: "Please enter a valid email address",
      });
      return;
    }

    try {
      await axios.post("/auth/forgot-password", { email });
    } catch (error) {
      console.error(error);
    } finally {
      addToast({
        type: "success",
        title: "Instructions sent",
        description:
          "You will receive a link to reset your password shortly, check your inbox or spam folder",
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
}
