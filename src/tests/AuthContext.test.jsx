import React, { useContext } from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthContext, AuthProvider } from "../context/AuthContext";

// --- Mocks ---------------------------------------------------------------
jest.mock("../features/auth/services/authService.jsx", () => ({
    authService: {
        me: jest.fn().mockResolvedValue({ data: {} }),
        updateSettings: jest.fn().mockResolvedValue({}),
    },
}));

jest.mock("i18next", () => ({
    __esModule: true,
    default: { changeLanguage: jest.fn(), t: (key) => key },
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
const renderAuth = () => renderHook(() => useContext(AuthContext), { wrapper });

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

describe("AuthContext", () => {
    test("hasPermission reflects the stored permission map (action→scope object)", () => {
        localStorage.setItem(
            "permissions",
            JSON.stringify({ students: { actions: { view: "own", create: "own" } } })
        );

        const { result } = renderAuth();

        expect(result.current.hasPermission("students:view")).toBe(true);
        expect(result.current.hasPermission("students:delete")).toBe(false);
        expect(result.current.hasPermission("teachers:view")).toBe(false);
    });

    test("getScope returns the scope of a granted action, or null when absent", () => {
        localStorage.setItem(
            "permissions",
            JSON.stringify({ classes: { actions: { view: "all", edit: "own" } } })
        );

        const { result } = renderAuth();

        expect(result.current.getScope("classes", "view")).toBe("all");
        expect(result.current.getScope("classes", "edit")).toBe("own");
        expect(result.current.getScope("classes", "delete")).toBeNull();
        expect(result.current.getScope("teachers", "view")).toBeNull();
    });

    test("login persists token and updates permissions in state", () => {
        const { result } = renderAuth();

        act(() =>
            result.current.login({
                token: "jwt-123",
                user: { id: 1, name: "Carlos" },
                permissions: { teachers: { actions: { view: "all" } } },
            })
        );

        expect(localStorage.getItem("token")).toBe("jwt-123");
        expect(result.current.user).toEqual({ id: 1, name: "Carlos" });
        expect(result.current.hasPermission("teachers:view")).toBe(true);
        expect(result.current.getScope("teachers", "view")).toBe("all");
    });

    test("logout clears the session", () => {
        const { result } = renderAuth();

        act(() => result.current.login({ token: "jwt-123", user: { id: 1 } }));
        act(() => result.current.logout());

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
    });

    test("safeParseItem tolerates a literal 'undefined' string in storage", () => {
        localStorage.setItem("user", "undefined");

        const { result } = renderAuth();

        expect(result.current.user).toBeNull();
    });
});
