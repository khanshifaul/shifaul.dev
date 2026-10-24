"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdDeleteForever } from "react-icons/md";

interface Props {
  Id: string;
  item: string;
  onDelete: (id: string) => void;
  prefetchAction: () => void;
}

const DeleteDialog = ({ Id, onDelete, prefetchAction }: Props) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleDelete = () => {
    setIsPending(true);
    onDelete(Id);
    setIsPending(false);
    prefetchAction();
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MdDeleteForever className="text-2xl text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button type="button">Cancel</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={handleDelete} type="button">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
