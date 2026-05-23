import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { ArrowLeft } from "lucide-react";

export default function Recover() {
  return (
    <AuthLayout
      title="Recover your password"
      subtitle="Inform your email to receive instructions"
      showLogo={true}
    >
      <form className="flex flex-col gap-4">
        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="example@email.com"
          required
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
