import GroupsPage from "./components/groups/GroupsPage.jsx";
import { useSelector, useDispatch } from 'react-redux'
import {setFeedback, setIsOpenSidebar} from './redux/mainPageSlice.js'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GroupSearched from './components/groups/GroupSearched.jsx'
import LoginPage from "./components/login/LoginPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RegisterPage from "./components/login/RegisterPage.jsx";
import ActionFeedback from './components/generic/ActionFeedback.jsx'
import GroupPageDetails from "./components/group/GroupPageDetails.jsx";
import DraftPage from "./components/draft/DraftPage.jsx";
import ServerOfflinePage from "./components/generic/ServerOfflinePage.jsx";
import Config from "./Config.jsx";
import UserConfig from "./UserConfig.jsx";



function App() {
    const isOpenSideBar = useSelector((state) => state.mainPageState.IsOpenSidebar);
    const feedback = useSelector((state) => state.mainPageState.feedback);
    const html = document.documentElement

    if(!('theme' in localStorage)) localStorage.setItem('theme', 'light')

    const dispatch = useDispatch()
    return (
        <BrowserRouter>
            <>
                <Routes>
                    <Route
                        path="/login"
                        element={<LoginPage/>}
                    />
                    <Route
                        path="/register"
                        element={<RegisterPage/>}
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <GroupsPage/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notification"
                        element={
                            <ProtectedRoute>
                                <p>NOTIFICHE</p>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <UserConfig/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Config/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search/:groupId"
                        element={
                            <ProtectedRoute>
                                <GroupSearched/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/group/:groupId"
                        element={
                            <ProtectedRoute>
                                <GroupPageDetails/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/draft/:sessionId"
                        element={
                            <DraftPage/>
                        }
                    />
                    <Route
                        path='error'
                        element={
                            <ServerOfflinePage/>
                        }
                    />
                </Routes>

                {/* Overlay per Mobile quando la sidebar è aperta */}
                {isOpenSideBar && (
                    <div
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => dispatch(setIsOpenSidebar())}
                    />
                )}

                {feedback.active && (
                    <ActionFeedback
                        message={feedback.message}
                        type={feedback.type}
                        duration={feedback.duration}
                        onClose={() => dispatch(setFeedback(null))}
                    />
                )}
            </>
        </BrowserRouter>

    )
}

export default App
