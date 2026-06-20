import { renderHook, act } from "@testing-library/react";
import { useCrud } from "./useCrud";

// --- Mocks ---------------------------------------------------------------
const mockRequest = jest.fn();

jest.mock("./useFetch", () => ({
    __esModule: true,
    default: () => ({ request: mockRequest, loading: false, error: null }),
}));

// NOTE: CRA sets resetMocks: true, which wipes jest.fn return values before
// each test. `loading` must stay a plain fn so it keeps returning a hide() fn.
jest.mock("antd", () => ({
    message: {
        error: () => {},
        success: () => {},
        warning: () => {},
        loading: () => () => {}, // returns a hide() fn
    },
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const okResponse = { data: [], pagination: { total: 0, current: 1 } };

beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue(okResponse);
});

describe("useCrud", () => {
    test("handleDelete soft-deletes via PATCH /{id}/bin", async () => {
        const { result } = renderHook(() => useCrud("students", "Estudiantes"));

        await act(async () => {
            await result.current.handleDelete("123", "Estudiante");
        });

        expect(mockRequest).toHaveBeenCalledWith("students/123/bin", "PATCH");
    });

    test("handleBulkDelete sends every selected id to the recycle bin (PATCH /bin), not a hard DELETE", async () => {
        const { result } = renderHook(() => useCrud("students", "Estudiantes"));

        act(() => result.current.handleSelectRow("a", true));
        act(() => result.current.handleSelectRow("b", true));

        let onOkPromise;
        const fakeModal = { confirm: ({ onOk }) => { onOkPromise = onOk(); } };

        act(() => result.current.handleBulkDelete(fakeModal, (k) => k));
        await act(async () => { await onOkPromise; });

        expect(mockRequest).toHaveBeenCalledWith("students/a/bin", "PATCH");
        expect(mockRequest).toHaveBeenCalledWith("students/b/bin", "PATCH");
        // No permanent DELETE should ever be issued by a bulk delete
        const hardDeletes = mockRequest.mock.calls.filter(([, method]) => method === "DELETE");
        expect(hardDeletes).toHaveLength(0);
    });

    test("getAllItems includes a 2-char search term (threshold >= 2, consistent with the table)", async () => {
        const { result } = renderHook(() => useCrud("students", "Estudiantes"));

        act(() => result.current.setSearch("ab"));
        await act(async () => { await result.current.getAllItems(); });

        const exportCall = mockRequest.mock.calls
            .map(([url]) => url)
            .find((url) => url.startsWith("students/?"));
        expect(exportCall).toContain("search=ab");
    });

    test("row selection adds and removes keys", () => {
        const { result } = renderHook(() => useCrud("students", "Estudiantes"));

        act(() => result.current.handleSelectRow("a", true));
        expect(result.current.selectedKeys).toContain("a");

        act(() => result.current.handleSelectRow("a", false));
        expect(result.current.selectedKeys).not.toContain("a");
    });
});
