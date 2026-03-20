import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import RegisterPage from './components/pages/RegisterPage';
import LoginPage from './components/pages/LoginPage';
import { AuthProvider } from './components/AuthContext';
import HomePage from './components/pages/HomePage';
import BookingPage from './components/pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import PetTypeManagement from './components/pages/admin/PetTypeManagement';
import StaffManagement from './components/pages/admin/StaffManagement';
import ServiceManagement from './components/pages/admin/ServiceManagement';
import BookingManagement from './components/pages/admin/BookingManagement';
function About() {
    return <h1>About Page</h1>;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* User Routes with Header & Footer */}
                    <Route path="/" element={
                        <>
                            <Header />
                            <HomePage />
                            <Footer />
                        </>
                    } />
                    <Route path="/about" element={
                        <>
                            <Header />
                            <About />
                            <Footer />
                        </>
                    } />
                    <Route path="/booking" element={
                        <>
                            <Header />
                            <ProtectedRoute>
                                <BookingPage />
                            </ProtectedRoute>
                            <Footer />
                        </>
                    } />

                    {/* Admin Routes - NO Header/Footer */}
                    <Route path="/admin" element={
                        <AdminProtectedRoute>
                            <AdminLayout />
                        </AdminProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="services" element={<ServiceManagement/>} />
                        <Route path="pet-types" element={<PetTypeManagement />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="reports" element={<div>Báo cáo</div>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App;