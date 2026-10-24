import { useDispatch, useSelector } from "react-redux";
import { toggleThemeMode } from '@/lib/store/slices/themeSlice';
import { RootState } from "../store";


const useTheme = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);

  const toggleMode = () => {
    dispatch(toggleThemeMode());
  };

  return { mode, toggleMode };
};

export default useTheme;
