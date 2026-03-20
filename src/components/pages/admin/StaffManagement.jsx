import React, { useState, useEffect } from 'react';

const StaffManagement = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [editingStaff, setEditingStaff] = useState(null);
    const [viewingStaff, setViewingStaff] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Toast notification
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Pagination state
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState('Name');
    const [sortDir, setSortDir] = useState('Ascending');

    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        isActive: true,
        profilePictureUrl: ''
    });

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Show confirm modal
    const showConfirm = (message, onConfirm) => {
        setConfirmAction({ message, onConfirm });
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        if (confirmAction && confirmAction.onConfirm) {
            confirmAction.onConfirm();
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    useEffect(() => {
        fetchStaffs();
    }, [pageNumber, pageSize, search, sortBy, sortDir]);

    const fetchStaffs = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                PageNumber: pageNumber,
                PageSize: pageSize,
                SortBy: sortBy,
                SortDir: sortDir
            });

            if (search) {
                params.append('Search', search);
            }

            const response = await fetch(`https://localhost:7111/api/StaffManage/paginated?${params}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();

                if (result.success && result.data) {
                    setStaffs(result.data.items || []);
                    setTotalCount(result.data.totalCount || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching staffs:', error);
            showToast('Không thể tải dữ liệu!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPageNumber(1);
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchInput('');
        setPageNumber(1);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'Ascending' ? 'Descending' : 'Ascending');
        } else {
            setSortBy(column);
            setSortDir('Ascending');
        }
        setPageNumber(1);
    };

    const handleAddNew = () => {
        setEditingStaff(null);
        setFormData({
            name: '',
            phoneNumber: '',
            address: '',
            dateOfBirth: '',
            isActive: true,
            profilePictureUrl: ''
        });
        setImagePreview(null);
        setShowModal(true);
    };

    const handleView = async (id) => {
        try {
            const response = await fetch(`https://localhost:7111/api/StaffManage/${id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setViewingStaff(result.data);
                    setShowViewModal(true);
                }
            } else {
                showToast('Không tìm thấy dữ liệu!', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Có lỗi xảy ra!', 'error');
        }
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);

        const dateOfBirth = staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : '';

        setFormData({
            id: staff.id,
            name: staff.name,
            phoneNumber: staff.phoneNumber,
            address: staff.address,
            dateOfBirth: dateOfBirth,
            isActive: staff.isActive,
            profilePictureUrl: staff.profilePictureUrl || ''
        });

        setImagePreview(staff.profilePictureUrl ? `https://localhost:7111${staff.profilePictureUrl}` : null);
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showToast('Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP)!', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Kích thước ảnh tối đa 5MB!', 'error');
            return;
        }

        try {
            setUploading(true);

            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch('https://localhost:7111/api/UploadMedia', {
                method: 'POST',
                credentials: 'include',
                body: formDataUpload
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update form data with uploaded image URL
                setFormData(prev => ({
                    ...prev,
                    profilePictureUrl: result.data
                }));

                // Set preview
                setImagePreview(`https://localhost:7111${result.data}`);
                showToast('Tải ảnh lên thành công!', 'success');
            } else {
                showToast(result.message || 'Upload ảnh thất bại!', 'error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Không thể tải ảnh lên!', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            profilePictureUrl: ''
        }));
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;

            if (editingStaff) {
                response = await fetch(`https://localhost:7111/api/StaffManage`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`https://localhost:7111/api/StaffManage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            }

            const result = await response.json();

            if (response.ok && result.success) {
                showToast(result.message, 'success');
                setShowModal(false);
                fetchStaffs();
            } else {
                showToast(result.message || 'Có lỗi xảy ra!', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Không thể kết nối tới server!', 'error');
        }
    };

    const handleToggleActive = (id, currentStatus) => {
        const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';

        showConfirm(
            `Bạn có chắc muốn ${action} nhân viên này?`,
            async () => {
                try {
                    const response = await fetch(`https://localhost:7111/api/StaffManage/soft-delete?id=${id}`, {
                        method: 'PATCH',
                        credentials: 'include'
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        const successMessage = currentStatus
                            ? 'Vô hiệu hóa nhân viên thành công!'
                            : 'Kích hoạt nhân viên thành công!';

                        showToast(successMessage, 'success');
                        fetchStaffs();
                    } else {
                        showToast(result.message || 'Không thể thực hiện!', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Có lỗi xảy ra!', 'error');
                }
            }
        );
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const startRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalCount);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNumber(newPage);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (pageNumber <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (pageNumber >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = pageNumber - 1; i <= pageNumber + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="container-fluid px-4">
            {/* Toast Notification */}
            {toast.show && (
                <div
                    className="position-fixed top-0 end-0 p-3"
                    style={{ zIndex: 9999 }}
                >
                    <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                        <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                        {toast.message}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setToast({ show: false, message: '', type: '' })}
                        ></button>
                    </div>
                </div>
            )}

            <h1 className="mt-4">Quản lý Nhân viên</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><a href="/admin">Dashboard</a></li>
                <li className="breadcrumb-item active">Nhân viên</li>
            </ol>
            <button className="btn btn-primary btn-sm mb-3" onClick={handleAddNew}>
                <i className="fas fa-plus me-2"></i>
                Thêm nhân viên
            </button>
            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1"></i>
                    Danh sách nhân viên
                </div>
                <div className="card-body">
                    {/* Toolbar */}
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                            >
                                <option value="5">5 dòng/trang</option>
                                <option value="10">10 dòng/trang</option>
                                <option value="25">25 dòng/trang</option>
                                <option value="50">50 dòng/trang</option>
                            </select>
                        </div>
                        <div className="col-md-9">
                            <form onSubmit={handleSearch} className="d-flex">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder="Tìm kiếm..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary me-2">
                                    <i className="fas fa-search"></i>
                                </button>
                                {search && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleClearSearch}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <table className="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Ảnh</th>
                                        <th
                                            onClick={() => handleSort('Name')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Tên nhân viên
                                            {sortBy === 'Name' && (
                                                <i className={`fas fa-sort-${sortDir === 'Ascending' ? 'up' : 'down'} ms-1`}></i>
                                            )}
                                        </th>
                                        <th>Số điện thoại</th>
                                        <th>Địa chỉ</th>
                                        <th>Ngày sinh</th>
                                        <th>Trạng thái</th>
                                        <th style={{ width: '150px' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffs.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                {search ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu'}
                                            </td>
                                        </tr>
                                    ) : (
                                        staffs.map((staff) => (
                                            <tr key={staff.id}>
                                                <td className="text-center">
                                                    {staff.profilePictureUrl ? (
                                                        <img
                                                            src={`https://localhost:7111${staff.profilePictureUrl}`}
                                                            alt={staff.name}
                                                            className="rounded-circle"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mx-auto"
                                                            style={{ width: '50px', height: '50px' }}
                                                        >
                                                            <i className="fas fa-user"></i>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{staff.name}</td>
                                                <td>{staff.phoneNumber}</td>
                                                <td>{staff.address}</td>
                                                <td>
                                                    {staff.dateOfBirth
                                                        ? new Date(staff.dateOfBirth).toLocaleDateString('vi-VN')
                                                        : '-'
                                                    }
                                                </td>
                                                <td>
                                                    {staff.isActive ? (
                                                        <span className="badge bg-success">Hoạt động</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Vô hiệu hóa</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-info btn-sm me-1"
                                                        onClick={() => handleView(staff.id)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-warning btn-sm me-1"
                                                        onClick={() => handleEdit(staff)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${staff.isActive ? 'btn-secondary' : 'btn-success'}`}
                                                        onClick={() => handleToggleActive(staff.id, staff.isActive)}
                                                        title={staff.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                    >
                                                        <i className={`fas fa-${staff.isActive ? 'ban' : 'check'}`}></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <div className="mb-2 mb-md-0">
                                    Hiển thị {startRecord} - {endRecord} của {totalCount} bản ghi
                                </div>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(1)}
                                                disabled={pageNumber === 1}
                                            >
                                                <i className="fas fa-angle-double-left"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNumber - 1)}
                                                disabled={pageNumber === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                        </li>
                                        {getPageNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <li key={`ellipsis-${index}`} className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            ) : (
                                                <li
                                                    key={page}
                                                    className={`page-item ${pageNumber === page ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            )
                                        ))}
                                        <li className={`page-item ${pageNumber === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNumber + 1)}
                                                disabled={pageNumber === totalPages}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </li>
                                        <li className={`page-item ${pageNumber === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={pageNumber === totalPages}
                                            >
                                                <i className="fas fa-angle-double-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-question-circle text-warning me-2"></i>
                                    Xác nhận
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCancelConfirm}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">{confirmAction?.message}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancelConfirm}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleConfirm}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-4">
                                            {/* Image Upload */}
                                            <div className="mb-3">
                                                <label className="form-label">Ảnh đại diện</label>
                                                <div className="text-center">
                                                    {imagePreview ? (
                                                        <div className="position-relative d-inline-block">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="rounded"
                                                                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                                onClick={handleRemoveImage}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="border rounded d-flex align-items-center justify-content-center bg-light"
                                                            style={{ width: '200px', height: '200px', margin: '0 auto' }}
                                                        >
                                                            <i className="fas fa-user fa-4x text-muted"></i>
                                                        </div>
                                                    )}
                                                    <div className="mt-2">
                                                        <input
                                                            type="file"
                                                            id="imageUpload"
                                                            className="d-none"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            disabled={uploading}
                                                        />
                                                        <label
                                                            htmlFor="imageUpload"
                                                            className={`btn btn-sm btn-outline-primary ${uploading ? 'disabled' : ''}`}
                                                        >
                                                            {uploading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Đang tải...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-upload me-2"></i>
                                                                    Chọn ảnh
                                                                </>
                                                            )}
                                                        </label>
                                                        <div className="form-text">
                                                            Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP). Tối đa 5MB.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="mb-3">
                                                <label className="form-label">Tên nhân viên <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Nhập tên nhân viên"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Địa chỉ <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Ngày sinh <span className="text-danger">*</span></label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        name="isActive"
                                                        id="isActive"
                                                        checked={formData.isActive}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="isActive">
                                                        Hoạt động
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        <i className={`fas fa-${editingStaff ? 'save' : 'plus'} me-2`}></i>
                                        {editingStaff ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal View Detail */}
            {showViewModal && viewingStaff && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết nhân viên</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowViewModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {viewingStaff.profilePictureUrl && (
                                    <div className="text-center mb-3">
                                        <img
                                            src={`https://localhost:7111${viewingStaff.profilePictureUrl}`}
                                            alt={viewingStaff.name}
                                            className="rounded-circle"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '40%' }}>ID:</th>
                                            <td><code>{viewingStaff.id}</code></td>
                                        </tr>
                                        <tr>
                                            <th>Tên nhân viên:</th>
                                            <td><strong>{viewingStaff.name}</strong></td>
                                        </tr>
                                        <tr>
                                            <th>Số điện thoại:</th>
                                            <td>{viewingStaff.phoneNumber}</td>
                                        </tr>
                                        <tr>
                                            <th>Địa chỉ:</th>
                                            <td>{viewingStaff.address}</td>
                                        </tr>
                                        <tr>
                                            <th>Ngày sinh:</th>
                                            <td>
                                                {viewingStaff.dateOfBirth
                                                    ? new Date(viewingStaff.dateOfBirth).toLocaleDateString('vi-VN')
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Trạng thái:</th>
                                            <td>
                                                {viewingStaff.isActive ? (
                                                    <span className="badge bg-success">Hoạt động</span>
                                                ) : (
                                                    <span className="badge bg-secondary">Vô hiệu hóa</span>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Ngày tạo:</th>
                                            <td>
                                                {viewingStaff.createAt
                                                    ? new Date(viewingStaff.createAt).toLocaleString('vi-VN')
                                                    : 'Chưa có thông tin'
                                                }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleEdit(viewingStaff);
                                    }}
                                >
                                    <i className="fas fa-edit me-2"></i>
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;