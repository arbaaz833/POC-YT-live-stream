import { toast } from "react-toastify";

export const notify = {
  success: (text) => {
    return toast.success(text);
  },
  error: (text) => {
    return toast.error(text);
  },
};
