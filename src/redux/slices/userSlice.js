import { createSlice } from "@reduxjs/toolkit";
import { getUserData } from "../../api/apiActions";

const initialState = {
    userData: null,
    isLoading: false,
    loaded: false,
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData(state, action) {
            state.userData = action.payload;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        setLoaded(state, action) {
            state.loaded = action.payload;
        },
        resetUserState() {
            return initialState;
        }
    },
});

export const { setUserData, setLoading, setError, setLoaded, resetUserState } = userSlice.actions;

export default userSlice.reducer;

export const fetchUserData = () => async (dispatch, getState) => {
    const { loaded } = getState().profile;

    if (loaded) {
        return;
    }

    dispatch(setLoading(true));
    try {
        const data = await getUserData();
        dispatch(setUserData(data));
        dispatch(setLoaded(true));
    } catch (error) {
        console.error("Error fetching user data:", error);
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

// Helper functions for class and plan translation
export const getCardClass = (plan) => {
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

export const translatePlan = (plan) => {
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