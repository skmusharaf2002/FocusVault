import { useSelector, useDispatch } from "react-redux";

// Custom hooks for type-safe Redux usage
export const useAppSelector = useSelector;
export const useAppDispatch = () => useDispatch();

// Specific selector hooks
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,
    dispatch,
  };
};

export const useStudy = () => {
  const dispatch = useAppDispatch();
  const study = useAppSelector((state) => state.study);

  return {
    ...study,
    dispatch,
  };
};

export const useChat = () => {
  const dispatch = useAppDispatch();
  const chat = useAppSelector((state) => state.chat);

  return {
    ...chat,
    dispatch,
  };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);

  return {
    ...ui,
    dispatch,
  };
};
