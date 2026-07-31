import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../../../services/AuthService";
import AuthLayout from "../../components/AuthLayout";
import { useToast } from "../../components/ToastContext";

const VerifyAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your account...");

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        await authService.verifyAccount(token);

        setStatus("success");
        setMessage("Account verified successfully! You can now log in.");
        addToast({
          type: "success",
          title: "Verified!",
          description: "Your account is ready.",
        });

        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          typeof error === "string"
            ? error
            : "The validation link is invalid or has expired.",
        );
      }
    };

    verify();
  }, [token, navigate, addToast]);

  return (
    <AuthLayout
      title="Account Verification"
      subtitle="We are validating your email"
      showLogo={true}
    >
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        {status === "loading" && (
          <Loader2 className="h-12 w-12 animate-spin text-[#a88d6f]" />
        )}
        {status === "success" && (
          <CheckCircle className="h-12 w-12 text-green-500" />
        )}
        {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}

        <p className="text-gray-700 font-medium">{message}</p>

        {status === "error" && (
          <Link
            to="/login"
            className="mt-4 text-sm font-semibold text-[#a88d6f] hover:underline"
          >
            Return to login
          </Link>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyAccount;
