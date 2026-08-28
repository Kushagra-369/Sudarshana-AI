import React, { useEffect, useState } from "react";
import {
    Navigate,
    useLocation,
} from "react-router-dom";

import { APIURL } from "./GlobalAPIURL";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const location = useLocation();

    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [authorized, setAuthorized] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const checkAuthentication = async () => {

            const token =
                localStorage.getItem("authToken");

            const storedUser =
                localStorage.getItem("authUser");

            // =====================================================
            // NO SAVED SESSION
            // =====================================================

            if (!token) {
                if (!cancelled) {
                    setAuthenticated(false);
                    setChecking(false);
                }

                return;
            }

            try {

                const response = await fetch(
                    `${APIURL}/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                // =====================================================
                // TOKEN REJECTED BY BACKEND
                // =====================================================

                if (!response.ok) {

                    console.warn(
                        "Auth token rejected:",
                        response.status,
                        data
                    );

                    /*
                     * IMPORTANT:
                     *
                     * Only remove auth data when backend
                     * explicitly says authentication is invalid.
                     *
                     * Do NOT localStorage.clear().
                     */

                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("authUser");
                    }

                    if (!cancelled) {
                        setAuthenticated(false);
                        setChecking(false);
                    }

                    return;
                }

                // =====================================================
                // INVALID RESPONSE
                // =====================================================

                if (!data.user) {

                    console.error(
                        "Authentication response did not contain user."
                    );

                    /*
                     * Don't destroy the existing session just because
                     * the response format is unexpected.
                     */

                    if (!cancelled) {
                        setAuthenticated(
                            Boolean(storedUser)
                        );
                        setChecking(false);
                    }

                    return;
                }

                // =====================================================
                // ROLE PROTECTION
                // =====================================================

                if (
                    allowedRoles &&
                    !allowedRoles.includes(
                        data.user.role
                    )
                ) {

                    if (!cancelled) {
                        setAuthorized(false);
                        setAuthenticated(true);
                        setChecking(false);
                    }

                    return;
                }

                // =====================================================
                // UPDATE STORED USER
                // =====================================================

                localStorage.setItem(
                    "authUser",
                    JSON.stringify(data.user)
                );

                if (!cancelled) {
                    setAuthenticated(true);
                    setAuthorized(true);
                    setChecking(false);
                }

            } catch (error) {

                console.error(
                    "Authentication check failed:",
                    error
                );

                /*
                 * VERY IMPORTANT:
                 *
                 * Network/server failure is NOT the same as logout.
                 *
                 * NEVER clear localStorage here.
                 */

                if (!cancelled) {

                    const stillHasSession =
                        Boolean(
                            localStorage.getItem(
                                "authToken"
                            )
                        );

                    setAuthenticated(
                        stillHasSession
                    );

                    setChecking(false);
                }
            }
        };

        checkAuthentication();

        return () => {
            cancelled = true;
        };

    }, [location.pathname, allowedRoles]);

    // =====================================================
    // CHECKING
    // =====================================================

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

    // =====================================================
    // NOT AUTHENTICATED
    // =====================================================

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

    // =====================================================
    // WRONG ROLE
    // =====================================================

    if (!authorized) {
        return (
            <Navigate
                to="/signin"
                replace
            />
        );
    }

    // =====================================================
    // AUTHENTICATED
    // =====================================================

    return <>{children}</>;
};

export default ProtectedRoute;