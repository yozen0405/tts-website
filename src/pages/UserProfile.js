import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData, getCardClass, translatePlan } from "../redux/slices/userSlice";
import { ClipLoader } from "react-spinners";
import "./UserProfile.css";

export default function UserProfile() {
    const dispatch = useDispatch();
    const { userData, isLoading, loaded } = useSelector((state) => state.profile);

    useEffect(() => {
        dispatch(fetchUserData());
    }, [dispatch, loaded]);

    return (
        <div className="user-profile-container">
            {isLoading ? (
                <div className="user-profile-loader">
                    <ClipLoader size={80} color={"#28b571"} />
                    <p className="loading-text">載入資料中，請稍候...</p>
                </div>
            ) : (
                <>
                    <div className={getCardClass(userData?.plan)}>
                        <h2>
                            您的層級：
                            <span id="user-plan">{translatePlan(userData?.plan) || "N/A"}</span>
                        </h2>
                        <p>
                            您目前的配額限制為 <strong>{userData?.quotaLimit || 0}</strong> 字。
                        </p>
                    </div>

                    <div className="user-profile-details">
                        <h3>使用者資訊</h3>
                        <ul className="user-profile-info-list">
                            <li>
                                <strong>電子郵件：</strong> {userData?.email || "N/A"}
                            </li>
                            <li>
                                <strong>使用配額：</strong> {userData?.quotaUsed || 0}/{userData?.quotaLimit || 0} 字
                            </li>
                            <li>
                                <strong>每次字數上限：</strong> {userData?.charLimit || "N/A"} 字
                            </li>
                            <li>
                                <strong>建立時間：</strong> {userData?.createdAt
                                    ? new Date(userData.createdAt).toLocaleDateString()
                                    : "N/A"}
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}