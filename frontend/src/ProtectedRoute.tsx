import React, {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { APIURL } from "./GlobalAPIURL";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<
  ProtectedRouteProps
> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();

  const [checking, setChecking] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [authorized, setAuthorized] =
    useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token =
        localStorage.getItem("authToken");

      // No token = not logged in
      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `${APIURL}/me`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        // Backend rejected token/user
        if (!response.ok) {
          localStorage.clear();

          setAuthenticated(false);
          setChecking(false);

          return;
        }

        // Invalid response
        if (!data.user) {
          localStorage.clear();

          setAuthenticated(false);
          setChecking(false);

          return;
        }

        // Role protection
        if (
          allowedRoles &&
          !allowedRoles.includes(
            data.user.role
          )
        ) {
          setAuthorized(false);
          setChecking(false);

          return;
        }

        // Keep latest user information
        localStorage.setItem(
          "authUser",
          JSON.stringify(data.user)
        );

        setAuthenticated(true);
        setAuthorized(true);

      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        localStorage.clear();

        setAuthenticated(false);

      } finally {
        setChecking(false);
      }
    };

    checkAuthentication();
  }, [
    location.pathname,
    allowedRoles,
  ]);

  // --------------------------------------------------
  // CHECKING AUTHENTICATION
  // --------------------------------------------------

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080D0C",
          color: "#E6E8E3",
          fontFamily:
            '"Inter", sans-serif',
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // --------------------------------------------------
  // NOT AUTHENTICATED
  // --------------------------------------------------

  if (!authenticated) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // --------------------------------------------------
  // WRONG ROLE
  // --------------------------------------------------

  if (!authorized) {
    return (
      <Navigate
        to="/signin"
        replace
      />
    );
  }

  // --------------------------------------------------
  // AUTHENTICATED + AUTHORIZED
  // --------------------------------------------------

  return <>{children}</>;
};

export default ProtectedRoute;