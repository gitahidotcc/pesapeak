"use client";

import Link from "next/link";
import { AlertTriangle, LogIn, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AccountExistsMessage() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
          <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <CardTitle className="text-2xl font-bold">Account Already Exists</CardTitle>
        <CardDescription>
          This is a single-user system and an account has already been created.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            If you're the account owner, please sign in to access your account.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Link href="/auth/sign-in" className="block">
            <Button className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Existing Account
            </Button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <a
            href="https://pesapeak.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full" size="lg">
              <Server className="mr-2 h-4 w-4" />
              Self-Host Your Own Instance
            </Button>
          </a>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Want your own PesaPeak instance? Visit{" "}
          <a
            href="https://pesapeak.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            pesapeak.app
          </a>{" "}
          to learn how to self-host.
        </p>
      </CardContent>
    </Card>
  );
}

