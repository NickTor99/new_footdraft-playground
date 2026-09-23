import React from 'react';

function SidebarItem({ icon: Icon, label, active = false, onClick }){
    return(
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-slate-950'
                    : 'dark:text-slate-300 dark:hover:hover:text-blue-600 text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            }`}
        >
            <Icon size={20} />
            <span className="font-semibold text-sm">{label}</span>
        </button>
    )
}

export default SidebarItem
