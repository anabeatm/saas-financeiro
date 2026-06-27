export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="mt-4 w-full flex items-center justify-center cursor-pointer rounded-lg bg-[#a88d6f] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#d6bfa7] focus:outline-none focus:ring-2 focus:ring-[#cb9d6c] focus:ring-offset-2"
    >
      {children}
    </button>
  );
}
