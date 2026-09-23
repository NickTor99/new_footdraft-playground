import {ChevronRight, Shield} from "lucide-react";
import React from "react";

export default function MemberTab({member}){
    const isAdmin = member.userrole === 'Admin'
    return(
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <img src={member.imageurl} alt="Img" width={48} height={48} className='rounded-full'/>
                <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {member.username}
                        {isAdmin && <Shield size={14} className="text-blue-600" />}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-2 h-2 rounded-full ${member.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-xs text-slate-400 font-medium">{member.status}</span>
                    </div>
                </div>
            </div>
            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <ChevronRight size={20} />
            </button>
        </div>
    )
}