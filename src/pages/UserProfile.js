import React, { useEffect, useState } from "react";
import { getUserData } from "../api/apiActions"; 
import Loader from "../components/Loader";
import "./UserProfile.css"; 

export default function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCardClass = (plan) => {
        switch (plan) {
            case "free":
                return "user-profile-card free";
            case "premium":
                return "user-profile-card premium";
            case "enterprise":
                return "user-profile-card enterprise";
            default:
                return "user-profile-card default";
        }
    };

    const translatePlan = (plan) => {
        switch (plan) {
            case "free":
                return "免費方案";
            case "premium":
                return "高級方案";
            case "enterprise":
                return "企業方案";
            default:
                return "未知方案";
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userDetails = await getUserData();
                setUserData(userDetails);
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="user-profile-container">
            {loading ? (
                <Loader />
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
                                <strong>使用配額：</strong> {userData?.quotaUsed || 0}/{userData?.quotaLimit || 0}
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