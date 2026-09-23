import React, { useState } from 'react';
import {LayoutDashboard, Bell, Settings, User, LogOut, LoaderPinwheel} from 'lucide-react';
import SidebarItem from "./SideBarItem.jsx";
import { Link } from 'react-router-dom';
import { api } from "../../APIWrapper.js";


function SideBar(props){
    const [activeTab, setActiveTab] = useState('home');

    async function handleLogout() {
        await api.post('http://localhost:8000/auth/logout')
        localStorage.removeItem('token');
        window.location.href = '/login'

    }

    return(
        <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 h-100% bg-white border-r dark:bg-slate-800 dark:text-white border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${props.isOpenSideBar ? 'translate-x-0' : '-translate-x-full'}
      `}>
            <div className="flex flex-col h-full p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg dark:shadow-slate-950 shadow-blue-200">
                        <LoaderPinwheel size={22}  />
                    </div>
                    <span className="text-xl font-black dark:text-white text-slate-800 tracking-tight">FootDraft</span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                    <Link to='/'>
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Home / Gruppi"
                            active={activeTab === 'home'}
                            onClick={() => setActiveTab('home')}
                        />
                    </Link>

                    <Link to='/notification'>
                        <SidebarItem
                            icon={Bell}
                            label="Notifiche"
                            active={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />
                    </Link>

                    <Link to='/profile'>
                        <SidebarItem
                            icon={User}
                            label="Profilo"
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                    </Link>

                    <Link to='/settings'>
                        <SidebarItem
                            icon={Settings}
                            label="Impostazioni"
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        />
                    </Link>

                </nav>

                {/* User Footer */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 dark:text-slate-300 dark:hover:text-red-500 hover:text-red-500 transition-colors font-semibold text-sm">
                        <LogOut size={20} />
                        Esci
                    </button>
                </div>
            </div>
        </aside>
    )

}

export default SideBar