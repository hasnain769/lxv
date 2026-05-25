import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ component: Component, requireAdmin = false }: ProtectedRouteProps) => {
  const { error, getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Handle Auth0 Login Redirect
  useEffect(() => {
    // Stop the loop! If there is an error from Auth0 (like Service Not Found), DO NOT redirect.
    if (!isLoading && !isAuthenticated && !error) {
      loginWithRedirect({ appState: { returnTo: window.location.pathname } });
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
            setVerificationError("Please verify your email address before accessing the platform. Don't forget to check your spam folder!");
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
        <div className="flex flex-col items-center mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-4" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground border-4 border-white shadow-md mb-4">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-800">{user?.name || "User"}</h3>
          <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
          
          <button 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="text-sm text-destructive hover:underline font-medium"
          >
            Logout
          </button>
        </div>

        <h2 className="text-xl font-bold text-destructive mb-2">Verification Required</h2>
        <p className="text-muted-foreground mb-6">{verificationError}</p>
        <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-100 p-2 rounded">
          System Diagnostic: Auth0 reported email_verified={String(user?.email_verified)} for {user?.email}
        </p>
        <button 
          onClick={() => loginWithRedirect({ authorizationParams: { prompt: "login" } })}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-medium shadow-sm transition-all"
        >
          Refresh Verification Status
        </button>
      </div>
    );
  }

  return <Component />;
};
