import SideBar from "./components/sidebar/SideBar.jsx";
import TopBar from "./components/topbar/TopBar.jsx";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {api} from './APIWrapper.js'
import LoadingComponent from "./components/generic/LoadingComponent.jsx";


export default function ProtectedRoute({children}){
    const [loading, setLoading] = useState(true);
    const isOpenSideBar = useSelector((state) => state.mainPageState.IsOpenSidebar);
    const [user, setUser] = useState({})
    const dispatch = useDispatch()

    const getUser = async () => {
        return await api.get('http://localhost:8000/users/me')
    }

    useEffect( () =>  {
        // Controlla se c'è un token al caricamento dell'app
        const token = localStorage.getItem('token');
        if (!token){
            window.location.href = '/login'
        } else{
            getUser()
                .then((user) => {
                    setUser(user)
                })
        }
        setLoading(false);
    }, []);


    return(
        <>
        {
            loading ? (
                <LoadingComponent msg={'Caricamento...'}/>
            ):
            (
                <div className="flex h-screen dark:bg-slate-700 bg-slate-50 overflow-hidden font-sans">
                    <SideBar isOpenSideBar={isOpenSideBar}></SideBar>
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <TopBar user={user}></TopBar>
                        {children}
                    </div>
                </div>
            )
        }
        </>

    )
}