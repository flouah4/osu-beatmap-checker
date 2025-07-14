import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function Layout({ children }) {
  return (
    <div className="bg-background h-screen flex border-4 overflow-hidden">
      <div className="flex flex-col w-full">
        <Topbar />
        <div className="flex h-full">
          <Sidebar />
          {children}
        </div>
      </div>
    </div>
  );
}
