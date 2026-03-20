import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isAuth } = useAuth();
    const location = useLocation();

    // Nếu chưa đăng nhập
    if (!isAuth) {
        // Chuyển hướng về /login, nhưng GHI NHỚ trang họ đang định vào (state: { from... })
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu đã đăng nhập, cho phép vào trong
    return children;
};

export default ProtectedRoute;