import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticleDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8080/api/articles/" + id);
                const result = await response.json();
                
                if (response.ok && result.success) {
                    setArticle(result.data);
                } else {
                    throw new Error(result.message || "Không tìm thấy bài viết");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticleDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="homepage-wrapper">
                <div className="bg-light py-5 mb-4 border-bottom text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="homepage-wrapper">
                <div className="bg-light py-5 mb-4 border-bottom text-center">
                    <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                    <h2>Rất tiếc! Bài viết không tồn tại.</h2>
                    <Link to="/articles" className="btn btn-primary mt-3">Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="homepage-wrapper">
            {/* Phần Hero Section - Thay thành Tiêu đề bài viết */}
            <div className="bg-light py-5 mb-4 border-bottom">
                <div className="container text-center">
                    <h1 className="display-4 fw-bold text-primary" style={{ fontSize: '2.5rem' }}>{article.title}</h1>
                    <p className="lead text-muted">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Đăng ngày: {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                </div>
            </div>

            {/* Phần nội dung bài viết */}
            <div className="container mb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="p-4 border rounded bg-white shadow-sm">
                            {article.imageUrl && (
                                <div className="mb-4 text-center">
                                    <img 
                                        src={article.imageUrl} 
                                        alt={article.title} 
                                        className="img-fluid rounded" 
                                        style={{ maxHeight: '450px', width: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            <div 
                                className="article-content fs-5" 
                                style={{ lineHeight: '1.8', color: '#333' }}
                                dangerouslySetInnerHTML={{ __html: article.content }} 
                            />
                        </div>

                        <div className="mt-4 text-center">
                            <Link to="/articles" className="btn btn-outline-secondary">
                                <i className="fas fa-arrow-left me-2"></i> Trở về danh sách
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetail;