import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import SyncUser from "./components/SyncUser";
import "./globals.css";

export const metadata = {
  title: "CleanOps",
  description: "Cleaning company management app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ThemeProvider>
            <SyncUser />
            <Navbar />
            <main style={{ paddingTop: "24px" }}>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
