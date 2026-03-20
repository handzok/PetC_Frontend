import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="homepage-wrapper">
            {/* Phần Hero Section - Dùng class của Bootstrap thuần */}
            <div className="bg-light py-5 mb-4 border-bottom">
                <div className="container text-center">
                    <h1 className="display-4 fw-bold text-primary">Welcome to PetSpa</h1>
                    <p className="lead text-muted">
                        Dịch vụ chăm sóc thú cưng chuyên nghiệp, tận tâm và nhanh chóng.
                    </p>
                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                        {/* Dùng thẻ Link của react-router-dom và gắn class của Bootstrap */}
                        <Link to="/booking" className="btn btn-primary btn-lg px-4 gap-3">
                            Đặt lịch ngay
                        </Link>
                        <Link to="/services" className="btn btn-outline-secondary btn-lg px-4">
                            Xem dịch vụ
                        </Link>
                    </div>
                </div>
            </div>

            {/* Phần giới thiệu ngắn */}
            <div className="container">
                <div className="row text-center g-4">
                    <div className="col-md-4">
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <h3>Chăm sóc</h3>
                            <p>Tắm rửa, vệ sinh sạch sẽ cho bé yêu của bạn.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <h3>Làm đẹp</h3>
                            <p>Cắt tỉa lông theo phong cách hiện đại nhất.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <h3>Uy tín</h3>
                            <p>Đội ngũ nhân viên giàu kinh nghiệm và yêu động vật.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;