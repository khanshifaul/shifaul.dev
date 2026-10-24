"use client";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/store/hooks";
import { closeNav, openNav } from "@/lib/store/slices/navigationSlice";
import { FaBars, FaXmark } from "react-icons/fa6";
interface MenuTogglerProps {
  isOpen: boolean;
}

const MenuToggler = ({ isOpen }: MenuTogglerProps) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(isOpen ? closeNav() : openNav());
  };

  return (
    <Button variant="ghost" onClick={handleClick} className="cursor-pointer">
      {isOpen ? (
        <FaXmark className="text-5xl" />
      ) : (
        <FaBars className="text-5xl" />
      )}
    </Button>
  );
};

export default MenuToggler;
