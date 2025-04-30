import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || "/";

  // Demo users for easy login
  const demoUsers = [
    { email: "admin@example.com", role: "Admin" },
    { email: "supervisor@example.com", role: "Supervisor" },
    { email: "finance@example.com", role: "Finance" },
    { email: "vendor@example.com", role: "Vendor" },
    { email: "user@example.com", role: "User" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Login Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = async (email: string) => {
    setEmail(email);
    setPassword("password"); // All demo users have the same password
    try {
      setIsLoading(true);
      await login(email, "password");
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Demo Login Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">BNKIS</CardTitle>
            <CardDescription>Business Network and Knowledge Information System</CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-bnkis-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-500 mb-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-bnkis-primary hover:underline">
                  Register
                </Link>
              </p>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-center">Quick Demo Login</h4>
                <p className="text-xs text-gray-500 text-center">
                  Use password "password" for all demo accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map((user) => (
                    <Button
                      key={user.email}
                      variant="outline"
                      size="sm"
                      onClick={() => loginAsDemoUser(user.email)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      {user.role}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} BNKIS, Inc. All rights reserved.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
