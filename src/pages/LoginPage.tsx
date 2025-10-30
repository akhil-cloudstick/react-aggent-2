// src/pages/LoginPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-hot-toast";
import { LogIn } from "lucide-react";


export default function LoginPage() {
  const navigate = useNavigate();
  const email = "akhil@example.com";
  const password = "password";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "akhil@example.com" && password === "password") {
      toast.success("Login Successful! Welcome back, Akhil!");
      navigate("/dashboard");
    } else {
      toast.error("Login Failed. Invalid email or password.");
    }
  };

  return (
   <main className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="w-full overflow-hidden rounded-lg " style={{ maxWidth: '300px', minWidth: '300px' }}>
        <div className="flex h-full flex-col" style={{ aspectRatio: '5 / 8' }}>
          <Card className="flex h-full flex-col border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">ERP Agent</CardTitle>
              <CardDescription>Sign in to start your session</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin} className="flex flex-1 flex-col">
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required defaultValue={email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required defaultValue={password} readOnly />
                </div>
                <Button type="submit" className="space-y-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
