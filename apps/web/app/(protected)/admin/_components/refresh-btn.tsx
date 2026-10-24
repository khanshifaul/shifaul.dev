"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MdRefresh } from "react-icons/md";
const RefreshBtn = () => {
  const router = useRouter();
  return (
    <Button
      size={"sm"}
      aria-label="Refresh"
      onClick={() => {
        router.refresh();
      }}
    >
      <MdRefresh className="text-2xl" />
    </Button>
  );
};

export default RefreshBtn;
