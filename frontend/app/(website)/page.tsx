import { redirect } from "next/navigation";

export const metadata = {
  title: "Random Frames OS",
  description: "Operating System for Random Frames Studio"
};

export default function WebsiteHomePage() {
  // Completely decoupled from the official portfolio website.
  // The root path now directly serves the OS.
  redirect("/login");
}
