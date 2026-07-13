import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date: Date | string) => {
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatTimeAgo = (date: Date | string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
