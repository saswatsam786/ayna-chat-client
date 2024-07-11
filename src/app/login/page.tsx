"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

// Define the schema for form validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type Props = {};

const Login = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset errors
    setErrors({});

    // Validate form data
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      // Set validation errors
      const validationErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((error) => {
        if (error.path[0] === "email") {
          validationErrors.email = error.message;
        }
        if (error.path[0] === "password") {
          validationErrors.password = error.message;
        }
      });
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post("https://ayna-strapi-backend-zo3y.onrender.com/api/auth/local", {
        identifier: email,
        password: password,
      });

      setToken(response.data, router);
      router.push("/");
      return;
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
