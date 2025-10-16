import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button"; // adjust path
import { LogOut } from "lucide-react";
import { useToast } from "../hooks/use-toast"; // adjust path

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/"); // redirect to home/login
  };

  return (
    <footer className="flex-shrink-0 p-2">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut className="h-6 w-6 text-primary" />
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
