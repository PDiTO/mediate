import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center w-full py-12">
      <LoaderCircle className="w-8 h-8 text-white animate-spin" />
    </div>
  );
}
