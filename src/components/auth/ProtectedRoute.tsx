import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ component: Component, requireAdmin = false }: ProtectedRouteProps) => {
  const { error, getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Handle Auth0 Login Redirect
  useEffect(() => {
    // Stop the loop! If there is an error from Auth0 (like Service Not Found), DO NOT redirect.
    if (!isLoading && !isAuthenticated && !error) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, error, loginWithRedirect]);

  // Handle Backend Verification
  useEffect(() => {
    const verifyUser = async () => {
      if (!isLoading && isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
          
          const response = await fetch(`${apiUrl}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            console.error("Backend returned error status:", response.status);
            setVerificationError(`Authentication failed with status ${response.status}. Please log in again.`);
            setIsVerifying(false);
            return;
          }
          
          if (user && user.email_verified === false) {
            setVerificationError("Please verify your email address before accessing the platform.");
            setIsVerifying(false);
            return;
          }
          
          const dbUser = await response.json();

          if (dbUser.toc_accepted === false) {
            navigate("/terms", { replace: true });
            return;
          }

          if (requireAdmin && !dbUser.is_admin) {
            navigate("/", { replace: true });
            return;
          }
          
          setIsVerifying(false);
        } catch (error) {
          console.error("Verification failed:", error);
          setVerificationError("Unable to connect to the authentication server.");
          setIsVerifying(false);
        }
      }
    };

    verifyUser();
  }, [isLoading, isAuthenticated, getAccessTokenSilently, navigate, requireAdmin, loginWithRedirect, user]);

  if (error) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Auth0 Configuration Error</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <p className="text-sm text-muted-foreground mt-4 max-w-md">
          This usually means the VITE_AUTH0_AUDIENCE in your .env.local does not exactly match the Identifier of the API you created in the Auth0 Dashboard.
        </p>
      </div>
    );
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  if (isAuthenticated && isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading your secure workspace...</div>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Verification Failed</h2>
        <p className="text-muted-foreground mb-6">{verificationError}</p>
        <button 
          onClick={() => loginWithRedirect({ authorizationParams: { prompt: "login" } })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <Component />;
};
