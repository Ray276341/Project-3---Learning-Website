import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentResult = () => {
    const location = useLocation();
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Gửi query string từ frontend đến backend để xác thực
        console.log(location.search);
        const queryParams = new URLSearchParams(location.search);

        const fetchPaymentResult = async () => {
            axios.post(`http://localhost:3000/payment/vnpay_return${location.search}`)
                .then((response) => {
                    console.log(response);
                    setResult(response.data.vnp_Params);
                })
                .catch((error) => {
                    console.error('Error fetching payment result:', error);
                });

        }
        fetchPaymentResult();
    }, [location]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-md p-6 max-w-md">
                {result ? (
                    <div>
                        <h2 className={`text-lg font-bold ${result.vnp_ResponseCode === '00' ? 'text-green-600' : 'text-red-600'}`}>
                            {result.vnp_ResponseCode === '00' ? 'Giao dịch thành công' : 'Giao dịch thất bại'}
                        </h2>
                        {result.vnp_Amount && (<p className="mt-2">  <span className="font-bold">Số tiền: {parseFloat(result.vnp_Amount) / 100} VNĐ</span> </p>)}
                        <p className="mt-2">
                            <span className="font-bold">Mã giao dịch: </span>{result.vnp_TransactionNo}
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                            Trở về trang chủ
                        </button>
                    </div>
                ) : (
                    <p>Đang xử lý...</p>
                )
                }
            </div>
        </div>
    );
};

export default PaymentResult;
