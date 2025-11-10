import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LogIn } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { adminLogin } from "@/store/slices/loginSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const resultAction = await dispatch(adminLogin({ email, password }));
      if (adminLogin.fulfilled.match(resultAction)) {
        const data = resultAction.payload;
        if (data.success) {
          navigate("/dashboard");
        } else {
          const backendError =
            typeof data.error === "string"
              ? data.error
              : data.response?.message || "Login failed";
          if (
            backendError.includes("Invalid Email or Password") ||
            backendError.includes("admin")
          ) {
            setError("Invalid Email or Password");
          } else {
            setError(backendError || "Login failed");
          }
          setError(backendError);
        }
      } else if (adminLogin.rejected.match(resultAction)) {
        const payloadError = resultAction.payload;
        const errorMessage =
          typeof payloadError === "string"
            ? payloadError
            : (payloadError as any)?.error || "Login failed. Please try again.";
        if (
          errorMessage.includes("Invalid Email or Password for admin")
        ) {
          setError("Invalid Email or Password");
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="w-full overflow-hidden rounded-lg " style={{ maxWidth: '300px', minWidth: '300px' }}>
        <div className="flex h-full flex-col" style={{ aspectRatio: '5 / 8' }}>
          <Card className="flex h-full flex-col border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">CloudHouse Agent</CardTitle>
              <CardDescription>Sign in to start your session</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin} className="flex flex-1 flex-col">
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>

                {error && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    {error}
                  </p>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
