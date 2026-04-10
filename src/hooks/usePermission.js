import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * RBAC hook — checks if the authenticated user has a specific permission.
 *
 * @param {string} module  - Module key matching the `permissions` map (e.g. "payments").
 * @param {string} action  - Action to check: "create" | "edit" | "delete" | "view".
 * @returns {boolean}      - `true` if the user has the requested permission.
 *
 * @example
 * // Hide a delete button unless the user can delete classes
 * const canDelete = usePermission("classes", "delete");
 * return canDelete ? <Button danger>Eliminar Clase</Button> : null;
 */
const usePermission = (module, action) => {
    const { permissions } = useContext(AuthContext);

    if (!module) return true; // No restriction specified → allowed
    if (!permissions || !permissions[module]) return false;
    if (!action) return true; // Module exists, no specific action required → allowed

    return permissions[module].actions?.includes(action) ?? false;
};

export default usePermission;
