import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ResetPassword() {
  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Type and confirm your new password below"
      showLogo={true}
    >
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            label="New Password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <Input
          label="Confirm New Password"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          required
        />

        <Button type="submit">Save new password</Button>
      </form>
    </AuthLayout>
  );
}
